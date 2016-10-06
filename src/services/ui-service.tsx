import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as createFragment from 'react-addons-create-fragment';
import * as Rx from 'rxjs';
import * as DraftJS from 'draft-js';
import * as Immutable from 'immutable';

import {Toolbar, ToolbarGroup, ToolbarSeparator} from 'material-ui/Toolbar';

import { Config } from '../editorcore/configstore';
import { EditorCore } from '../EditorCore/Editor';
import { EditorService } from './editor-service';

import * as Components from '../components';

export class UiService {

    private editorService: EditorService;    

    constructor(editorService: EditorService) {
        this.editorService = editorService;
    }

    public getCursorCursorRect(): ClientRect {
        // The rectangle that bounds the editor
        // var editorNode: Element = ReactDOM.findDOMNode(editor);
        // var editorBound: ClientRect = editorNode.getBoundingClientRect();

        // The rectangle that bounds the cursor
        let selection: Selection = window.getSelection();
        let oRange: Range = selection.getRangeAt(0);
        return oRange.getBoundingClientRect();
    }

    public getAvailableCommands = (): JSX.Element => {
        return (
            <div>
               
                <Components.ToggleHeadingComponent editorService={this.editorService}/>
            </div>
        );
    }
}
