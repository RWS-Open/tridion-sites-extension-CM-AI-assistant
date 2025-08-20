import { styled } from "styled-components"
import { Button, Card, Flex, Space, Typography, Spin, Tooltip } from 'antd';
import { GoCopy } from "react-icons/go";
import { AiGeneratedContent, AiPromptProps } from 'src/types'
import { LoadingOutlined, SaveOutlined, SyncOutlined } from "@ant-design/icons"
import { MouseEvent, useEffect, useRef, useState } from "react";
import { Component, ItemsService, ModelType } from "@tridion-sites/open-api-client";
import { useNotifications } from "@tridion-sites/extensions";
import { TcmUri } from "@tridion-sites/models";
interface AiResponsesProps {
    aiGeneratedContent: AiGeneratedContent[];
    aiContentLoading: boolean;
    aiPrompt: AiPromptProps;
    tcmUri: TcmUri;
    schemaId:string
    regenerateAiContent: (e:MouseEvent<HTMLButtonElement>) => void;
}
const { Text } = Typography;

const CopyButton = styled(Button)`
    width: 40px;
    background:rgba(0,0,0,0.04);
    border:transparent;
    margin-top:10px;
    font-size:14px;
    &:hover{
        background: #007373 !important;
        border-color: #007373 !important;
        color:#ffffff !important;
    }
`
const CopyText = styled(Text)`
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    background:rgba(0,0,0,0.04);
    padding: 7px 10px;
    margin-top: 10px;
    cursor: pointer;
    white-space: pre-line;
    button{
        color:#758099 !important;
    }
    &:hover{
        background: #007373 !important;
        border-color: #007373 !important;
        color:#ffffff !important;
    }
    &:hover button{
        color:#ffffff !important;
    }
`

const GoCopyIcon = styled(GoCopy)`
    &:hover{
        color:#ffffff !important;
    }
`
const AiResponses = ({ aiGeneratedContent, aiContentLoading, aiPrompt, tcmUri,schemaId, regenerateAiContent }: AiResponsesProps) => {
    const { notify } = useNotifications();
    const scrollToBottomRef = useRef<HTMLDivElement>(null);
    const [isComponentCreating, setIsComponentCreating] = useState<boolean>(false)
    const createComponent = async (e: MouseEvent<HTMLButtonElement>) => {
        setIsComponentCreating(true)
        try {
            const id = e.currentTarget.id;
            const defaultSchemaModel: Component = await ItemsService.getDefaultModel({
                containerId: tcmUri.asString,
                modelType: ModelType.COMPONENT
            })
            defaultSchemaModel.Title = aiPrompt.context as string
            const aiContent = aiGeneratedContent.filter(item => item.id === id)[0]?.content
            //defaultSchemaModel.Schema.IdRef=schemaId as string
            defaultSchemaModel.Content = {
                ... defaultSchemaModel.Content,
                headline: aiPrompt.context,
                articleBody: [
                    {
                        content: aiContent,
                        //content: `Here are some steps on how to file a insurance claim: 1. Determine the type of claim you need to file. 2. Gather all the necessary documents. 3. Contact your insurance company. 4. Provide a detailed account of the incident. 5. Follow up on your claim.`
                    }
                ]
            }
            if(schemaId && defaultSchemaModel.Schema){
                defaultSchemaModel.Schema.IdRef = schemaId
            }
            try {
                const response = await ItemsService.create({
                    requestModel: defaultSchemaModel
                })
                console.log(response)
                notify({
                    showInMessageCenter: true,
                    title: "Success",
                    type: "success",
                    description: `"${response.Title}" Component created successfully! `,
                })
                setIsComponentCreating(false)
                //setAiGeneratedContent(null)
            } catch (error) {
                console.log("Failed to create component:", error)
                notify({
                    title: "Failed",
                    type: "error",
                    description: `Failed to create component:${error}`,
                })
                setIsComponentCreating(false)
            }
        } catch (error) {
            console.log("Failed to generate default model:", error)
            notify({
                title: "Failed",
                type: "error",
                description: `Failed to generate default model:${error}`,
            })
            setIsComponentCreating(false)
        }
    }

    useEffect(() =>{
        scrollToBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    },[])
    return (
        <Flex vertical style={{ overflowY: "auto", padding: "0px 25px" }} ref={scrollToBottomRef}>
            {
                aiGeneratedContent?.map((item, idx) => {
                    return (
                        <Flex vertical style={{ marginTop: 15 }} key={idx}>
                            <Card size="small" style={{ display: "flex", background: "#e3e5eb", marginBottom: 12, maxWidth: "80%", alignSelf: "flex-start" }}>
                                <Space>
                                    <Flex justify='flex-start' style={{ textAlign: 'left' }}>
                                        {item.prompt}
                                    </Flex>
                                </Space>
                            </Card>
                            <Card size="small" style={{ display: "flex", background: '#e3e5eb', marginBottom: 12, maxWidth: "80%", alignSelf: "flex-end" }}>
                                <Space>
                                    <Flex justify='flex-start' vertical>
                                        <Text style={{
                                            whiteSpace: "pre-line"
                                        }}>
                                            {item.content}
                                        </Text>
                                        <Flex align="center" gap={2}>
                                            <CopyText

                                                copyable={{ tooltips: ['Click to copy', "Copied!"], text: item.content, icon: <GoCopyIcon size={14} /> }}
                                            />
                                            <CopyButton
                                                id={item.id}
                                                disabled={aiPrompt.context === null || aiGeneratedContent.length === 0}
                                                onClick={createComponent}
                                                type="default"
                                                style={{
                                                    color: "#758099",
                                                }}>
                                                <Tooltip title="Create Component">
                                                    <SaveOutlined size={24} color="#758099" />
                                                </Tooltip>
                                            </CopyButton>
                                            <CopyButton
                                                id={item.id}
                                                disabled={aiPrompt.context === null || aiGeneratedContent.length === 0}
                                                onClick={regenerateAiContent}
                                                type="default"
                                                style={{
                                                    color: "#758099",
                                                }}
                                            >
                                                <Tooltip title="Retry">
                                                    <SyncOutlined />
                                                </Tooltip>
                                            </CopyButton>
                                        </Flex>
                                    </Flex>
                                </Space>
                            </Card>
                        </Flex>
                    )
                })
            }
            <Flex>
                {aiContentLoading &&
                    <Card style={{ width: "100%", background: "none", borderColor: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Spin spinning={aiContentLoading} indicator={<LoadingOutlined spin />} />
                    </Card>}
            </Flex>
        </Flex>
    )
}

export default AiResponses
