import { useState, memo, useEffect, MouseEvent } from "react";
import { ConfigProvider, theme, Layout, Divider, Flex, CheckboxChangeEvent, Tabs } from "antd";
import { ModalContent, ModalContentProps, ModalFooter, ModalHeader, useNotifications } from '@tridion-sites/extensions';
import { TcmUri } from '@tridion-sites/models';
import type { TreeDataNode } from 'antd';

import { BedrockAiService } from "src/Services/BedrockAiService";
import { AiGeneratedContent, AiPromptProps, BedRockModel, IConfiguration } from "src/types";

import AiAssistantBot from './AiAssistantBot';
import ComponentsList from "./ComponentsList";
import AiResponses from "./AiResponses";
import { ListsService } from "@tridion-sites/open-api-client";
import MetaData from "./MetaData";
import { DoubleLeftOutlined, DoubleRightOutlined } from "@ant-design/icons";
import { getConfiguration } from '@globals';

export interface AiAssistantProps extends ModalContentProps<number> {
    currentComponentId: string;
    currentFolderId: TcmUri;
    folderTitle: string;
    parentFolder: string;
    publicationId: string;
    schemaId:string
}
interface KeywordLink {
    $type: string;
    IdRef: string;
    Title: string;
}

interface Keyword {
    $type: string;
    Id: string;
    Title: string;
    Locale?: string;
    ParentKeywords?: KeywordLink[];
    RelatedKeywords?: unknown[];
}

interface Category {
    $type: string;
    Id: string;
    Title: string;
}

interface KeywordTreeNode {
    type: string;
    title: string;
    label: string;
    key: string;
    value: string;
    children: KeywordTreeNode[];
}

const { Content, Sider } = Layout;

const content = [{
    id: window.crypto.randomUUID(),
    content: "settlement Car Insurance: Claim Settlement When you purchase car insurance, you hope that you will never need to make a claim. However, accidents do happen, and when they do, it's important to know that your insurance company will be there to help you through the claim settlement process. The claim settlement process typically begins when you report the claim to your insurance company. You will need to provide details about the accident, such as the date, time, and location, as well as any injuries or damage that you sustained. Your insurance company will then investigate the claim and determine whether it is covered under your policy. If the claim",
    prompt: "Write a post about the following title :Car Insurance under the classification : claim"
}]
const AiAssistantModal = memo(({ currentFolderId, folderTitle, currentComponentId, parentFolder, publicationId,schemaId, onCancel, onConfirm }: AiAssistantProps) => {
    const configuration = getConfiguration<IConfiguration>();
    const bedrockClient = {
        BedrockRuntimeClient: {
            region: configuration?.BedrockRuntimeClient.region,
            credentials: {
                accessKeyId: configuration?.BedrockRuntimeClient.credentials.accessKeyId,
                secretAccessKey: configuration?.BedrockRuntimeClient.credentials.secretAccessKey
            }
        }
    } as IConfiguration
    const { notify } = useNotifications();

    const {
        token: { colorBgContainer },
    } = theme.useToken();
    const [showComponentList, setShowComponentList] = useState<boolean>(true);
    const [aiGeneratedContent, setAiGeneratedContent] = useState<AiGeneratedContent[]>([]);
    const [includeAdditionalContext, setIncludeAdditionalContext] = useState<boolean>(false)
    const [aiContentLoading, setAiContentLoading] = useState<boolean>(false);
    const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)
    const [categoryKeywords, setCategoryKeywords] = useState<TreeDataNode[]>([])
    const [aiPrompt, setAiPrompt] = useState<AiPromptProps>({
        metadata: null,
        context: null,
        additionalContext: null,
        tridion_keywords: null
    })

    useEffect(() => {
        setSelectedComponentId(currentComponentId)
        getCategorKeywords()
    }, [currentComponentId])

    const getCategorKeywords = async () => {
        const categories = await ListsService.getCategories({
            escapedPublicationId: publicationId
        });

        const filteredCategories = categories.filter(
            category => category.$type === "Category"
        );

        if (filteredCategories.length !== 0) {
            const categoryTree = await Promise.all(
                filteredCategories.map(async (category): Promise<KeywordTreeNode> => {
                    const keywords: any[] = await ListsService.getKeywords({
                        escapedItemId: category.Id
                    });

                    const keywordMap: Record<string, KeywordTreeNode> = {};
                    const roots: KeywordTreeNode[] = [];

                    keywords.forEach((keyword) => {
                        keywordMap[keyword.Id] = {
                            type: keyword.$type,
                            title: keyword.Title,
                            label: keyword.Title,
                            key: keyword.Id,
                            value: keyword.Id,
                            children: []
                        };
                    })

                    keywords.forEach(keyword => {
                        if (keyword.ParentKeywords?.length > 0) {
                            keyword.ParentKeywords.forEach((parent: KeywordLink) => {
                                const parentId = parent.IdRef;
                                if (keywordMap[parentId]) {
                                    keywordMap[parentId].children.push(keywordMap[keyword.Id]);
                                }
                            });
                        } else {
                            roots.push(keywordMap[keyword.Id]);
                        }
                    });

                    return {
                        type: category.$type,
                        title: category.Title,
                        label: category.Title,
                        key: category.Id,
                        value: category.Id,
                        children: roots
                    } as KeywordTreeNode;
                })
            );

            setCategoryKeywords(categoryTree);
        }

    }
    const generateAiContent = async () => {
        //console.log(configuration?.BedrockRuntimeClient?.prompt.promptWithAdditionalContext || '')

        //console.log(configuration?.BedrockRuntimeClient?.prompt.promptWithoutAdditionalContext || '')
        // const prompt = `Generate more content using the keywords: ${aiPrompt.metadata} and context: ${aiPrompt.context}`
        //const promptWithAdditionalContext = `Generate more content using the keywords: ${aiPrompt.metadata},${aiPrompt.tridion_keywords}, context: ${aiPrompt.context} and additional context ${aiPrompt.additionalContext}`

        const prompt = configuration?.BedrockRuntimeClient?.prompt.promptWithoutAdditionalContext
            .replace("${metadata}", aiPrompt.metadata || "" as string)
            .replace("${title}", aiPrompt.context || "" as string) as string

        const promptWithAdditionalContext = configuration?.BedrockRuntimeClient?.prompt.promptWithAdditionalContext
            .replace("${metadata}", aiPrompt.metadata || "" as string)
            .replace("${tridion_keywords}", aiPrompt.tridion_keywords || "" as string)
            .replace("${title}", aiPrompt.context || "" as string)
            .replace("${additionalContext}", aiPrompt.additionalContext || "" as string) as string

        const promptData = includeAdditionalContext ? promptWithAdditionalContext : prompt
        try {
            
            setAiContentLoading(true)
            const response = await BedrockAiService(promptData as string, bedrockClient, configuration?.BedrockRuntimeClient.model as BedRockModel);
            setAiGeneratedContent([
                ...aiGeneratedContent,
                {
                    id: window.crypto.randomUUID(),
                    prompt: promptData,
                    //content: response?.results[0]?.outputText
                    content:response?.content[0]?.text
                }
            ])
            setAiContentLoading(false)
        } catch (error) {
            console.log(error)
            setAiContentLoading(false)
            notify({
                title: "Failed",
                type: "error",
                description: "Failed to generate the content",
            })
        }
    }
    const regenerateAiContent = async(e:MouseEvent<HTMLButtonElement>) => {
        const id = e.currentTarget.id;
        const prompt = aiGeneratedContent.filter(item => item.id===id)[0].prompt;

        const retryPrompt = configuration?.BedrockRuntimeClient?.prompt.retryPrompt
        .replace("${prompt}", prompt || "" as string) as string
        try {
            
            setAiContentLoading(true)
            const response = await BedrockAiService(retryPrompt as string, bedrockClient, configuration?.BedrockRuntimeClient.model as BedRockModel);
            if(response){
                setAiGeneratedContent([
                    ...aiGeneratedContent,
                    {
                        id: window.crypto.randomUUID(),
                        prompt: retryPrompt,
                        //content: response?.results[0]?.outputText
                        content:response?.content[0]?.text
                    }
                ])
            }
            setAiContentLoading(false)
        } catch (error) {
            console.log(error)
            setAiContentLoading(false)
            notify({
                title: "Failed",
                type: "error",
                description: "Failed to generate the content",
            })
        }
    }
    const handleAdditionalContext = (e: CheckboxChangeEvent) => {
        if (e.target.checked) {
            setShowComponentList(false)
        }
        setIncludeAdditionalContext(!includeAdditionalContext)
    }
    const toggleComponentList = () => {
        setShowComponentList(!showComponentList)
    }
    return (
        <ConfigProvider theme={{
            components: {
                Checkbox: {
                    colorPrimary: "#005a5a",
                    colorPrimaryHover: "#005a5a",
                },
                Input: {
                    hoverBorderColor: "#005a5a",
                    activeBorderColor: "#005a5a"
                },
                Button: {
                    colorPrimary: "#007373",
                    colorPrimaryHover: "#005a5a",
                    colorPrimaryActive: "#005a5a",
                },
                Tabs: {
                    itemSelectedColor: "rgba(0, 0, 0, 0.88)",
                    inkBarColor: "#005a5a",
                }
            }
        }}>
            <ModalHeader title={configuration?.extensionProperties.modalHeaderTitle} />
            <ModalContent>
                <Layout style={{ height: "100%" }}>
                    <Sider trigger={null} collapsible collapsed={showComponentList} width="350" style={{ background: colorBgContainer, overflow: "hidden auto", height: "100%" }} defaultCollapsed={showComponentList}>
                        {!showComponentList &&

                            <Flex align="center" justify="space-between" style={{ width: "100%" }}>
                                <Tabs
                                    style={{
                                        width: "100%"
                                    }}
                                    tabBarStyle={{
                                        marginBottom: 0,
                                        padding: "0px 10px"
                                    }}
                                    items={
                                        [
                                            {
                                                key: "componentList",
                                                label: "Components",
                                                children: <ComponentsList
                                                    tcmUri={currentFolderId}
                                                    folderTitle={folderTitle}
                                                    parentFolder={parentFolder}
                                                    selectedComponentId={selectedComponentId as string}
                                                    showComponentList={showComponentList}
                                                    aiPrompt={aiPrompt}
                                                    setSelectedComponentId={setSelectedComponentId}
                                                    toggleComponentList={toggleComponentList}
                                                    setAiPrompt={setAiPrompt}
                                                />
                                            },
                                            /*  {
                                                 key: "metadata",
                                                 label: "Metadata",
                                                 children: <MetaData
                                                     categoryKeywords={categoryKeywords}
                                                 />,
 
                                             } */
                                        ]
                                    }
                                    tabBarExtraContent={{
                                        right: <DoubleLeftOutlined
                                            onClick={toggleComponentList}
                                            style={{
                                                padding: "15px 0"
                                            }}
                                        />
                                    }}
                                />

                            </Flex>
                        }
                        {showComponentList && <DoubleRightOutlined style={{ padding: "15px 35px" }} onClick={toggleComponentList} />}
                        <Divider style={{ margin: 0 }} />
                    </Sider>
                    <Layout>
                        <Content style={{
                            position: 'relative',
                            overflowY: 'auto',
                            height: '100%',
                        }}>
                            <Flex vertical style={{ width: "100%" }}>
                                <AiAssistantBot
                                    aiPrompt={aiPrompt}
                                    includeAdditionalContext={includeAdditionalContext}
                                    categoryKeywords={categoryKeywords}
                                    setAiPrompt={setAiPrompt}
                                    handleAdditionalContext={handleAdditionalContext}
                                />
                                <AiResponses
                                    aiPrompt={aiPrompt}
                                    tcmUri={currentFolderId}
                                    schemaId={schemaId}
                                    aiGeneratedContent={aiGeneratedContent}
                                    aiContentLoading={aiContentLoading}
                                    regenerateAiContent={regenerateAiContent}
                                />
                            </Flex>
                        </Content>
                    </Layout>

                </Layout>
            </ModalContent>
            <ModalFooter
                onCancel={onCancel}
                onOk={generateAiContent}
                okButtonLabel={aiContentLoading ? "Generating content Please wait..." : 'Generate Content'}
                cancelButtonLabel='Cancel'
                isOkButtonDisabled={(aiPrompt.context === null && aiPrompt.metadata === null && aiPrompt.additionalContext === null) || aiContentLoading}
            />

        </ConfigProvider>
    )
})

export default AiAssistantModal
