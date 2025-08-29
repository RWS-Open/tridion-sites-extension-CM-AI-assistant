import {
    BedrockRuntimeClient,
    InvokeModelCommand,
    InvokeModelCommandOutput
} from "@aws-sdk/client-bedrock-runtime";
import { Buffer } from "buffer";
import { getConfiguration } from '@globals';
import { BedRockModel, IConfiguration } from "src/types";

const configuration = getConfiguration<IConfiguration>();

export const BedrockAiService = async (promptData: string, bedRockClient:IConfiguration, model:BedRockModel) => {
   // console.log(configuration?.BedrockRuntimeClient.region)
    const client = new BedrockRuntimeClient(bedRockClient.BedrockRuntimeClient);
    const payload = {
        anthropic_version: model.anthropic_version,
        max_tokens: model.max_tokens,
        temperature: model.temperature,
        messages: [
          {
            role: model.role,
            content: [{ type: "text", text: promptData }],
          },
        ],
      };
    const input = {
        modelId: model.modelId,
        contentType: "application/json",
        accept: "application/json",
       /*  body: JSON.stringify({
            inputText: promptData
        }) */
        body:JSON.stringify(payload)
    };

    const command = new InvokeModelCommand(input);

    try {
        const response = await client.send(command) as InvokeModelCommandOutput;

        const uint8Array = response.body as Uint8Array;
        const responseBody = Buffer.from(uint8Array).toString("utf-8");

        //console.log("Model Response:", responseBody);
        return JSON.parse(responseBody);
    } catch (err) {
        console.error("Error invoking model:", err);
        return err as any
    }

}
