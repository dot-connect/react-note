/// <reference path="../draftExt.d.ts" />

import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as Rx from 'rxjs';
import * as DraftJS from 'draft-js';

import Paper from 'material-ui/Paper';
import Popover from 'material-ui/Popover/Popover';

import { objectAssign } from 'object-assign';
import { List, Map } from 'immutable';

import { ConfigStore } from './ConfigStore';
import { Plugin } from '../interface';
import { EditorService, UiService } from '../services';
import { MiniToolBar } from './mini-toolbar';
import { ToolBar } from '../toolbar/toolbar';

import 'draft-js/dist/Draft.css';

const { hasCommandModifier } = DraftJS.KeyBindingUtil;

function noop(): void { };

export interface EditorProps extends React.Props<EditorCore> {
  multiLines: boolean;
  plugins?: Array<Plugin>;
  pluginConfig?: Object;
  prefixCls?: string;
  onChange?: (editorState: DraftJS.EditorState) => DraftJS.EditorState;
  toolbars?: Array<any>;
  splitLine?: String;
  onKeyDown?: (ev: any) => boolean;
  defaultValue?: DraftJS.EditorState;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: Object;
  value?: DraftJS.EditorState | any;
}

export interface EditorCoreState {
  editorState?: DraftJS.EditorState;
  customStyleMap?: Object;
  customBlockStyleMap?: Object;
  blockRenderMap?: Map<String, DraftJS.DraftBlockRenderConfig>;
  toolbarPlugins?: List<Plugin>;
  plugins?: Array<Plugin>;
  compositeDecorator?: DraftJS.CompositeDecorator;
  currentCursorBound?: ClientRect;
  miniToolbarOpen?: boolean;
  commands?: React.ReactNode;
}

export class EditorCore extends React.Component<EditorProps, EditorCoreState> {

  public state: EditorCoreState;
  public configStore: ConfigStore = new ConfigStore();
  public controls: {
    editorContainer?: HTMLDivElement;
    editor?: DraftJS.Editor;
    miniToolBar?: MiniToolBar
  };
  public miniToolBarOpen: Rx.BehaviorSubject<boolean>;

  private manager: EditorService;
  private uiService: UiService;
  private plugins: List<Plugin>;
  private controlledMode: boolean;

  private editorContainerMouseUpStream: Rx.Subscription;
  private editorContainerDoubleClickStream: Rx.Subscription;
  private miniToolBarOpenStream: Rx.Subscription;

  constructor(props: EditorProps) {
    super(props);

    this.manager = new EditorService(this);
    this.uiService = new UiService(this.manager);

    // this.plugins = List(List(props.plugins).flatten(true));

    let editorState: DraftJS.EditorState = null;
    if (props.value !== undefined) {
      if (props.value instanceof DraftJS.EditorState) {
        editorState = props.value || DraftJS.EditorState.createEmpty();
      } else {
        editorState = DraftJS.EditorState.createEmpty();
      }
    } else {
      editorState = DraftJS.EditorState.createEmpty();
    }

    editorState = this.generatorDefaultValue(editorState);

    this.state = {
      // plugins: this.reloadPlugins(),
      editorState: editorState,
      customStyleMap: {},
      customBlockStyleMap: {},
      compositeDecorator: null,
      miniToolbarOpen: false
    };

    if (props.value !== undefined) {
      this.controlledMode = true;
      console.warn('this component is in controllred mode');
    }
  }

  public render(): JSX.Element {
    const prefixCls = 'react-note';
    return (
      <div style={{ minHeight: '45px', minWidth: '250px' }}>
        <ToolBar editorService={this.manager}/>  
        <Paper className={`${prefixCls}-editor`}
          ref={ref => this.controls.editorContainer = ref}
          onFocus={this.onEditorFocus}>
          <div className={`${prefixCls}-editor-wrapper`}>
            <DraftJS.Editor
              ref={ref => this.controls.editor = ref}
              editorState={this.state.editorState}
              onChange={this.onChange}
              handleKeyCommand={this.handleKeyCommand}
              onTab={this.onTab}/>
            {this.props.children}
          </div>
        </Paper>
      </div>
    );
  }

  private onTab = (event: React.KeyboardEvent) => {
    event.preventDefault();
    this.manager.handleTab();
    // let editorState = this.getEditorState();
    //     let newEditorState = DraftJS.RichUtils.onTab(event, editorState, 3);
    //     debugger;
    //     if (newEditorState !== editorState) {
    //         this.setEditorState(newEditorState);
    //     }
  }

  // private handleReturn = (event: React.KeyboardEvent): boolean => {
  //   if (this.manager.handleReturnEmptyListItem()) {
  //     return true;
  //   }
  //   return false;
  // }

  private handleKeyCommand = (command: string): boolean => {    
    let editorState = this.state.editorState;
    let newEditorState = DraftJS.RichUtils.handleKeyCommand(editorState, command);
    if (newEditorState) {
      this.onChange(newEditorState);
      return true;
    } else {
      return false;
    }
  }

 private handleKeyBinding = (ev: React.KeyboardEvent): any => {
    return DraftJS.getDefaultKeyBinding(ev);
  }

 private onChange = (editorState: DraftJS.EditorState): void => {

    if (this.props.onChange) {
      this.props.onChange(editorState);
    }
 }

 public setEditorState = (editorState: DraftJS.EditorState, focusEditor: boolean = false): void => {
   let newEditorState: DraftJS.EditorState = editorState;
   this.setState({ editorState: newEditorState }, focusEditor
     ? () => setTimeout(() => this.controls.editor.focus(), 0)
     : noop);
 }

  getBlockStyle = (contentBlock: DraftJS.ContentBlock): string => {
    const customBlockStyleMap = this.configStore.get('customBlockStyleMap');
    const type = contentBlock.getType();
    if (customBlockStyleMap.hasOwnProperty(type)) {
      return customBlockStyleMap[type];
    }
  }

  public getEditorState = (): DraftJS.EditorState => {
    return this.state.editorState;
  }

  public toEditorState(text: string): DraftJS.EditorState {
    return this.manager.toEditorState(text);
  }

  public Reset(): void {
    this.onChange(
      DraftJS.EditorState.push(this.state.editorState, this.props.defaultValue.getCurrentContent(), 'reset-editor')
    );
  }

  public SetText(text: string): void {
    const createTextContentState = DraftJS.ContentState.createFromText(text || '');
    const editorState = DraftJS.EditorState.push(this.state.editorState, createTextContentState, 'editor-setText');
    this.setEditorState(
      DraftJS.EditorState.moveFocusToEnd(editorState)
      , true);
  }

  public componentWillMount(): void {
    // this.props = {
    //   prefixCls: 'react-note'
    // };

    this.controls = {};
    this.miniToolBarOpen = new Rx.BehaviorSubject(false);
  }

  public componentDidMount(): void {
    // this.controls.miniToolBar.setUiService(this.uiService);

    this.editorContainerMouseUpStream
      = Rx.Observable.fromEvent(this.controls.editorContainer, 'mouseup')
        .distinctUntilChanged()
        .subscribe(this.onEditorMouseUp.bind(this));

    this.editorContainerDoubleClickStream
      = Rx.Observable.fromEvent(this.controls.editorContainer, 'dblclick')
        .distinctUntilChanged()
        .subscribe(this.onEditorDoubleClick.bind(this));
    this.miniToolBarOpenStream
      = this.miniToolBarOpen
      .distinctUntilChanged().subscribe(this.onMiniToolBarOpenChanged);
  }

  public componentWillUnmount(): void {
    this.editorContainerDoubleClickStream.unsubscribe();
    this.miniToolBarOpenStream.unsubscribe();
    this.miniToolBarOpenStream.unsubscribe();
  }

  public componentWillReceiveProps(nextProps: EditorProps) {
    if (this.controlledMode) {
      const decorators = nextProps.value.getDecorator();
      const editorState = decorators
        ? nextProps.value
        : DraftJS.EditorState.set(nextProps.value, { decorator: this.state.compositeDecorator });
      this.setState({
        editorState,
      });
    }
  }

  generatorDefaultValue(editorState: DraftJS.EditorState): DraftJS.EditorState {
    const { defaultValue } = this.props;
    if (defaultValue) {
      return defaultValue;
    }
    return editorState;
  }

  public focus = (): void => {
    this.onEditorFocus();
  }

  private onEditorFocus = (): void => {
    if (this.controls.editor !== null) {
      this.controls.editor.focus();
    }
  }

  private onEditorDoubleClick(): void {
    this.state.editorState.getSelection();
    this.setState({ currentCursorBound: this.uiService.getCursorCursorRect() });
    this.miniToolBarOpen.next(true);
  }

  private onEditorMouseUp(): void {
    let blockSelection = this.manager.getSelectedText();
    console.log(blockSelection);
    // if (blockSelection.count() !== 0) {
    //   // this.setState({ currentCursorBound: this.uiService.getCursorCursorRect() });
    //   this.miniToolBarOpen.next(true);
    // } else {
    //   // this.setState({ currentCursorBound: null });
    //   this.miniToolBarOpen.next(false);
    // }
  }

  private onMiniToolBarOpenChanged = (value: boolean) => {
    if (value === false) {
      let contentState = this.state.editorState.getCurrentContent();
      let newState = DraftJS.EditorState.forceSelection(this.state.editorState, contentState.getSelectionAfter());
      this.setState({ editorState: newState, miniToolbarOpen: value });
      return;
    }

    this.setState({ miniToolbarOpen: value });
  }
}
