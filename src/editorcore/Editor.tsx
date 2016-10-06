/// <reference path="../draftExt.d.ts" />

import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as Rx from 'rxjs';
import {
  Editor,
  EditorState,
  ContentState,
  CompositeDecorator,
  getDefaultKeyBinding,
  KeyBindingUtil,
  DefaultDraftBlockRenderMap,
  DraftBlockRenderConfig,
  ContentBlock,
  SelectionState
} from 'draft-js';

import Paper from 'material-ui/Paper';
import Popover from 'material-ui/Popover/Popover';

import { objectAssign } from 'object-assign';
import { List, Map } from 'immutable';

import { ConfigStore } from './ConfigStore';
import { Plugin } from '../interface';
import { EditorService, UiService } from '../services';
import { MiniToolBar } from './mini-toolbar';
import { ToolBar } from '../toolbar/toolbar';

const { hasCommandModifier } = KeyBindingUtil;

function noop(): void { };

export interface EditorProps extends React.Props<EditorCore> {
  multiLines: boolean;
  plugins?: Array<Plugin>;
  pluginConfig?: Object;
  prefixCls?: string;
  onChange?: (editorState: EditorState) => EditorState;
  toolbars?: Array<any>;
  splitLine?: String;
  onKeyDown?: (ev: any) => boolean;
  defaultValue?: EditorState;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: Object;
  value?: EditorState | any;
}

export interface EditorCoreState {
  editorState?: EditorState;
  customStyleMap?: Object;
  customBlockStyleMap?: Object;
  blockRenderMap?: Map<String, DraftBlockRenderConfig>;
  toolbarPlugins?: List<Plugin>;
  plugins?: Array<Plugin>;
  compositeDecorator?: CompositeDecorator;
  currentCursorBound?: ClientRect;
  miniToolbarOpen?: boolean;
  commands?: React.ReactNode;
}

export class EditorCore extends React.Component<EditorProps, EditorCoreState> {

  public state: EditorCoreState;
  public configStore: ConfigStore = new ConfigStore();
  public controls: {
    editorContainer?: HTMLDivElement;
    editor?: Editor;
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

    let editorState: EditorState = null;
    if (props.value !== undefined) {
      if (props.value instanceof EditorState) {
        editorState = props.value || EditorState.createEmpty();
      } else {
        editorState = EditorState.createEmpty();
      }
    } else {
      editorState = EditorState.createEmpty();
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

  handleKeyCommand = (command: String): boolean => {
    return command === 'split-block';
  }

  handleKeyBinding = (ev: React.KeyboardEvent): any => {
    return getDefaultKeyBinding(ev);
  }

  setEditorState = (editorState: EditorState, focusEditor: boolean = false): void => {
    let newEditorState: EditorState = editorState;

    if (this.props.onChange) {
      this.props.onChange(newEditorState);
    }
    if (!this.controlledMode) {
      this.setState({ editorState: newEditorState }, focusEditor ? () => setTimeout(() => this.controls.editor.focus(), 100) : noop);
    }
  }

  getBlockStyle = (contentBlock: ContentBlock): string => {
    const customBlockStyleMap = this.configStore.get('customBlockStyleMap');
    const type = contentBlock.getType();
    if (customBlockStyleMap.hasOwnProperty(type)) {
      return customBlockStyleMap[type];
    }
  }

  onMiniToolBarRequestClose = (reason: string): void => {
    // this.setState({ currentCursorBound: null });
    this.miniToolBarOpen.next(false);
  }

  public getEditorState(text: string): EditorState {
    return this.manager.toEditorState(text);
  }

  public getText(encode: boolean = false): string {
    return this.manager.getText(this.state.editorState, encode);
  }

  public getHtml(encode: boolean = false): string {
    return this.manager.getHtml(this.state.editorState, encode);
  }

  public Reset(): void {
    this.setEditorState(
      EditorState.push(this.state.editorState, this.props.defaultValue.getCurrentContent(), 'reset-editor')
    );
  }

  public SetText(text: string): void {
    const createTextContentState = ContentState.createFromText(text || '');
    const editorState = EditorState.push(this.state.editorState, createTextContentState, 'editor-setText');
    this.setEditorState(
      EditorState.moveFocusToEnd(editorState)
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
        : EditorState.set(nextProps.value, { decorator: this.state.compositeDecorator });
      this.setState({
        editorState,
      });
    }
  }

  generatorDefaultValue(editorState: EditorState): EditorState {
    const { defaultValue } = this.props;
    if (defaultValue) {
      return defaultValue;
    }
    return editorState;
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
      let newState = EditorState.forceSelection(this.state.editorState, contentState.getSelectionAfter());
      this.setState({ editorState: newState, miniToolbarOpen: value });
      return;
    }

    this.setState({ miniToolbarOpen: value });
  }

  render(): JSX.Element {
    const prefixCls = 'react-note';
    return (
      <div style={{ minHeight: '45px', minWidth: '250px' }}>
        <ToolBar editorService={this.manager}/>  
        <Paper className={`${prefixCls}-editor`}
          ref={ref => this.controls.editorContainer = ref}
          onFocus={this.onEditorFocus}>
          <div className={`${prefixCls}-editor-wrapper`}>
            <Editor
              ref={ref => this.controls.editor = ref}
              editorState={this.state.editorState}
              onChange={this.setEditorState} />
            {this.props.children}
          </div>
        </Paper>
      </div>
    );
  }
}
