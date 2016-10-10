/// <reference path="../../../typings/index.d.ts"/>

import * as DraftJS from 'draft-js';

import {
  OrderedMap,
  List,
} from 'immutable';
import Constaints from '../../constants';

/**
* Function returns collection of currently selected blocks.
*/
export function getSelectedBlocksMap(editorState: DraftJS.EditorState): any {
  const selectionState = editorState.getSelection();
  const contentState = editorState.getCurrentContent();
  const startKey = selectionState.getStartKey();
  const endKey = selectionState.getEndKey();
  const blockMap = contentState.getBlockMap();
  return blockMap
    .toSeq()
    .skipUntil((_, k) => k === startKey)
    .takeUntil((_, k) => k === endKey)
    .concat([[endKey, blockMap.get(endKey)]] as any);
}


export function getSelectionBlockes(editorState: DraftJS.EditorState): OrderedMap<string, DraftJS.ContentBlock> {
  // blockDelimiter = blockDelimiter || '\n';
  let selection = editorState.getSelection();
  let startKey = selection.getStartKey();
  let endKey = selection.getEndKey();
  let blocks = editorState.getCurrentContent().getBlockMap();

  let lastWasEnd = false;
  return blocks
    .skipUntil(function (block) {
      return block.getKey() === startKey;
    })
    .takeUntil(function (block) {
      let result = lastWasEnd;

      if (block.getKey() === endKey) {
        lastWasEnd = true;
      }

      return result;
    });
}

/**
* Function returns collection of currently selected blocks.
*/
export function getSelectedBlocksList(editorState: DraftJS.EditorState): List<DraftJS.ContentBlock> {
  return getSelectionBlockes(editorState).toList();
}

/**
* Function returns the first selected block.
*/
export function getSelectedBlock(editorState: DraftJS.EditorState): DraftJS.ContentBlock {
  if (editorState) {
    return getSelectedBlocksList(editorState).get(0);
  }
  return undefined;
}

/**
* Function returns list of all blocks in the editor.
*/
export function getAllBlocks(editorState: DraftJS.EditorState): List<DraftJS.ContentBlock> {
  if (editorState) {
    return editorState.getCurrentContent().getBlockMap().toList();
  }
  return List<DraftJS.ContentBlock>();
}

/**
* If all currently selected blocks are of same type the function will return their type,
* Else it will return empty string.
*/
export function getSelectedBlocksType(editorState: DraftJS.EditorState): any {
  const blocks: List<DraftJS.ContentBlock> = getSelectedBlocksList(editorState);
  const hasMultipleBlockTypes: boolean = blocks.some((block) => block.getType() !== blocks.get(0).getType());
  if (!hasMultipleBlockTypes) {
    return blocks.get(0).getType();
  }

  return undefined;
}

/**
* Function will change block style to unstyled for selected blocks.
* RichUtils.tryToRemoveBlockStyle does not workd for blocks of length greater than 1.
*/
export function removeSelectedBlocksStyle(editorState: DraftJS.EditorState): DraftJS.EditorState {
  const newContentState: DraftJS.ContentState = DraftJS.RichUtils.tryToRemoveBlockStyle(editorState);
  return DraftJS.EditorState.push(editorState, newContentState, 'change-block-type');
}

/**
* Function will handle followind keyPress scenario:
* case Shift+Enter, select not collapsed ->
*   selected text will be removed and line break will be inserted.
*/
export function addLineBreakRemovingSelection(editorState: DraftJS.EditorState): DraftJS.EditorState {
  const content: DraftJS.ContentState = editorState.getCurrentContent();
  const selection: DraftJS.SelectionState = editorState.getSelection();
  let newContent: DraftJS.ContentState = DraftJS.Modifier.removeRange(content, selection, 'forward');
  const fragment: DraftJS.SelectionState = newContent.getSelectionAfter();
  const block: DraftJS.ContentBlock = newContent.getBlockForKey(fragment.getStartKey());
  newContent = DraftJS.Modifier.insertText(
    newContent,
    fragment,
    '\n',
    block.getInlineStyleAt(fragment.getStartOffset()),
    null,
  );
  return DraftJS.EditorState.push(editorState, newContent, 'insert-fragment');
}


/**
* Function will inset a new unstyled block.
*/
export function insertNewUnstyledBlock(editorState: DraftJS.EditorState): DraftJS.EditorState {
  const newContentState: DraftJS.ContentState = DraftJS.Modifier.splitBlock(
    editorState.getCurrentContent(),
    editorState.getSelection()
  );

  const newEditorState: DraftJS.EditorState = DraftJS.EditorState.push(editorState, newContentState, 'split-block');
  return removeSelectedBlocksStyle(editorState);
}

/**
* Function will clear all content from the editor.
*/
export function clearEditorContent(editorState: DraftJS.EditorState): DraftJS.EditorState {
  const blocks: List<DraftJS.ContentBlock> = getAllBlocks(editorState);
  const updatedSelection = editorState.getSelection().merge({
    anchorKey: blocks.first().get('key'),
    anchorOffset: 0,
    focusKey: blocks.last().get('key'),
    focusOffset: blocks.last().getLength(),
  });
  const newContentState: DraftJS.ContentState = DraftJS.Modifier.removeRange(
    editorState.getCurrentContent(),
    updatedSelection as DraftJS.SelectionState,
    'forward'
  );
  return DraftJS.EditorState.push(editorState, newContentState, 'remove-range');
}

export function getTextSelection(contentState: DraftJS.ContentState, selection: DraftJS.SelectionState, blockDelimiter: string) {
    blockDelimiter = blockDelimiter || '\n';
    let startKey   = selection.getStartKey();
    let endKey     = selection.getEndKey();
    let blocks     = contentState.getBlockMap();

    let lastWasEnd = false;
    let selectedBlock = blocks
        .skipUntil(function(block) {
            return block.getKey() === startKey;
        })
        .takeUntil(function(block) {
            let result = lastWasEnd;

            if (block.getKey() === endKey) {
                lastWasEnd = true;
            }

            return result;
        });

    return selectedBlock
        .map(function(block) {
            let key = block.getKey();
            let text = block.getText();

            let start = 0;
            let end = text.length;

            if (key === startKey) {
                start = selection.getStartOffset();
            }
            if (key === endKey) {
                end = selection.getEndOffset();
            }

            text = text.slice(start, end);
            return text;
        })
        .join(blockDelimiter);
}

