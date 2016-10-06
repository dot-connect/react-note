/// <reference  path="../../typings/index.d.ts"/>

import {
  Entity,
  RichUtils,
  EditorState,
  convertFromHTML,
  ContentState,
  SelectionState,
} from 'draft-js';
import {
  toggleInlineStyle,
  getSelectionInlineStyle,
  getSelectionCustomInlineStyle,
  getSelectionEntity,
  getEntityRange,
} from '../../src/editorcore/utils/inline';
import { assert } from 'chai';

function parseHtml(html: string): string {
  let parser: DOMParser = new DOMParser();
  let doc: Document = parser.parseFromString(html, 'text/html');
  return doc.body.innerHTML;
}

describe('getSelectionInlineStyle test suite', () => {
  it('should correctly get inline styles', () => {
    const contentBlocks = convertFromHTML('<h1>aaaaaaaaaa</h1><ul><li>test</li></ul>', parseHtml);
    const contentState = ContentState.createFromBlockArray(contentBlocks);
    let editorState = EditorState.createWithContent(contentState);
    const updatedSelection = editorState.getSelection().merge({
      anchorOffset: 0,
      focusOffset: 10,
    });
    editorState = EditorState.acceptSelection(
      editorState,
      updatedSelection as SelectionState,
    );
    editorState = RichUtils.toggleInlineStyle(
      editorState,
      'BOLD'
    );
    assert.equal(getSelectionInlineStyle(editorState).BOLD, true);
    editorState = RichUtils.toggleInlineStyle(
      editorState,
      'STRIKETHROUGH'
    );
    assert.equal(getSelectionInlineStyle(editorState).STRIKETHROUGH, true);
    editorState = RichUtils.toggleInlineStyle(
      editorState,
      'CODE'
    );
    assert.equal(getSelectionInlineStyle(editorState).CODE, true);
  });
});

describe('getSelectionEntity, getEntityRange test suite', () => {
  it('should return entity of selection', () => {
    const contentBlocks = convertFromHTML('<h1>aaaaaaaaaa</h1>', parseHtml);
    const contentState = ContentState.createFromBlockArray(contentBlocks);
    let editorState = EditorState.createWithContent(contentState);
    const updatedSelection = editorState.getSelection().merge({
      anchorOffset: 0,
      focusOffset: 10,
    });
    const entityKey = Entity.create('LINK', 'MUTABLE', { url: 'www.testing.com' });
    editorState = RichUtils.toggleLink(editorState, updatedSelection as SelectionState, entityKey);
    assert.equal(getSelectionEntity(editorState), entityKey);
    const entityRange = getEntityRange(editorState, entityKey);
    assert.equal(entityRange.start, 0);
    assert.equal(entityRange.end, 10);
    assert.equal(entityRange.text, 'aaaaaaaaaa');
  });

  it('should return undefined if entity is not applicable to whole seelction', () => {
    const contentBlocks = convertFromHTML('<h1>aaaaaaaaaa</h1>', parseHtml);
    const contentState = ContentState.createFromBlockArray(contentBlocks);
    let editorState = EditorState.createWithContent(contentState);
    let updatedSelection = editorState.getSelection().merge({
      anchorOffset: 0,
      focusOffset: 5,
    });
    const entityKey = Entity.create('LINK', 'MUTABLE', { url: 'www.testing.com' });
    editorState = RichUtils.toggleLink(editorState, updatedSelection as SelectionState, entityKey);
    updatedSelection = editorState.getSelection().merge({
      anchorOffset: 0,
      focusOffset: 10,
    });
    editorState = EditorState.acceptSelection(
      editorState,
      updatedSelection as SelectionState
    );
    assert.isUndefined(getSelectionEntity(editorState));
    const entityRange = getEntityRange(editorState, entityKey);
    assert.equal(entityRange.start, 0);
    assert.equal(entityRange.end, 5);
    assert.equal(entityRange.text, 'aaaaa');
  });
});

describe('getSelectionInlineStyle, toggleInlineStyle test suite', () => {
  it('should correctly get color of selection', () => {
    const contentBlocks = convertFromHTML('<h1>aaaaaaaaaa</h1><ul><li>test</li></ul>', parseHtml);
    const contentState = ContentState.createFromBlockArray(contentBlocks);
    let editorState = EditorState.createWithContent(contentState);
    const updatedSelection = editorState.getSelection().merge({
      anchorOffset: 0,
      focusOffset: 10,
    });
    editorState = EditorState.acceptSelection(
      editorState,
      updatedSelection as SelectionState
    );
    editorState = toggleInlineStyle(editorState, 'color', 'color-rgb(97,189,109)');
    assert.equal(getSelectionCustomInlineStyle(
      editorState,
      ['COLOR']).COLOR, 'color-rgb(97,189,109)'
    );
    editorState = toggleInlineStyle(editorState, 'bgcolor', 'bgcolor-rgb(97,189,109)');
    assert.equal(getSelectionCustomInlineStyle(
      editorState,
      ['BGCOLOR']).BGCOLOR, 'bgcolor-rgb(97,189,109)'
    );
  });
});
