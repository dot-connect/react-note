
import * as DraftJS from 'draft-js';

import { OrderedMap, List, OrderedSet, Map } from 'immutable';

import * as Utils from './index';


/**
* Function returns size at a offset.
*/
export function getStyleAtOffset(block: DraftJS.ContentBlock, stylePrefix: string, offset: number): any {
  const styles = block.getInlineStyleAt(offset).toList();
  let prefix: string = stylePrefix.toLowerCase();
  const style = styles.filter((s) => s.substring(0, prefix.length) === prefix);
  if (style && style.size > 0) {
    return style.get(0);
  }
  return undefined;
}

/**
* Function to check if a block is of type list.
*/
export function isListBlock(block: DraftJS.ContentBlock): boolean {
  if (block) {
    const blockType: string = block.getType();
    return (
      blockType === 'unordered-list-item' ||
      blockType === 'ordered-list-item'
    );
  }
  return false;
}


/**
* Function to change depth of block(s).
*/
function changeBlocksDepth(
  editorState: DraftJS.EditorState,
  adjustment: number,
  maxDepth: number
): DraftJS.ContentState {
  const selectionState = editorState.getSelection();
  const contentState = editorState.getCurrentContent();
  let blockMap = contentState.getBlockMap();
  let selectedBlocksMap = Utils.getSelectionBlockes(editorState);
  const blocks = selectedBlocksMap.map(block => {
    let depth = block.getDepth() + adjustment;
    depth = Math.max(0, Math.min(depth, maxDepth));
    return block.set('depth', depth);
  });
  blockMap = blockMap.merge(blocks as any);
  return contentState.merge({
    blockMap,
    selectionBefore: selectionState,
    selectionAfter: selectionState,
  }) as DraftJS.ContentState;
}

/**
* Function will check various conditions for changing depth and will accordingly
* either call function changeBlocksDepth or just return the call.
*/
export function changeDepth(
  editorState: DraftJS.EditorState,
  adjustment: number,
  maxDepth: number
): DraftJS.EditorState {
  const selection = editorState.getSelection();
  let key;
  if (selection.getIsBackward()) {
    key = selection.getFocusKey();
  } else {
    key = selection.getAnchorKey();
  }
  const content = editorState.getCurrentContent();
  const block = content.getBlockForKey(key);
  const type = block.getType();
  if (type !== 'unordered-list-item' && type !== 'ordered-list-item') {
    return editorState;
  }
  const blockAbove = content.getBlockBefore(key);
  if (!blockAbove) {
    return editorState;
  }
  const typeAbove = blockAbove.getType();
  if (typeAbove !== type) {
    return editorState;
  }
  const depth = block.getDepth();
  if (adjustment === 1 && depth === maxDepth) {
    return editorState;
  }
  const adjustedMaxDepth = Math.min(blockAbove.getDepth() + 1, maxDepth);
  const withAdjustment = changeBlocksDepth(
    editorState,
    adjustment,
    maxDepth
  );

  return DraftJS.EditorState.push(
    editorState,
    withAdjustment,
    'adjust-depth'
  );
}
