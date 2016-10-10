/* @flow */

export {
  getEntityRange,
  toggleInlineStyle,
  getSelectionEntity,
  getSelectionInlineStyle,
  getSelectionCustomInlineStyle,
} from './inline';
export {
  getSelectedBlocksList,
  getSelectionBlockes,
  getSelectedBlock,
  getAllBlocks,
  getSelectedBlocksType,
  removeSelectedBlocksStyle,
  getTextSelection,
  addLineBreakRemovingSelection,
  insertNewUnstyledBlock,
  clearEditorContent,
  getSelectedBlocksMap
} from './block';
export {
  handleNewLine,
  insertOrReplaceTab
} from './keyPress';
export {
  isListBlock,
  changeDepth
} from './list';

export {
  getIndentation
} from './text';

// exports = {
//   // Functions related to blocks
//   getSelectedBlocksList,
//   getSelectedBlock,
//   getAllBlocks,
//   getSelectedBlocksType,
//   removeSelectedBlocksStyle,
//   getSelectionText,
//   addLineBreakRemovingSelection,
//   insertNewUnstyledBlock,
//   clearEditorContent,
//   // Functions related to inline styles
//   getEntityRange,
//   toggleInlineStyle,
//   getSelectionEntity,
//   getSelectionInlineStyle,
//   getSelectionCustomInlineStyle,
//   // KeyPress related Functions
//   handleNewLine,
//   // Lists related Functions
//   isListBlock,
//   changeDepth,
// };
