import { useState, ChangeEvent, ReactNode } from 'react'
import { Flex, Typography, Input, Checkbox, CheckboxChangeEvent, TreeSelect } from 'antd'
import type { TreeDataNode } from 'antd';

import { AiPromptProps, IConfiguration } from 'src/types';
import { styled } from 'styled-components';
import { getConfiguration } from '@globals';
const { Title } = Typography;
const { TextArea } = Input;
type ValueType = string;
interface AiAssistantFormProps {
    aiPrompt: AiPromptProps;
    includeAdditionalContext: boolean;
    setAiPrompt: (aiPrompt: AiPromptProps) => void;
    handleAdditionalContext: (e: CheckboxChangeEvent) => void;
    categoryKeywords: TreeDataNode[]
}

const StyledTreeSelect = styled(TreeSelect<ValueType>)`
  &.ant-select {
    .ant-select-selector {
      border: 1px solid #ccc;
      border-radius: 6px;
      transition: all 0.3s;
    }

    &:hover .ant-select-selector {
      border-color: #005a5a !important;
    }

    &.ant-select-focused .ant-select-selector {
      border-color: #005a5a !important;
      box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2);
    }
  }`;

const AiAssistantBot = ({ aiPrompt, includeAdditionalContext, categoryKeywords, setAiPrompt, handleAdditionalContext }: AiAssistantFormProps) => {
    const configuration = getConfiguration<IConfiguration>();
    const [keywords, setKeywords] = useState<string>();
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const formData = {
            ...aiPrompt,
            [e.target.name]: e.target.value
        }
        setAiPrompt(formData)
    }
    const onChange = (newValue: string, labelList: ReactNode[]) => {
        //console.log(newValue, labelList);
        setKeywords(newValue);
        setAiPrompt({
            ...aiPrompt,
            tridion_keywords: labelList.join(",")
        })
    };
    //console.log(categoryKeywords)
    return (
        <Flex vertical style={{ position:"sticky", top:0, zIndex:10, padding: "10px 25px",background:"#f5f5f5" }}>
            <Title level={5} style={{ marginTop: 10, fontWeight:"normal" }}>{configuration?.extensionProperties.modalFormHeading}</Title>
            <Flex vertical gap={10}>
                <Input type='text' name="context" placeholder='title..' value={aiPrompt.context as string} onChange={handleChange} />
                <Input type='text' name="metadata" placeholder='Metadata...' value={aiPrompt.metadata as string} onChange={handleChange} />
                <Checkbox name="showContext" onChange={handleAdditionalContext}>
                    Include Additional Context from Tridion
                </Checkbox>
                {includeAdditionalContext &&
                    <>
                        <TextArea rows={3} name="additionalContext" placeholder='Additional Context...' value={aiPrompt.additionalContext as string} onChange={handleChange} />
                        <StyledTreeSelect
                            showSearch
                            value={keywords}
                            styles={{
                                popup: { root: { maxHeight: 400, overflow: 'auto' } },
                            }}
                            placeholder="Keywords from Tridion..."
                            allowClear
                            multiple
                            treeDefaultExpandAll={false}
                            onChange={onChange}
                            treeData={categoryKeywords}
                            treeCheckable
                            filterTreeNode={(input, treeNode) => treeNode.label.toLowerCase().includes(input.toLowerCase())}                            
                        />
                    </>
                }
                {/*  <Button type='primary' variant='solid'>Generate Content</Button> */}
            </Flex>
        </Flex>
    )
}

export default AiAssistantBot
