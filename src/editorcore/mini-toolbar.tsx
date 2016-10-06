/// <reference  path="../../typings/index.d.ts"/>
/// <reference  path="../material-ui.extends.d.ts"/>

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import RenderToLayer from 'material-ui/internal/RenderToLayer';
import { propTypes } from 'material-ui/utils/propTypes';
import Paper from 'material-ui/Paper';
import { throttle, Cancelable } from 'lodash';
import PopoverAnimationDefault from 'material-ui/Popover/PopoverAnimationDefault';

import * as Services from '../services';

export class MiniToolBar extends React.Component<IMiniToolBarProps, IMiniToolBarState> {

  private handleResize: Cancelable;
  private handleScroll: Cancelable;
  private target: ClientRect;
  private timeout: NodeJS.Timer;
  private controls: {
    layer: RenderToLayer
  };
  private uiService: Services.UiService;

  constructor(props: IMiniToolBarProps) {
    super(props);    
  }

  componentWillMount(): void {
    this.props = {
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'left',
      },
      animated: true,
      autoCloseWhenOffScreen: true,
      canAutoPosition: true,
      onRequestClose: () => { },
      open: false,

      targetOrigin: {
        vertical: 'top',
        horizontal: 'left',
      },
      useLayerForClickAway: true,
      zDepth: 1,
    };

    this.state = {
      open: false,
      closing: false,
    };

    this.handleResize = throttle(this.setPlacement);
    this.handleScroll = throttle(this.setPlacement);

    this.controls = {
      layer: null
    };
  }

  componentWillReceiveProps(nextProps: IMiniToolBarProps): void {
    if (nextProps.open !== this.state.open) {
      if (nextProps.open) {
        this.target = nextProps.target || this.props.target;
        this.setState({
          open: true,
          closing: false,
        });
      } else {
        if (nextProps.animated) {
          if (this.timeout !== null) {
            return;
          }

          this.setState({ closing: true });

          // this.timeout = setTimeout(() => {
          //   this.setState({ open: false, }, () => { this.timeout = null; });
          // }, 500, null);
          this.setState({ open: false, }, () => { this.timeout = null; });
        } else {
          this.setState({
            open: false,
          });
        }
      }
    }
  }
  
  componentWillUnmount(): void {
    this.handleResize.cancel();
    this.handleScroll.cancel();

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  componentDidUpdate(): void {
    this.setPlacement(null);
  }

  public setUiService = (uiService: Services.UiService): void => {
    this.uiService = uiService;
  }

  public setChidren = (child: React.ReactNode): void => {
    this.setState({ children: child });
    // this.props.children = child;
  }

  private onRequestClose = (reason: string): void => {
    this.setState({
      open: false
    });
  }

  private renderLayer = () => {
    if (!this.state.open) {
      return null;
    }

    return (
      <Paper style={{ position: 'fixed' }} open={this.state.open}>
        <div>
          {this.uiService.getAvailableCommands()}
        </div>
      </Paper>
    );
  }

  private requestClose = (reason): void => {
    if (this.props.onRequestClose) {
      this.props.onRequestClose(reason);
    }
  }

  private componentClickAway = () => {
    this.requestClose('clickAway');
  };

  getAnchorPosition(el: ClientRect) {
    const a: any = {
      top: el.top,
      left: el.left,
      width: el.width,
      height: el.height,
    };

    a.right =  el.right || a.left + a.width;
    a.bottom = el.bottom || a.top + a.height;
    a.middle = a.left + ((a.right - a.left) / 2);
    a.center = a.top + ((a.bottom - a.top) / 2);

    return a;
  }

  getTargetPosition(targetEl) {
    return {
      top: 0,
      center: targetEl.offsetHeight / 2,
      bottom: targetEl.offsetHeight,
      left: 0,
      middle: targetEl.offsetWidth / 2,
      right: targetEl.offsetWidth,
    };
  }

  setPlacement = (scrolling) => {
    if (!this.props.target) {
      return;
    }

    if (!this.state.open) {
      return;
    }

    if (!this.controls.layer) {
      return;
    }

    const targetEl: HTMLElement = this.controls.layer.getLayer().children[0];
    if (!targetEl) {
      return;
    }

    const {targetOrigin, anchorOrigin} = this.props;
    const anchorEl: ClientRect = this.props.target;

    const anchor = this.getAnchorPosition(anchorEl);
    let target = this.getTargetPosition(targetEl);

    let targetPosition = {
      top: anchor[anchorOrigin.vertical] - target[targetOrigin.vertical],
      left: anchor[anchorOrigin.horizontal] - target[targetOrigin.horizontal],
    };

    if (scrolling && this.props.autoCloseWhenOffScreen) {
      this.autoCloseWhenOffScreen(anchor);
    }

    if (this.props.canAutoPosition) {
      target = this.getTargetPosition(targetEl); // update as height may have changed
      targetPosition = this.applyAutoPositionIfNeeded(anchor, target, targetOrigin, anchorOrigin, targetPosition);
    }

    targetEl.style.top = `${Math.max(0, targetPosition.top)}px`;
    targetEl.style.left = `${Math.max(0, targetPosition.left)}px`;
    targetEl.style.maxHeight = `${window.innerHeight}px`;
  }

  autoCloseWhenOffScreen(anchorPosition: ClientRect): void {
    if (anchorPosition.top < 0 ||
      anchorPosition.top > window.innerHeight ||
      anchorPosition.left < 0 ||
      anchorPosition.left > window.innerWidth) {
      this.requestClose('offScreen');
    }
  }

  getOverlapMode(anchor, target, median): string {
    if ([anchor, target].indexOf(median) >= 0) {
      return 'auto';
    }

    if (anchor === target) {
      return 'inclusive';
    }

    return 'exclusive';
  }

  getPositions(anchor: any, target: any) {
    const a = anchor;
    const t = target;

    const positions = {
      x: ['left', 'right'].filter((p) => p !== t.horizontal),
      y: ['top', 'bottom'].filter((p) => p !== t.vertical),
    };

    const overlap = {
      x: this.getOverlapMode(a.horizontal, t.horizontal, 'middle'),
      y: this.getOverlapMode(a.vertical, t.vertical, 'center'),
    };

    positions.x.splice(overlap.x === 'auto' ? 0 : 1, 0, 'middle');
    positions.y.splice(overlap.y === 'auto' ? 0 : 1, 0, 'center');

    if (overlap.y !== 'auto') {
      a.vertical = a.vertical === 'top' ? 'bottom' : 'top';
      if (overlap.y === 'inclusive') {
        t.vertical = t.vertical;
      }
    }

    if (overlap.x !== 'auto') {
      a.horizontal = a.horizontal === 'left' ? 'right' : 'left';
      if (overlap.y === 'inclusive') {
        t.horizontal = t.horizontal;
      }
    }

    return {
      positions: positions,
      anchorPos: a,
    };
  }

  applyAutoPositionIfNeeded(anchor, target, targetOrigin, anchorOrigin, targetPosition) {
    const {positions, anchorPos} = this.getPositions(anchorOrigin, targetOrigin);

    if (targetPosition.top < 0 || targetPosition.top + target.bottom > window.innerHeight) {
      let newTop = anchor[anchorPos.vertical] - target[positions.y[0]];
      if (newTop + target.bottom <= window.innerHeight) {
        targetPosition.top = Math.max(0, newTop);
      } else {
        newTop = anchor[anchorPos.vertical] - target[positions.y[1]];
        if (newTop + target.bottom <= window.innerHeight) {
          targetPosition.top = Math.max(0, newTop);
        }
      }
    }

    if (targetPosition.left < 0 || targetPosition.left + target.right > window.innerWidth) {
      let newLeft = anchor[anchorPos.horizontal] - target[positions.x[0]];
      if (newLeft + target.right <= window.innerWidth) {
        targetPosition.left = Math.max(0, newLeft);
      } else {
        newLeft = anchor[anchorPos.horizontal] - target[positions.x[1]];
        if (newLeft + target.right <= window.innerWidth) {
          targetPosition.left = Math.max(0, newLeft);
        }
      }
    }

    return targetPosition;
  }  

  public open(): void {
    this.setState({
      open: true
    });
  }

  render(): JSX.Element {
    return (
      <div style={{ position: 'fixed' }}>
        <RenderToLayer
          ref={ref => this.controls.layer = ref}
          open={this.state.open}
          componentClickAway={this.componentClickAway}
          useLayerForClickAway={this.props.useLayerForClickAway}
          render={this.renderLayer} />   
      </div>
    );
  }
}

interface IMiniToolBarProps extends React.Props<MiniToolBar> {

    target?: ClientRect;  
    /**
     * This is the point on the anchor where the popover's
     * `targetOrigin` will attach to.
     * Options:
     * vertical: [top, middle, bottom];
     * horizontal: [left, center, right].
     */
    anchorOrigin?: propTypes.origin;
    /**
     * If true, the popover will apply transitions when
     * it is added to the DOM.
     */
    animated?: boolean;
    /**
     * Override the default animation component used.
     */
    animation?: Function;
    /**
     * If true, the popover will hide when the anchor is scrolled off the screen.
     */
    autoCloseWhenOffScreen?: boolean;
    /**
     * If true, the popover (potentially) ignores `targetOrigin`
     * and `anchorOrigin` to make itself fit on screen,
     * which is useful for mobile devices.
     */
    canAutoPosition?: boolean;

    /**
     * Callback function fired when the popover is requested to be closed.
     *
     * @param {string} reason The reason for the close request. Possibles values
     * are 'clickAway' and 'offScreen'.
     */
    onRequestClose?: Function;
    /**
     * If true, the popover is visible.
     */
    open?: boolean;

    /**
     * This is the point on the popover which will attach to
     * the anchor's origin.
     * Options:
     * vertical: [top, middle, bottom];
     * horizontal: [left, center, right].
     */
    targetOrigin?: propTypes.origin;
    /**
     * If true, the popover will render on top of an invisible
     * layer, which will prevent clicks to the underlying
     * elements, and trigger an `onRequestClose('clickAway')` call.
     */
    useLayerForClickAway?: boolean;
    /**
     * The zDepth of the popover.
     */
    zDepth?: number;
}

interface IMiniToolBarState { 
  children?: React.ReactNode;
  open?: boolean;
  closing?: boolean;
}
