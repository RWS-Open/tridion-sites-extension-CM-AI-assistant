import { useState, useEffect, useCallback, memo } from 'react'
import { Button, Checkbox, CheckboxChangeEvent, Flex, List, Spin, Typography } from 'antd'
import { FieldsValueDictionary, ItemsService, OrganizationalItemsService, VersionedItem, Component as SchemaLinkedComponent, RepositoryLocalObject } from '@tridion-sites/open-api-client';
import { Component, OrganizationalItem, TcmUri, mapToModel } from '@tridion-sites/models';
import { LoadingOutlined, SyncOutlined } from '@ant-design/icons'
import { htmlToText } from "html-to-text";
import { AiPromptProps, FolderItems, SchemaListTypes } from 'src/types';
import { CustomIcons } from 'src/CustomIcons';
import SchemaList from './SchemaList';

const { Title, Text } = Typography
interface ComponentsListProps {
  tcmUri: TcmUri;
  folderTitle: string;
  selectedComponentId: string;
  showComponentList: boolean;
  aiPrompt: AiPromptProps;
  parentFolder: string;
  selectedSchema: string;
  selectedFields: string;
  schemaList: SchemaListTypes[];
  setSchemaList: (schemaList: SchemaListTypes[]) => void;
  setSelectedSchema: (selectedSchema: string) => void;
  setSelectedFields: (selectedField: string) => void;
  setAiPrompt: (aiPrompt: AiPromptProps) => void;
  setSelectedComponentId: (compId: string) => void;
}
const ComponentsList = memo(({ tcmUri, folderTitle, selectedComponentId, aiPrompt, showComponentList, parentFolder, selectedSchema, selectedFields, schemaList, setSchemaList, setSelectedSchema, setSelectedFields, setSelectedComponentId, setAiPrompt }: ComponentsListProps) => {
  const [folderItems, setFolderItems] = useState<FolderItems[]>([]);
  const [containerId, setContainerId] = useState<string | null>(null);
  const [containerTitle, setContainerTitle] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  useEffect(() => {
    fetchFolderItems(tcmUri.asString as string)
  }, [tcmUri])

  useEffect(() => {
    setContainerId(parentFolder)
    setContainerTitle(folderTitle)
  }, [parentFolder])

  useEffect(() => {
    if (selectedSchema !== null) {
      // const filterComponentsBySchema = folderItems.filter(item => item.linkedSchema && item.linkedSchema===selectedSchema || item.Type==="Folder")
      //setFolderItems(filterComponentsBySchema)
      fetchFolderItems(containerId as string)
    }
  }, [selectedSchema])

  useEffect(() => {
    if (selectedFields) {
      fetchComponentData(selectedComponentId)
    }
  }, [selectedFields])

  // Fetch folder items
  const fetchFolderItems = useCallback(async (folderId: string) => {
    try {
      setIsLoading(true)
      const folderItems = await OrganizationalItemsService.getItemsFromContainer({
        escapedContainerId: folderId,
        useDynamicVersion: true,
      });
      const items = selectedSchema ? filterBySchemaId(folderItems, selectedSchema) : folderItems
      const filterComponents = items.map((item: (SchemaLinkedComponent)) => {
        return {
          Type: item.$type,
          Id: item.Id,
          Title: item.Title,
          Icon: CustomIcons[item.$type as string],
          linkedSchema: item.Schema?.IdRef
          //Icon: item.$type === "Component" ? CustomIcons.Component : CustomIcons.Folder
        }
      })
      setFolderItems(filterComponents as FolderItems[])
      const parentFolderId = folderItems[0].LocationInfo?.OrganizationalItem?.IdRef
      const parentFolderTitle = folderItems[0].LocationInfo?.OrganizationalItem?.Title
      setContainerId(parentFolderId as string)
      setContainerTitle(parentFolderTitle as string)
      setIsLoading(false)
    } catch (error) {
      console.error("Failed to fetch the folder items",error)
      setIsLoading(false)
    }
  }, [containerId, selectedSchema])

  const filterBySchemaId = (items: RepositoryLocalObject[], schemdId: string) => {
    return items.filter((item: SchemaLinkedComponent) => item.Schema?.IdRef && item.Schema.IdRef === schemdId || item.$type === "Folder")
  }

  // Fetch Parent folder by click on the arrow
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
      console.error("Failed to fetch Parent folder",error)
    }

  }

  // handle folder structure item selection
  const handleChange = (e: CheckboxChangeEvent) => {
    const target = e.target as any
    setSelectedComponentId(target.value);
    const targetType = target['data-type']
    if (targetType === 'Component') {
      fetchComponentData(target.value)
    }
  }

  // Fetch selected component Data
  const fetchComponentData = async (compId: string) => {
    if (!compId) return;
    try {
      //fetch component Data using ItemsService.getItem
      const response = await ItemsService.getItem({
        escapedItemId: compId,
        useDynamicVersion: true
      })
      const mapComponent = mapToModel<Component>(response)
      const data = mapComponent.content as FieldsValueDictionary
      const rawcontent = getContentByFieldName(data, selectedFields);
      const formData = {
        ...aiPrompt,
        "additionalContext": rawcontent.join("")
      }
      setAiPrompt(formData)
    } catch (error) {
      console.error('Failed to fetch item:', error);
    }
  }

  // Extract selected field content 
  const getContentByFieldName = (data: FieldsValueDictionary, selectedFields: string) => {
    return Object.entries(data || {}).reduce<string[]>((acc, [key, value]) => {
      if (selectedFields===key && typeof value === "string") {
        if (key === "content") {
          const parsedContent = htmlToText(value, {
            wordwrap: false,
            selectors: [
              { selector: 'a', options: { ignoreHref: true } },
              { selector: 'img', format: 'skip' } // skip image tag
            ]
          });
          acc.push(parsedContent);
        } else {
          acc.push(value);
        }
      }
      if (value && typeof value === "object") {
        acc.push(...getContentByFieldName(value, selectedFields));
      }
      return acc;
    }, []);
  }

  return (
    <Flex align="center" justify="center" style={{ padding: "5px 0px" }}>
      {
        !showComponentList
        &&
        <Flex justify="space-between" align="flex-start" style={{ width: "100%", padding: "5px 0px" }}>
          <Flex vertical style={{ width: "100%" }}>
            <Flex vertical gap={5} style={{ marginTop: 5, marginBottom: 10, paddingLeft: 10, paddingRight: 10 }}>
              <SchemaList
                publicationId={tcmUri.getPublicationUri().asString}
                selectedSchema={selectedSchema}
                selectedFields={selectedFields}
                schemaList={schemaList}
                setSelectedSchema={setSelectedSchema}
                setSelectedFields={setSelectedFields}
                setSchemaList={setSchemaList}
              />
            </Flex>

            <Flex align="center" justify='space-between' gap={3} style={{ marginTop: 5, marginBottom: 10, paddingLeft: 10, paddingRight: 10 }}>
              <Flex align='center'>
                <span onClick={() => fetchParentFolder(containerId as string)} style={{ cursor: "pointer" }}>
                  {CustomIcons.Arrow}
                </span>
                <span>{CustomIcons.Folder}</span>
                <Title level={5} style={{ margin: 0 }}>
                  {containerTitle}
                </Title>
              </Flex>
              <Flex>
                <Button type='default' onClick={() => fetchFolderItems(containerId as string)}>
                  <SyncOutlined />
                </Button>
              </Flex>
            </Flex>
            <List
              loading={{
                spinning: isLoading,
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
