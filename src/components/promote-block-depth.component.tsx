import * as React from 'react';
import * as DraftJS from 'draft-js';
import * as Services from '../services';
import * as Utils from '../editorcore/utils';

import { TouchTapEvent } from 'material-ui';
import IconButton from 'material-ui/IconButton';
import EditorFormatIndentIncrease from 'material-ui/svg-icons/editor/format-indent-increase';

export class PromoteBlockDethComponent extends React.Component<IPromoteBlockDepthComponentProps, IPromoteBlockDepthComponentState> {

    public editorService: Services.EditorService;

    constructor(props: IPromoteBlockDepthComponentProps) {
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
        let newEditorState = Utils.changeDepth(this.editorService.getEditorState(), 1, 3);
        this.editorService.updateState(newEditorState);
    }

    render(): JSX.Element {
        return (
            <IconButton disabled={this.state.isDisabled}
                onTouchTap={this.onTouchTap}>
                <EditorFormatIndentIncrease />
            </IconButton>
        );
    }
}

interface IPromoteBlockDepthComponentProps {
    editorService?: Services.EditorService;
}

interface IPromoteBlockDepthComponentState {
    isDisabled?: boolean;
}