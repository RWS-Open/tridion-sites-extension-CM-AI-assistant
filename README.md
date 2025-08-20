\# Tridion Sites AI Assistant addon



\### Pre-requisites



1. Nodejs Latest
2. Tridion sites 10.1
3. AWS Bedrock Client Credentials





\## Configuration



1. Navigate to ai-assistant directory and update the Tridion Sites CM Url in package.json file as below

   "dev": "webpack serve --config ./webpack.dev.config.js --progress --env target=https://domain.com manifest=../manifest.json config=../ai-assistant-addon.config.json",
   
2. Generate the apikey, accessKeyId and secretAccessKey from the AWS Bedrock Client



&nbsp;	https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/



3\) Update the region, accessKeyId, secretAccessKey and model id as anthropic.claude-3-5-sonnet-20240620-v1:0 in the ai-assistant-addon.config.json file



4\) Prompt can be configured in the ai-assistant-addon.config.json file by modifying the below.





```json



&nbsp;	"prompt":{

&nbsp;		"promptWithoutAdditionalContext":"Write an article about the following title :${title} under the classification :${metadata}",

&nbsp;		"promptWithAdditionalContext":"Write an article about the following title :${title}, metadata :${metadata}, keywords :${tridion\_keywords} and additional context :${additionalContext}",

&nbsp;		"retryPrompt":"Retry the following :${prompt}"

&nbsp;	 }

```





Note: Placeholders(${title}, ${metadata}, ${tridion\_keywords}, ${addintionalContext} and ${prompt}) can be rearranged but do not remove the placeholders





\## Run the Extension



1. Open the ai-assistant folder in command prompt 
   
2. Run the below command to run the extension locally



&nbsp;	npm run dev



3\. Extension runs on port 3000 and can be accessed using the below URL



&nbsp;	https://localhost:3000/ui/







\## Build



1. Open the command prompt
   
2. Navigate to ai-assistant folder
   
3. Run the following command to build and pack the file



&nbsp;	a) npm run build

&nbsp;	b) npm run pack





&nbsp;	

\## Deploy 



1. Navigate to addons

&nbsp;	

&nbsp;	https://addons.tridiondemo.com:83/addon/ui



2\. Click on the Upload Add-on Package



3\. Select the zip file created above in the build steps



4\. Deploy the configuration file

&nbsp;	1) click on the uploaded addon, It will navigate to addon details

&nbsp;	2) Click on upload button in the configuration section to upload the ai-assistant-addon.config.json file



5\. After uploading the addon check the status of the addon







\## Usage



1. Navigate to Tridion Sites content manager



&nbsp;	https://sites.tridiondemo.com/ui/explorer?panel=information



2\. Navigate to content folder and select the component



3\. ai-assistant button will be shown after selecting the component only



3\. Click on the ai-assistant icon shown in action the panel







\### Steps to generate the Content using ai-assistant



1\. Enter title and context and click on generate content to generate the content



2\. Enter title, context and include additional content or keywords from Tridion Sites by selecting the checkbox Include Additional Context



&nbsp;	a. Selecting include additional context checkbox shows sidebar with components with folder tree structure 



&nbsp;	b. Additional content can be added by selecting component



&nbsp;	c. Keywords can be selected from the keywords input field(Multiple keywords cab be selected)

&nbsp;	

&nbsp;	d. Click on generate content button



3\. Content can be regenerated using the same previously used prompt by clicking on retry button below the generated content





\### Component Creation



After content is generated the component can be generated as below



1. Component can be created either manually copying the content to clipboard by clicking on the button click to copy  



2\. Clicking on the button create component available below the generated content































