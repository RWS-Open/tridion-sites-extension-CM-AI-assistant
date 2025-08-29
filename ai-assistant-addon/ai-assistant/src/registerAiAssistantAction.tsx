import { t } from '@globals';
import type { ActionGroup, ExtensionBuilder } from '@tridion-sites/extensions';

import { AiAssistantIcon } from './AiAssistantIcon';
import { useAiAssistantAction } from './useAiAssistantAction';

export const AiAssistantId = 'AiAssistantId';

export const registerAiAssistantAction = (builder: ExtensionBuilder) => {
    // First let's add all necessary translation strings
    builder.translations.addTranslation('en', {
        actionLabel: 'Ai Assistant',
        groupLabel: 'Ai Assistant',
    });

    // Adding a new action to Content Explorer with the provided icon and label
    // Note that even though we added this action it will not be visible yet anywhere
    builder.contentExplorer.addAction(() => ({
        id: AiAssistantId,
        icon: <AiAssistantIcon />,
        label: t('actionLabel'),
        useAction: useAiAssistantAction,
    }));

    // We want to add the new action into the toolbar, context menu of the table and
    // into the context menu of the tree.
    // In order to achieve this we should first create an action group that would
    // contain the new action (we could also change an existing action group instead)
    const newActionGroup: ActionGroup = {
        id: 'AiAssistantId',
        label: t('groupLabel'),
        actionIds: [AiAssistantId],
    };

    // And now let's add the action group to all places where we want to show it.
    builder.contentExplorer.table.toolbar.addGroup(newActionGroup);
};