
import {
  ContentState,
  EditorState,
  ContentBlock,
  SelectionState
} from 'draft-js';

import { OrderedMap, List, OrderedSet, Map } from 'immutable';


/**
* Function returns size at a offset.
*/
export function getStyleAtOffset(block: ContentBlock, stylePrefix: string, offset: number): any {
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
export function isListBlock(block: ContentBlock): boolean {
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
export function changeBlocksDepth(editorState: EditorState, adjustment: number, maxDepth: number): ContentState {
  const selectionState: SelectionState = editorState.getSelection();
  const contentState: ContentState = editorState.getCurrentContent();
  let blockMap: OrderedMap<string, ContentBlock> = contentState.getBlockMap();
  const blocks = this.getSelectedBlocksList(editorState).map(block => {
    let depth: number = block.getDepth() + adjustment;
    depth = Math.max(0, Math.min(depth, maxDepth));
    return block.set('depth', depth);
  });

  blockMap = blockMap.merge(blocks as any);
  contentState.merge(blockMap);
  contentState.merge(selectionState);
  // return contentState.merge({
  //     blockMap as any,
  //     selectionBefore: selectionState as any,
  //     selectionAfter: selectionState as any,
  // });
  return contentState;
}

/**
* Function will check various conditions for changing depth and will accordingly
* either call function changeBlocksDepth or just return the call.
*/
export function changeDepth(editorState: EditorState, adjustment: number, maxDepth: number): EditorState {
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
  const withAdjustment = this.changeBlocksDepth(
    editorState,
    adjustment,
    adjustedMaxDepth
  );
  return EditorState.push(
    editorState,
    withAdjustment,
    'adjust-depth'
  );
}
