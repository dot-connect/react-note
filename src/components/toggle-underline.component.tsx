import * as Draft from 'draft-js';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Rx from 'rxjs';

import IconButton from 'material-ui/IconButton';
import FormatUnderLine from 'material-ui/svg-icons/editor/format-underlined';

import { EditorService } from '../services/editor-service';

export class ToggleUnderLineComponent extends React.Component<IToggleUnderLineComponentProps, IToggleUnderLineComponentState> {
    private controls = {
        button: IconButton
    };

    private clickStream: Rx.Subscription = null;

    public editorService: EditorService;

    constructor(props: IToggleUnderLineComponentProps) {
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
        let editorState = Draft.RichUtils.toggleInlineStyle(this.editorService.getEditorState(), 'UNDERLINE');
        this.editorService.updateState(editorState);
    }

    onButtonClick = () => {
        this.toggle();
    }

    render(): JSX.Element {
        return (
            <IconButton ref={ref => this.controls.button = ref}
                disabled={this.state.isDisabled}>
                <FormatUnderLine/>
            </IconButton>
        );
    }
}

interface IToggleUnderLineComponentProps extends React.Props<ToggleUnderLineComponent> {
    editorService?: EditorService;
}

interface IToggleUnderLineComponentState {
    isDisabled?: boolean;
}