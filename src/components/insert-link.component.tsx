import * as React from 'react';
import * as DraftJS from 'draft-js';
import * as Services from '../services';
import * as Utils from '../editorcore/utils';

import { TouchTapEvent } from 'material-ui';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import EditorFormatInsertLink from 'material-ui/svg-icons/editor/insert-link';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';

export class InsertLinkComponent extends React.Component<IInsertLinkComponentProps, IInsertLinkComponentState> {

    public editorService: Services.EditorService;

    constructor(props: IInsertLinkComponentProps) {
        super(props);
    }

    componentWillMount(): void {
        this.state = {
            isDisabled: false
        };
    }

    componentDidMount(): void {
        this.editorService = !this.editorService ? this.props.editorService : this.editorService;
    }

    private onTouchTap = (event: TouchTapEvent): void => {
        this.setState({ openDialog: true });
    }

    private handleCloseDialog = (buttonClicked: boolean): void => {
        this.setState({ openDialog: false });
    }

    private handleCancelTap = (event: TouchTapEvent): void => {
        this.handleCloseDialog(true);
    }

    private handleOkTap = (event: TouchTapEvent): void => {
        this.handleCloseDialog(true);
        
    }

    render(): JSX.Element {
        const actions = [
            <FlatButton
                label="Ok"
                primary={true}
                keyboardFocused={true}
                onTouchTap={this.handleOkTap} />,
            <FlatButton
                label="Cancel"
                primary={true}
                onTouchTap={this.handleCancelTap} />
        ];
        return (
            <IconButton disabled={this.state.isDisabled}
                onTouchTap={this.onTouchTap}>
                <EditorFormatInsertLink />
                <Dialog actions={actions}
                    modal={false}
                    open={this.state.openDialog}
                    onRequestClose={this.handleCloseDialog}>
                    <div>
                        <TextField hintText="Text" />
                    </div>
                    <div>
                        <TextField hintText="Link" />
                    </div>    
                 </Dialog>
            </IconButton>
        );
    }
}

interface IInsertLinkComponentProps {
    editorService?: Services.EditorService;
}

interface IInsertLinkComponentState {
    isDisabled?: boolean;
    openDialog?: boolean;
}
