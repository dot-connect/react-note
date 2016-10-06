import { EditorState } from "draft-js";

import { EditorCore } from "./EditorCore/editor";

export interface Plugin {
    name: string;
    decorators?: Array<any>;
    component?: Function;
    onChange: (editorState: EditorState) => EditorState;
    customStyleFn?: Function;
    callbacks: {
        onUpArrow?: Function;
        onDownArrow?: Function;
        handleReturn?: Function;
        handleKeyBinding?: Function;
        setEditorState: (editorState: EditorState) => void;
        getEditorState: () => EditorState;
    };
    config?: Object;
}

export interface ITextProvider {
    export(editorState: EditorState, encode: boolean): string;
    encode(input: string): string;
}