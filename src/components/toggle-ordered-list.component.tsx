import * as Draft from 'draft-js';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Rx from 'rxjs';

import RaisedButton from 'material-ui/RaisedButton';
import FormatListNumbered from 'material-ui/svg-icons/editor/format-list-numbered';

import { EditorService } from '../services/editor-service';

export class ToggleOrderedListComponent extends React.Component<IToggleOrderedListComponentProps, IToggleOrderedListComponentState> {
    private controls = {
        button: RaisedButton
    };

    private clickStream: Rx.Subscription = null;

    public editorService: EditorService;

    constructor(props: IToggleOrderedListComponentProps) {
        super(props);
    }

    componentWillMount(): void {
        this.controls = {
            button: null
        };

        this.state = {
            isDisabled: false
        };
    }

    componentDidMount(): void {
        this.clickStream = Rx.Observable.fromEvent(ReactDOM.findDOMNode(this.controls.button as any), 'click')
            .subscribe(this.onButtonClick);
        this.editorService = !this.editorService ? this.props.editorService : this.editorService;
    }

    componentWillUnmount(): void {
        this.clickStream.unsubscribe();
    }

    toggle(): void {
        let editorState = Draft.RichUtils.toggleBlockType(this.editorService.getEditorState(), 'ordered-list-item');
        this.editorService.updateState(editorState);
    }

    onButtonClick = () => {
        this.toggle();
    }

    render(): JSX.Element {
        return (
            <RaisedButton ref={ref => this.controls.button = ref}
                disabled={this.state.isDisabled}
                icon={<FormatListNumbered />} />
        );
    }    
}

interface IToggleOrderedListComponentProps extends React.Props<ToggleOrderedListComponent> {
    editorService?: EditorService;
}

interface IToggleOrderedListComponentState {
    isDisabled?: boolean;
}