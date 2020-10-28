import React, { Component } from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import { createBrowserHistory } from "history";

import {
  jsonView,
  tableView
} from './pages'

const history = createBrowserHistory();

class App extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <div className="App">
        <BrowserRouter history={history}>
          <Switch>
            <Route exact path="/json" component={jsonView} />
            <Route excat path="/table" component={tableView} />
            <Redirect from="*" to={"/table"} />
          </Switch>
        </BrowserRouter>
      </div>
    )
  }
}

export default App;
