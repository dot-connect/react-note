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
  getSelectedBlock,
  getAllBlocks,
  getSelectedBlocksType,
  removeSelectedBlocksStyle,
  getTextSelection,
  addLineBreakRemovingSelection,
  insertNewUnstyledBlock,
  clearEditorContent,
} from './block';
export {
  handleNewLine,
} from './keyPress';
export {
  isListBlock,
  changeDepth,
} from './list';

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
