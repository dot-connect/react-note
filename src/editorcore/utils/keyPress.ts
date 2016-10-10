/* @flow */

import * as DraftJS from 'draft-js';

import {
  insertNewUnstyledBlock,
  removeSelectedBlocksStyle,
  addLineBreakRemovingSelection,
} from './block';

import {
  isListBlock,
  changeDepth
} from './list';

import {
  getIndentation
} from './text';

/**
* Function will handle followind keyPress scenarios when Shift key is not pressed.
*/
export function handleHardNewlineEvent(editorState: DraftJS.EditorState): DraftJS.EditorState {
  const selection = editorState.getSelection();
  if (selection.isCollapsed()) {
    const contentState = editorState.getCurrentContent();
    const blockKey = selection.getStartKey();
    const block = contentState.getBlockForKey(blockKey);
    if (!isListBlock(block) &&
      block.getType() !== 'unstyled' &&
      block.getLength() === selection.getStartOffset()) {
      return insertNewUnstyledBlock(editorState);
    } else if (isListBlock(block) && block.getLength() === 0) {
      const depth = block.getDepth();
      if (depth === 0) {
        return removeSelectedBlocksStyle(editorState);
      } if (depth > 0) {
        return changeDepth(editorState, -1, depth);
      }
    }
  }
  return undefined;
}

/**
* Function to check is event was soft-newline
* taken from : https://github.com/facebook/draft-js/blob/master/src/component/utils/isSoftNewlineEvent.js
*/
function isSoftNewlineEvent(e): boolean {
  return e.which === 13 && (
    e.getModifierState('Shift') ||
    e.getModifierState('Alt') ||
    e.getModifierState('Control')
  );
}

/**
* The function will handle keypress 'Enter' in editor. Following are the scenarios:
*
* 1. Shift+Enter, Selection Collapsed -> line break will be inserted.
* 2. Shift+Enter, Selection not Collapsed ->
*      selected text will be removed and line break will be inserted.
* 3. Enter, Selection Collapsed ->
*      if current block is of type list and length of block is 0
*      a new list block of depth less that current one will be inserted.
* 4. Enter, Selection Collapsed ->
*      if current block not of type list, a new unstyled block will be inserted.
*/
export function handleNewLine(editorState: DraftJS.EditorState, event: Object): DraftJS.EditorState {
  if (isSoftNewlineEvent(event)) {
    const selection = editorState.getSelection();
    if (selection.isCollapsed()) {
      return DraftJS.RichUtils.insertSoftNewline(editorState);
    }
    return addLineBreakRemovingSelection(editorState);
  }
  return handleHardNewlineEvent(editorState);
}

export function insertOrReplaceTab(editorState: DraftJS.EditorState): DraftJS.EditorState {
  let contentState = editorState.getCurrentContent();
  let selection = editorState.getSelection();
  let startKey = selection.getStartKey();
  let currentBlock = contentState.getBlockForKey(startKey);

  let indentation = getIndentation(currentBlock.getText());
  let newContentState: DraftJS.ContentState;

  if (selection.isCollapsed()) {
    newContentState = DraftJS.Modifier.insertText(
      contentState,
      selection,
      indentation
    );
  } else {
    newContentState = DraftJS.Modifier.replaceText(
      contentState,
      selection,
      indentation
    );
  }

  return DraftJS.EditorState.push(editorState, newContentState, 'insert-characters');
}
