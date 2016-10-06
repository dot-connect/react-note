/// <reference  path="../../typings/index.d.ts"/>

import { assert } from 'chai';
import {
  EditorState,
  convertFromHTML,
  ContentState,
  SelectionState
} from 'draft-js';
import { getAllBlocks } from '../../src/editorcore/utils/block';
import { handleNewLine } from '../../src/editorcore/utils/keyPress';

function parseHtml(html: string): string {
  let parser: DOMParser = new DOMParser();
  let doc: Document = parser.parseFromString(html, 'text/html');
  return doc.body.innerHTML;
}

describe('handleNewLine: Enter KeyPress test suite', () => {
  it('should add new unstyles block if enter is pressed at the end of a styles block', () => {
    const contentBlocks = convertFromHTML('<h1>aaaaaaaaaa</h1>', parseHtml);
    const contentState = ContentState.createFromBlockArray(contentBlocks);
    let editorState = EditorState.createWithContent(contentState);
    assert.equal(getAllBlocks(editorState).size, 1);
    const updatedSelection = editorState.getSelection().merge({
      anchorOffset: 10,
      focusOffset: 10,
    });
    editorState = EditorState.acceptSelection(
      editorState,
      updatedSelection as SelectionState
    );
    editorState = handleNewLine(editorState, {});
    assert.equal(getAllBlocks(editorState).size, 2);
  });

  it('should do nothing if current block was UNSTYLED', () => {
    const contentBlocks = convertFromHTML('<div>aaaaaaaaaa</div>', parseHtml);
    const contentState = ContentState.createFromBlockArray(contentBlocks);
    let editorState = EditorState.createWithContent(contentState);
    assert.equal(getAllBlocks(editorState).size, 1);
    const updatedSelection = editorState.getSelection().merge({
      anchorOffset: 10,
      focusOffset: 10,
    });
    editorState = EditorState.acceptSelection(
      editorState,
      updatedSelection as SelectionState
    );
    assert.isUndefined(handleNewLine(editorState, {}));
  });
});

describe('handleNewLine: SHIFT + Enter KeyPress test suite', () => {
  const event = {
    which: 13,
    getModifierState: () => 'Shift',
  };
  it('should add new line id selection was collapsed', () => {
    const contentBlocks = convertFromHTML('<h1>aaaaaaaaaa</h1>', parseHtml);
    const contentState = ContentState.createFromBlockArray(contentBlocks);
    let editorState = EditorState.createWithContent(contentState);
    assert.equal(getAllBlocks(editorState).size, 1);
    const updatedSelection = editorState.getSelection().merge({
      anchorOffset: 5,
      focusOffset: 5,
    });
    editorState = EditorState.acceptSelection(
      editorState,
      updatedSelection as SelectionState
    );
    editorState = handleNewLine(editorState, event);
    assert.equal(getAllBlocks(editorState).size, 1);
    assert.isTrue(editorState.getCurrentContent().getPlainText().indexOf('\n') > 0);
  });

  it('should remove selected text', () => {
    const contentBlocks = convertFromHTML('<div>aaaaaaaaaa</div>', parseHtml);
    const contentState = ContentState.createFromBlockArray(contentBlocks);
    let editorState = EditorState.createWithContent(contentState);
    assert.equal(getAllBlocks(editorState).size, 1);
    const updatedSelection = editorState.getSelection().merge({
      anchorOffset: 2,
      focusOffset: 8,
    });
    editorState = EditorState.acceptSelection(
      editorState,
      updatedSelection as SelectionState
    );
    editorState = handleNewLine(editorState, event);
    assert.equal(getAllBlocks(editorState).get(0).getLength(), 5);
    assert.isTrue(editorState.getCurrentContent().getPlainText().indexOf('\n') > 0);
  });

  describe('isSoftNewlineEvent: Enter KeyPress test suite', () => {
  });
});
