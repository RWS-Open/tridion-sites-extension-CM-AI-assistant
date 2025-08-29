import { useCallback, useMemo } from 'react';
import { TcmUri } from "@tridion-sites/models";
import { ContentExplorerItemNodeData, ContentExplorerNodeData, ModalContentProps, useContentExplorer, useModal, useOptionalContentExplorerTable } from "@tridion-sites/extensions"
import { Component, VersionedItem } from '@tridion-sites/open-api-client';
import AiAssistantModal from "./Components/AiAssistantModal";

export const useAiAssistantAction = () => {
    const contentExplorerTable = useOptionalContentExplorerTable();
    const { currentItem, currentNode } = useContentExplorer()
    const tcmUri = TcmUri.parse(currentNode?.id.split("_").pop() || '');
    const currentNodeData = currentNode?.data as ContentExplorerNodeData;
    const item = currentNode?.data as ContentExplorerItemNodeData;
    const locationinfo = item?.item?.getInternalModel() as VersionedItem
    const parentFolder = locationinfo?.LocationInfo?.OrganizationalItem?.IdRef;
    const publicationId = locationinfo?.LocationInfo?.ContextRepository?.IdRef

    const items = contentExplorerTable?.selection.selectedItems
    const selectedItems = Array.from(contentExplorerTable?.selection.selectedItems || []);

    const selectedComponent = selectedItems[0]?.getInternalModel() as VersionedItem
    const selcetdComponentSchema = selectedComponent as Component

    const schemaId = selcetdComponentSchema?.Schema?.IdRef
    const ModelContent = useCallback((props: ModalContentProps<number>) => (
        <AiAssistantModal
            {...props}
            currentComponentId={currentItem?.getInternalModel()?.Id as string}
            currentFolderId={tcmUri as TcmUri}
            folderTitle={currentNodeData.title}
            parentFolder={parentFolder as string}
            publicationId={publicationId as string}
            schemaId={schemaId as string}
        />
    ), [currentItem, currentNode,schemaId])

    const { open: openModal } = useModal({
        content: ModelContent,
        isMaximizable: true,
        height: 600,
        width: 1000,
        modalType: "default",
    });
    const showAiAssistant = useMemo(() => {
        return items?.length !== 0 && items!==undefined && items[0].getInternalModel().$type==="Component"
    },[items])

    return {
        isAvailable: showAiAssistant,
        execute: useCallback(async () => {
            try {
                const { status } = await openModal();
                if (status === 'ok') {
                    console.log("Modal Opened")
                }
            } catch (error) {
                console.error("Failed to open AI Assistant Modal", error)                
            }
        }, [openModal])
    }
}
