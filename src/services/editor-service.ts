/// <reference path="../../typings/index.d.ts"/>

import * as DraftJS from 'draft-js';
import { OrderedMap, List, OrderedSet, Map } from 'immutable';

import TextProvider from './text-provider';
import HtmlProvider from './html-provider';
import { EditorCore } from '../editorcore/editor';
import * as Utils from '../editorcore/utils';

export class EditorService {
    public editor: EditorCore; 

    private textProvider: TextProvider;
    private htmlProvider: HtmlProvider;

    constructor(editor: EditorCore) {
        this.textProvider = new TextProvider();
        this.editor = editor;
    }

    public toEditorState(text: string): DraftJS.EditorState {
        let createEmptyContentState: DraftJS.ContentState = DraftJS.ContentState.createFromText(this.textProvider.decodeContent(text) || '');
        let editorState: DraftJS.EditorState = DraftJS.EditorState.createWithContent(createEmptyContentState);
        return DraftJS.EditorState.forceSelection(editorState, createEmptyContentState.getSelectionAfter());
    }

    public getSelectedText = (): string => {
        let contentState: DraftJS.ContentState = this.editor.state.editorState.getCurrentContent();
        let selectionState: DraftJS.SelectionState = this.editor.state.editorState.getSelection();
        return Utils.getTextSelection(contentState, selectionState, null);
    }

    public getSelectedBlocks = (): Immutable.List<DraftJS.ContentBlock> => {
        return Utils.getSelectedBlocksList(this.editor.state.editorState);
    }

    public getText(editorState: DraftJS.EditorState, encode: boolean): string {
        return this.textProvider.export(editorState, encode);
    }

    public getHtml(editorState: DraftJS.EditorState, encode: boolean): string {
        return this.htmlProvider.export(editorState, encode);
    }

    public updateState(newState: DraftJS.EditorState, forceFocus = false): void {
        this.editor.setEditorState(newState, forceFocus);
    }

    public getEditorState(): DraftJS.EditorState {
        return this.editor.state.editorState;
    }

    public clearSelection(): void {
        if (window.getSelection) {
            if (window.getSelection().empty) {  // Chrome
                window.getSelection().empty();
            } else if (window.getSelection().removeAllRanges) {  // Firefox
                window.getSelection().removeAllRanges();
            }
        }
        // else if (document.selection) {  // IE?
        //     document.selection.empty();
        // }
    }

    public toggleInLineStyle(editorState: DraftJS.EditorState, style: string): DraftJS.EditorState {
        return DraftJS.RichUtils.toggleInlineStyle(editorState, 'BOLD');
    }
}
