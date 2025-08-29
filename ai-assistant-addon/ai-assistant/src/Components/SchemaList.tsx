import { useEffect, useState } from 'react';
import { Flex, Select, Space } from "antd";
import { EmbeddedSchemaFieldDefinition, FieldsDefinitionDictionary, ItemFieldDefinition, ItemsService, PublicationsService, Schema } from '@tridion-sites/open-api-client'
import { SchemaFields, SchemaListTypes } from "src/types";

interface SchemaListProps {
    schemaList: SchemaListTypes[];
    selectedSchema: string;
    selectedFields: string;
    publicationId:string
    setSelectedSchema: (selectedSchema: string) => void;
    setSchemaList: (schemaList: SchemaListTypes[]) => void;
    setSelectedFields: (selectedFields: string) => void;
}

const SchemaList = ({ publicationId, schemaList, selectedSchema, selectedFields, setSchemaList, setSelectedSchema, setSelectedFields }: SchemaListProps) => {

    const [fields, setFields] = useState<SchemaFields[]>([])

    //Fetch schema's available in the publication
    const getSchemas = async () => {
        try {
            const response = await PublicationsService.getSchemaLinks({
                escapedPublicationId: publicationId,
                schemaPurpose: ["Component"]
            })
            const selectableSchema = response.map(item => {
                return {
                    value: item.IdRef,
                    label: item.Title as string
                }
            })
            setSchemaList(selectableSchema)
        } catch (error) {
            console.error("Failed to fetch the schema list",error)
        }
    }

    useEffect(() => {
        getSchemas()
    }, [])

    // Handle Schema Change
    const onChange = (value: string) => {
        //console.log(`selected ${value}`);
        setSelectedSchema(value)
        if (value) {
            getSchemaFields(value as string)
        }
    };

    //Handle schema field changes
    const handleField = (value: string) => {
        //console.log('checked = ', value);
        setSelectedFields(value as string)
    }

    //Fetch selected Schema details
    const getSchemaFields = async (schemaid: string) => {
        try {
            const response: Schema = await ItemsService.getItem({
                escapedItemId: schemaid,
                useDynamicVersion: true
            })

            const schemaFields = response?.Fields as FieldsDefinitionDictionary;
            const fieldNames = schemaFields ? extractFieldNames(schemaFields) : [];
            //console.log(fieldNames); // ["headline", "subheading", "content"]
            const fields = fieldNames.map(item => {
                return{
                    label:item,
                    value:item
                }
            })
            setFields(fields)

        } catch (error) {
            console.error("Failed to fetch selected schema details",error)
        }
    }

    //Get fieldnames
    const extractFieldNames = (fields: FieldsDefinitionDictionary): string[] => {
        return Object.values(fields).flatMap((field: ItemFieldDefinition) => {
            if (typeof field === "string") return [];

            switch (field.$type) {
                 /* case "MultimediaLinkFieldDefinition":
                    console.log(field)
                    return []; // skip multimedia
                case "ComponentLinkFieldDefinition":
                    console.log(field)
                    return [];
                case "ExternalLinkFieldDefinition":
                    console.log(field)
                    return [];
                case "ExternalLinkFieldDefinition":
                    console.log(field)
                    return [] */
                case "EmbeddedSchemaFieldDefinition":
                    {
                        const embeddedField = field as EmbeddedSchemaFieldDefinition;
                        if (embeddedField.EmbeddedFields) {
                            return extractFieldNames(embeddedField.EmbeddedFields);
                        }
                    }
                    return [];
                default:
                    return "Name" in field ? [field.Name] : [];
            }
        });
    }

    return (
        <Flex vertical gap={5}>
            <Flex>
                <Space style={{ width: '100%' }} direction="vertical">
                    <Select
                        value={selectedSchema}
                        showSearch
                        style={{ width: '100%' }}
                        placeholder="Select a Schema"
                        optionFilterProp="label"
                        onChange={onChange}
                        options={schemaList}
                    />
                </Space>
            </Flex>
            {selectedSchema && <Flex>
                <Space style={{ width: '100%' }} direction="vertical">
                    <Select
                        placeholder="Select Fields"
                        value={selectedFields}
                        showSearch
                        style={{ width: '100%' }}
                        optionFilterProp="label"
                        onChange={handleField}
                        options={fields}
                    />
                </Space>
            </Flex>}
        </Flex>
    )
}

export default SchemaList
