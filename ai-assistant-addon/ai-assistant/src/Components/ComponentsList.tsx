import { useState, useEffect, useCallback, memo } from 'react'
import { Button, Checkbox, CheckboxChangeEvent, Flex, List, Spin, Typography } from 'antd'
import { FieldsValueDictionary, ItemsService, OrganizationalItemsService, VersionedItem } from '@tridion-sites/open-api-client';
import { Component, OrganizationalItem, TcmUri, mapToModel } from '@tridion-sites/models';
import { LoadingOutlined, SyncOutlined } from '@ant-design/icons'
import { htmlToText } from "html-to-text";
import { AiPromptProps, FolderItems } from 'src/types';
import { CustomIcons } from 'src/CustomIcons';

const { Title, Text } = Typography
interface ComponentsListProps {
  tcmUri: TcmUri
  folderTitle: string
  selectedComponentId: string
  showComponentList: boolean;
  aiPrompt: AiPromptProps;
  parentFolder: string;
  toggleComponentList: () => void;
  setAiPrompt: (aiPrompt: AiPromptProps) => void;
  setSelectedComponentId: (compId: string) => void;
}
const ComponentsList = memo(({ tcmUri, folderTitle, selectedComponentId, aiPrompt, showComponentList, parentFolder, setSelectedComponentId, toggleComponentList, setAiPrompt }: ComponentsListProps) => {
  const [folderItems, setFolderItems] = useState<FolderItems[]>([]);
  const [containerId, setContainerId] = useState<string | null>(null);
  const [containerTitle, setContainerTitle] = useState<string | null>(null)
  useEffect(() => {
    fetchFolderItems(tcmUri.asString as string)
  }, [tcmUri])

  useEffect(() => {
    setContainerId(parentFolder)
    setContainerTitle(folderTitle)
  }, [parentFolder])

  const fetchFolderItems = useCallback(async (folderId: string) => {
    try {
      const folderItems = await OrganizationalItemsService.getItemsFromContainer({
        escapedContainerId: folderId,
        useDynamicVersion: true,
      });
      const filterComponents = folderItems.map(item => {
        return {
          Type: item.$type,
          Id: item.Id,
          Title: item.Title,
          Icon: CustomIcons[item.$type as string]
          //Icon: item.$type === "Component" ? CustomIcons.Component : CustomIcons.Folder
        }
      })
      setFolderItems(filterComponents as FolderItems[])
      const parentFolderId = folderItems[0].LocationInfo?.OrganizationalItem?.IdRef
      const parentFolderTitle = folderItems[0].LocationInfo?.OrganizationalItem?.Title
      setContainerId(parentFolderId as string)
      setContainerTitle(parentFolderTitle as string)
    } catch (error) {
      console.log(error)
    }

  }, [containerId])

  const fetchParentFolder = async (containerId: string) => {
    try {
      const response = await ItemsService.getItem({
        escapedItemId: containerId,
        useDynamicVersion: true
      })
      const parentItem: VersionedItem = response
      const orgItem = mapToModel(response) as OrganizationalItem
      if (!orgItem.isRootOrganizationalItem) {
        const parentFolderId = parentItem.LocationInfo?.OrganizationalItem?.IdRef
        const parentFolderTitle = parentItem.LocationInfo?.OrganizationalItem?.Title

        setContainerId(parentFolderId as string)
        setContainerTitle(parentFolderTitle as string)

        fetchFolderItems(parentFolderId as string)
      }
    } catch (error) {
      console.log(error)
    }

  }
  const handleChange = (e: CheckboxChangeEvent) => {
    const target = e.target as any
    setSelectedComponentId(target.value);
    const targetType = target['data-type']
    if (targetType === 'Component') {
      fetchComponentData(target.value)
    }
  }

  const fetchComponentData = async (compId: string) => {
    if (!compId) return;
    try {
      const response = await ItemsService.getItem({
        escapedItemId: compId,
        useDynamicVersion: true
      })
      const mapComponent = mapToModel<Component>(response)
      const data = mapComponent.content as FieldsValueDictionary
      const objectkeys = Object.keys(data)
      const content = objectkeys.filter(item => {
        return typeof (data[item]) === "object" && data[item] !== null && data[item] !== undefined && data[item][0] !== undefined && data[item][0].hasOwnProperty("content")
      })
      /*  setComponentData({
           headline: data["headline"],
           content: data[content[0]][0]?.content
       }) */
      const parsedContent = htmlToText(data[content[0]][0]?.content, {
        wordwrap: false,
        selectors: [
          { selector: 'a', options: { ignoreHref: true } },
          { selector: 'img', format: 'skip' } // skip image tag
        ]
      });
      const formData = {
        ...aiPrompt,
        "additionalContext": parsedContent
      }
      setAiPrompt(formData)
    } catch (error) {
      console.error('Failed to fetch item:', error);
    }
  }

  return (
    <Flex align="center" justify="center" style={{ padding: "5px 0px" }}>
      {
        !showComponentList
        &&
        <Flex justify="space-between" align="flex-start" style={{ width: "100%", padding: "5px 0px" }}>
          <Flex vertical>
            <Flex align="center" justify='space-between' gap={3} style={{ marginTop: 5, marginBottom: 10, paddingLeft: 10, paddingRight: 10 }}>
              <Flex>
                <span onClick={() => fetchParentFolder(containerId as string)} style={{ cursor: "pointer" }}>
                  {CustomIcons.Arrow}
                </span>
                <span>{CustomIcons.Folder}</span>
                <Title level={5} style={{ margin: 0 }}>
                  {containerTitle}
                </Title>
              </Flex>
              <Flex>
                <Button type='default' onClick={() =>fetchFolderItems(containerId as string)}>
                  <SyncOutlined />
                </Button>
              </Flex>

            </Flex>
            <List
              loading={{
                spinning: folderItems.length === 0,
                indicator: <Spin indicator={<LoadingOutlined spin />} />,
              }}
              itemLayout="horizontal"
              dataSource={folderItems}
              renderItem={(item) =>
                <List.Item
                  style={item.Id === selectedComponentId ? { background: "#e5f2f2", cursor: "pointer", padding: "10px 20px" } : { padding: "10px 20px" }}
                  onDoubleClick={item?.Type === "Folder" ? () => fetchFolderItems(item.Id) : undefined}
                  title={item.Type}
                >
                  <Checkbox
                    value={item.Id}
                    title={item.Title}
                    name="components"
                    data-type={item.Type}
                    checked={item.Id === selectedComponentId}
                    onChange={handleChange}
                    style={{
                      display: "flex",
                      alignItems: "center"
                    }}>
                    <Flex align="center">
                      <span>
                        {item.Icon}
                      </span>
                      <Text
                        style={{ width: 250 }}
                        ellipsis={{ tooltip: item.Title }}
                        title={item.Title}>{item.Title}</Text>
                    </Flex>
                  </Checkbox>
                </List.Item>
              }
            />
          </Flex>
        </Flex>
      }
    </Flex>
  )
})

export default ComponentsList
