import { ReactNode } from "react";

export interface AiGeneratedContent {
    id:string;
    prompt: string;
    content: string;
}

export interface AiPromptProps {
    context: string | null;
    metadata: string | null;
    additionalContext?: string | null
    tridion_keywords?: string | null
}

export interface FolderItems {
    Type: string
    Id: string,
    Title: string;
    Icon: ReactNode;
    linkedSchema:string;
}

export interface IConfiguration {
    BedrockRuntimeClient: BedrockRuntimeClient,
    extensionProperties:ExtensionProperties
}

interface BedrockRuntimeClient{
    region:string;
    credentials:Credentials
    model:BedRockModel;
    prompt:Prompt
}

interface Credentials{
    accessKeyId: string;
    secretAccessKey: string
}

export interface BedRockModel{
    modelId: string;
    anthropic_version:string;
	max_tokens:number,
	temperature:number,
	role:string
}
interface Prompt{
    promptWithoutAdditionalContext: string;
    promptWithAdditionalContext: string;
    retryPrompt:string;
}
interface ExtensionProperties{
    modalHeaderTitle:string;
    modalFormHeading:string
}

export interface SchemaListTypes{
    value:string;
    label:string;
} 

export interface SchemaFields{
    value:string;
    label:string;
}