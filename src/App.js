import React, { Component } from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./component/Login/login";
import Form from "./component/Form/Form";

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/" exact component={Login} />
          <Route path="/form" exact component={Form} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
