import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Services from '../services';
import * as Components from '../components';

export class ToolBar extends React.Component<IToolBarProps, IToolBarState>{
    constructor(props: IToolBarProps) {
        super(props);
    }

    render(): JSX.Element {
        return (
            <div>
                <Components.ToggleBoldComponent editorService={this.props.editorService} />
                <Components.ToggleItalicComponent editorService={this.props.editorService} />
                <Components.ToggleUnderLineComponent editorService={this.props.editorService} />
                <Components.ToggleCodeComponent editorService={this.props.editorService} />
                <Components.ToggleHeadingComponent editorService={this.props.editorService} />  
                <Components.ToggleOrderedListComponent editorService={this.props.editorService} />  
                <Components.PromoteBlockDethComponent editorService={this.props.editorService} />
                <Components.DepromoteBlockDethComponent editorService={this.props.editorService} />
                <Components.InsertLinkComponent editorService={this.props.editorService}/>
            </div>
        );
    }
}

interface IToolBarProps {
    editorService?: Services.EditorService;
}

interface IToolBarState {

}