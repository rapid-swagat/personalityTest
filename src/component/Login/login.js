import React, { Component } from "react";
import right from "./right.svg";
import left from "./left.svg";
import name from "./name.svg";
import "./Login.css";
import * as Msal from "msal";
import { Redirect } from "react-router-dom";

const msalConfig = {
  auth: {
    clientId: "cd5db0ec-1419-4ae6-9434-21cfb83fc42d",
    clientSecret: "aaveSasdOVWOD9[^dzvD7230}?",
    authority: "https://login.microsoftonline.com/common/",
    redirectUri: "http://localhost:3000/",
  },
};
const msalInstance = new Msal.UserAgentApplication(msalConfig);
let loginRequest = {
  scopes: ["cd5db0ec-1419-4ae6-9434-21cfb83fc42d/.default"],
};

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = { token: [] };
  }

  clickLogin = () => {
    msalInstance
      .loginPopup(loginRequest)
      .then((response) => {
        this.setState({ token: response });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  render() {
    const token = this.state.token;
    if (token.account) {
      return (
        <Redirect
          to={{
            pathname: "/form",
            state: {
              token: `${token.account.name}`,
              name: `${token.idToken.rawIdToken}`,
            },
          }}
        />
      );
    }
    return (
      <div className="main">
        <div className="login">
          <div className="login-container">
            <embed src={name} alt="img" />
            <div style={{ padding: "30px" }}>
              <p style={{ color: "white" }}>Log in to RAPID PLATFORM</p>
            </div>
          </div>

          <div onClick={this.clickLogin}>
            <a>Log in</a>
          </div>
        </div>
        <embed src={left} alt="img" className="leftImage" />
        <embed src={right} alt="img" className="rightImage" />
      </div>
    );
  }
}

export default Login;
