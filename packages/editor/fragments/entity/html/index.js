import {
  ApplicationFragment,
  UnitFragment
} from 'editor/fragment/types';


import { create as createFontFragments } from './fonts';
import { create as createEntityFragments } from './entities';
import { create as createFragments } from './fragments';
import { create as createPreviewTools } from './components/preview-tools';
import { createFragment as createAttributesPaneFragment } from './components/panes/attributes';

import { create as createPreviewFragments } from './components/entity-preview';
import { create as createSelectionFragment } from './selection';
import { create as createKeyCommandFragments } from './key-commands';
import { create as createEditorLayerLabelFragments } from './components/layer-pane-labels';
import { create as createEditorPropertyPaneFragments } from './components/panes/styles';

export function create({ app }) {
  return [
    ...createFragments({ app }),
    ...createEntityFragments({ app }),
    ...createFontFragments({ app }),
    ...createPreviewTools({ app }),
    createAttributesPaneFragment({ app }),

    ...createPreviewFragments({ app }),
    ...createSelectionFragment({ app }),
    ...createKeyCommandFragments({ app }),
    ...createEditorLayerLabelFragments({ app }),
    ...createEditorPropertyPaneFragments({ app })
  ];
}
