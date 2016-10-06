/* @flow */

import {
  Entity,
  Modifier,
  RichUtils,
  EditorState,
  ContentBlock,
  ContentState,
  SelectionState
} from 'draft-js';

import {
  OrderedMap,
  OrderedSet,
  List
} from 'immutable';

import {
  getSelectedBlocksList,
  getSelectedBlock,
} from './block';


/**
   * Function returns an object of inline styles currently applicable.
   * Following rules are applicable:
   * - styles are all false if editor is not focused
   * - if focus is at beginning of the block and selection is collapsed
   *     styles of first character in block is returned.
   * - if focus id anywhere inside the block and selection is collapsed
   *     style of a character before focus is returned.
   */
export function getSelectionInlineStyle(editorState: EditorState): any {
  const currentSelection: SelectionState = editorState.getSelection();
  const start: number = currentSelection.getStartOffset();
  const end: number = currentSelection.getEndOffset();
  const selectedBlocks: List<ContentBlock> = this.getSelectedBlocksList(editorState);
  if (selectedBlocks.size > 0) {
    const inlineStyles = {
      BOLD: true,
      ITALIC: true,
      UNDERLINE: true,
      STRIKETHROUGH: true,
      CODE: true,
    };

    for (let i: number = 0; i < selectedBlocks.size; i++) {
      let blockStart: number = i === 0 ? start : 0;
      let blockEnd: number =
        i === (selectedBlocks.size - 1) ? end : selectedBlocks.get(i).getText().length;
      if (blockStart === blockEnd && blockStart === 0) {
        blockStart = 1;
        blockEnd = 2;
      } else if (blockStart === blockEnd) {
        blockStart -= 1;
      }

      for (let j: number = blockStart; j < blockEnd; j++) {
        const inlineStylesAtOffset: OrderedSet<string> = selectedBlocks.get(i).getInlineStyleAt(j);
        ['BOLD', 'ITALIC', 'UNDERLINE', 'STRIKETHROUGH', 'CODE'].forEach(style => {
          inlineStyles[style] = inlineStyles[style] && inlineStylesAtOffset.get(style) === style;
        });
      }
    }

    return inlineStyles;
  }

  return {};
}

/**
* This function will return the entity applicable to whole of current selection.
* An entity can not span multiple blocks.
*/
export function getSelectionEntity(editorState: EditorState): Entity {
  let entity: string;
  const selection: SelectionState = editorState.getSelection();
  let start: number = selection.getStartOffset();
  let end: number = selection.getEndOffset();
  if (start === end && start === 0) {
    end = 1;
  } else if (start === end) {
    start -= 1;
  }
  const block: ContentBlock = this.getSelectedBlock(editorState);

  for (let i: number = start; i < end; i++) {
    const currentEntity: string = block.getEntityAt(i);
    if (!currentEntity) {
      entity = undefined;
      break;
    }
    if (i === start) {
      entity = currentEntity;
    } else {
      if (entity !== currentEntity) {
        entity = undefined;
        break;
      }
    }
  }

  return entity;
}

/**
* Array of colors supported for custom inline styles.
*/
const colors = ['rgb(97,189,109)', 'rgb(26,188,156)', 'rgb(84,172,210)', 'rgb(44,130,201)',
  'rgb(147,101,184)', 'rgb(71,85,119)', 'rgb(204,204,204)', 'rgb(65,168,95)', 'rgb(0,168,133)',
  'rgb(61,142,185)', 'rgb(41,105,176)', 'rgb(85,57,130)', 'rgb(40,50,78)', 'rgb(0,0,0)',
  'rgb(247,218,100)', 'rgb(251,160,38)', 'rgb(235,107,86)', 'rgb(226,80,65)', 'rgb(163,143,132)',
  'rgb(239,239,239)', 'rgb(255,255,255)', 'rgb(250,197,28)', 'rgb(243,121,52)', 'rgb(209,72,65)',
  'rgb(184,49,47)', 'rgb(124,112,107)', 'rgb(209,213,216)'];

/**
* Array of font-sizes supported for custom inline styles.
*/
const fontSizes = [8, 9, 10, 11, 12, 14, 18, 24, 30, 36, 48, 60, 72, 96];

/**
* Array of font-sizes supported for custom inline styles.
*/
const fontFamilies = ['Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana'];

/**
* Collection of all custom inline styles.
*/
const customInlineStylesMap = {
  color: {},
  bgcolor: {},
  fontSize: {},
  fontFamily: {},
};
export function initReousrce(): void {
  this.colors.forEach((color) => {
    this.customInlineStylesMap.color[`color-${color}`] = {
      color,
    };
    this.customInlineStylesMap.bgcolor[`bgcolor-${color}`] = {
      backgroundColor: color,
    };
  });
  this.fontSizes.forEach((size) => {
    this.customInlineStylesMap.fontSize[`fontsize-${size}`] = {
      fontSize: size,
    };
  });
  this.fontFamilies.forEach((family) => {
    this.customInlineStylesMap.fontFamily[`fontfamily-${family}`] = {
      fontFamily: family,
    };
  });
}

/**
* Function to toggle a custom inline style in current selection current selection.
*/
export function toggleInlineStyle(editorState: EditorState, styleType: string, style: string): EditorState {
  const selection: SelectionState = editorState.getSelection();
  const nextContentState: ContentState = Object.keys(this.customInlineStylesMap[styleType])
    .reduce((contentState, s) => Modifier.removeInlineStyle(contentState, selection, s),
    editorState.getCurrentContent());
  let nextEditorState = EditorState.push(
    editorState,
    nextContentState,
    'change-inline-style'
  );
  const currentStyle = editorState.getCurrentInlineStyle();
  if (selection.isCollapsed()) {
    nextEditorState = currentStyle
      .reduce((state, s) => RichUtils.toggleInlineStyle(state, s),
      nextEditorState);
  }
  if (!currentStyle.has(style)) {
    nextEditorState = RichUtils.toggleInlineStyle(
      nextEditorState,
      style
    );
  }
  return nextEditorState;
}

/**
* Function returns an object of custom inline styles currently applicable.
*/
export function getSelectionCustomInlineStyle(editorState: EditorState, styles: Array<string>): any {
  if (editorState && styles && styles.length > 0) {
    const currentSelection = editorState.getSelection();
    const start = currentSelection.getStartOffset();
    const end = currentSelection.getEndOffset();
    const selectedBlocks = this.getSelectedBlocksList(editorState);
    if (selectedBlocks.size > 0) {
      const inlineStyles = {};
      for (let i = 0; i < selectedBlocks.size; i++) {
        let blockStart = i === 0 ? start : 0;
        let blockEnd =
          i === (selectedBlocks.size - 1) ? end : selectedBlocks.get(i).getText().length;
        if (blockStart === blockEnd && blockStart === 0) {
          blockStart = 1;
          blockEnd = 2;
        } else if (blockStart === blockEnd) {
          blockStart -= 1;
        }
        for (let j = blockStart; j < blockEnd; j++) {
          if (j === blockStart) {
            styles.forEach(s => {
              inlineStyles[s] = this.getStyleAtOffset(selectedBlocks.get(i), s, j);
            });
          } else {
            styles.forEach(s => {
              if (inlineStyles[s]
                && inlineStyles[s] !== this.getStyleAtOffset(selectedBlocks.get(i), s, j)) {
                inlineStyles[s] = undefined;
              }
            });
          }
        }
      }
      return inlineStyles;
    }
  }
  return {};
}

export function getEntityRange(editorState: EditorState, entityKey: string): any {
  const block = getSelectedBlock(editorState);
  let entityRange;
  block.findEntityRanges(
    (value) => value.get('entity') === entityKey,
    (start, end) => {
      entityRange = {
        start,
        end,
        text: block.get('text').slice(start, end),
      };
    }
  );
  return entityRange;
}
