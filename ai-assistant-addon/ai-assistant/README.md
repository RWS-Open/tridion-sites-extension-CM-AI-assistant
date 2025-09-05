# Tridion Sites AI Assistant addon

## Overview

This add-on integrates an AI assistant into Tridion Sites 10.1, leveraging AWS Bedrock to generate content for components. It's a custom-built solution that requires specific configuration and deployment steps.

### Pre-requisites


1. [RWS](https://www.rws.com/) Tridion sites 10.1

2. [Nodejs](https://nodejs.org/en) (Latest)

3. AWS Bedrock Client Credentials (API Key, Access Key ID, Secret Access Key)


## Configuration

1. Configure Tridion Sites CM URL:
   
	- Navigate to the ai-assistant directory.
  
	- Open **package.json** and update the **target URL** in the dev script to your Tridion Sites CM URL:
	
	```json

		"dev": "webpack serve --config ./webpack.dev.config.js --progress --env target=https://[your-domain.com] manifest=../manifest.json config=../ai-assistant-addon.config"
      
      json
	```

2. Access Management:
   
   - Go to Access Management > Applications.
   
   - Double-click Tridion Sites Experience Space.
  
   - Add https://localhost:3000/ui/signin-oidc to the Allowed redirect URLs.
  
3. AWS Bedrock Configuration:
   
   - Generate AWS credentials (access key ID and secret access key) from the AWS console.
   
   - Open ai-assistant-addon.config.json and update the region, accessKeyId, and secretAccessKey.
   
   - The model id is pre-configured as **anthropic.claude-3-5-sonnet-20240620-v1:0**.
  
4. Prompt Configuration (Optional):
   
   - You can customize the prompts in ai-assistant-addon.config.json under the prompt section.
   
   - Placeholders like ${title} and ${metadata} can be rearranged but not removed.

### Build and Deploy

1. Install Dependencies:
	
   - Navigate to the ai-assistant folder and run npm install.

2. Build and Pack:
	
   - Run npm run build and then npm run pack to create the deployable .zip file.

3. Deploy
  
   - Go to Tridion Sites Add-ons (e.g., https://[your-domain.com]:83/addon/ui).
   
   - Upload the .zip file.
   
   - Once uploaded, select the add-on and upload the ai-assistant-addon.config.json file in the Configuration section.


## Usage

1. Navigate to a component in the Tridion Sites Content Manager.

2. Click the AI Assistant icon in the action panel.

3. In the assistant window, you can:
   
   - Enter a title and context and click Generate Content.
   
   - Check the box for Include Additional Context to select components and keywords to include in the prompt.

4. After the content is generated, you can copy it to the clipboard or click Create Component to save it directly.

5. Use the Retry button to regenerate content with the same prompt.