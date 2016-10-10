// import "rc-editor-core/assets/index.less";
import * as EditorCorePublic from '../';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { EditorState } from 'draft-js';

// import BasicStyle from "rc-editor-plugin-basic-style";
// import Emoji from "rc-editor-plugin-emoji";
// import "rc-editor-plugin-emoji/assets/index.css";

// const plugins = [BasicStyle, Emoji];
const toolbars = [['bold', 'italic', 'underline', 'strikethrough', '|', 'superscript', 'subscript', '|', 'emoji']];

export default class Editor extends React.Component<any, IEditorState> {

    controls: {
        editor: EditorCorePublic.EditorCore;
    };

    keyDown = (ev): boolean => {
        if (ev.keyCode === 13 && ev.ctrlKey) {
            return true;
        }
    }

    editorChange = (editorState: EditorState): EditorState => {
        this.setState({
            value: editorState,
        });

        return this.state.value;
    }

    reset = (): void => {
        this.setState({
            value: this.state.defaultValue,
        });
    }

    componentWillMount(): void {
        this.controls = {
            editor: null
        };

        this.state = {
            defaultValue: null,
            value: null
        };
    }

    componentDidMount(): void {
        this.setState({
            defaultValue: this.controls.editor.toEditorState('Hello World!!!'),
            value: null
        });
    }

    render(): JSX.Element {
        return (
            <div>
                <button onClick={this.reset}> setText </button>
                <EditorCorePublic.EditorCore
                    multiLines={true}
                    ref={ref => this.controls.editor = ref}
                    onKeyDown={(ev) => this.keyDown(ev)}
                    onChange={this.editorChange}
                    value={this.state.value} />
            </div>
        );
    }
}

interface IEditorState {
    value?: EditorState;
    defaultValue?: EditorState;
}

// const Editor = React.createClass({


//     getInitialState() {
//         return {
//             defaultValue: EditorCorePublic.toEditorState("hello world"),
//             value: null,
//         };
//     },
//     keyDown(ev) {
//         if (ev.keyCode === 13 && ev.ctrlKey) {
//             return "split-block";
//         }
//     },
//     editorChange(editorState) {
//         this.setState({
//             value: editorState,
//         });
//     },
//     reset() {
//         this.setState({
//             value: this.state.defaultValue,
//         });
//     },
//     render() {
//         return (<div>
//             <button onClick={this.reset}> setText </button>
//             <EditorCorePublic.EditorCore
//                 multiLines={true}
//                 ref="editor"
//                 onKeyDown={(ev) => this.keyDown(ev).bind(this)}
//                 onChange={this.editorChange}
//                 value={this.state.value}
//                 />
//         </div>);
//     }
// });

// export default Editor;
