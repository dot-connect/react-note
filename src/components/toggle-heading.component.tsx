import * as Draft from 'draft-js';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Rx from 'rxjs';

import IconButton from 'material-ui/IconButton';
import FormatQuote from 'material-ui/svg-icons/editor/format-quote';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import { EditorService } from '../services/editor-service';

export class ToggleHeadingComponent extends React.Component<IToggleHeadingComponentProps, IToggleHeadingComponentState> {
    private controls = {
        selectField: SelectField
    };

    private valueStream: Rx.BehaviorSubject<string>;

    private clickStream: Rx.Subscription = null;

    public editorService: EditorService;

    constructor(props: IToggleHeadingComponentProps) {
        super(props);
    }

    componentWillMount(): void {
        this.controls = {
            selectField: null
        };

        this.state = {
            isDisabled: false
        };

        this.valueStream = new Rx.BehaviorSubject('');
    }

    componentDidMount(): void {
        this.editorService = !this.editorService ? this.props.editorService : this.editorService;
        this.valueStream
            .distinctUntilChanged()
            .subscribe(value => {
                let editorState = Draft.RichUtils.toggleBlockType(this.editorService.getEditorState(), value);
                this.editorService.updateState(editorState);
                this.setState({ value: value });
            });
    }

    componentWillUnmount(): void {
        this.valueStream.unsubscribe();
    }

    onChange = (event: any, key: number, payload: string) => {
        this.valueStream.next(payload);
      
    }

    render(): JSX.Element {
        return (
            <SelectField ref={ref => this.controls.selectField = ref}
                disabled={this.state.isDisabled}
                value={this.state.value}
                onChange={this.onChange}>
                <MenuItem value={'unstyled'} primaryText="Normal" />
                <MenuItem value={'header-one'} primaryText="Heading 1" />
                <MenuItem value={'header-two'} primaryText="Heading 2" />
                <MenuItem value={'header-three'} primaryText="Heading 3" />
                <MenuItem value={'header-four'} primaryText="Heading 4" />
                <MenuItem value={'header-five'} primaryText="Heading 5" />
                <MenuItem value={'header-six'} primaryText="Heading 6" />
            </SelectField>
        );
    }
}

interface IToggleHeadingComponentProps extends React.Props<ToggleHeadingComponent> {
    editorService?: EditorService;
}

interface IToggleHeadingComponentState {
    isDisabled?: boolean;
    value?: string;
}