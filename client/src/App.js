import React, { Component } from "react";
import { Router, Switch, Route, Redirect } from "react-router-dom";
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
        <Router history={history}>
          <Switch>
            <Route path="/json" component={jsonView} />
            <Route path="/table" component={tableView} />
            <Route path="/" component={jsonView} />
            <Redirect from="*" to={"/json"} />
          </Switch>
        </Router>
      </div>
    )
  }
}

export default App;
