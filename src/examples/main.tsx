import '../shared/less/app.less';
import 'reflect-metadata';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, Route, Redirect, IndexRoute, browserHistory } from 'react-router';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import * as injectTapEventPlugin from 'react-tap-event-plugin';

import Editor from './basic';

injectTapEventPlugin();


const muiTheme = getMuiTheme({

});

ReactDOM.render((
    <MuiThemeProvider muiTheme={muiTheme}>
            <Editor/>
     </MuiThemeProvider>   
), document.getElementById('content'));

