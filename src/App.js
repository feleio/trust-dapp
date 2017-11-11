import React, { Component } from 'react'
import TrustContract from '../build/contracts/Trust.json'
import getWeb3 from './utils/getWeb3'

import Submissions from './components/Submissions'

var NotificationSystem = require('react-notification-system');

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loadingWeb3: false,
      web3: null,
      trustContractInstance: null
    }
  }

  componentWillMount() {
    this.setupWeb3(() => {
      this.instantiateContract();
    })
  }

  componentDidMount() {
    this._notificationSystem = this.refs.notificationSystem;
    this.addNotification("Welcome to Trust Game !", "success")
  }

  addNotification(message, level) {
    this._notificationSystem.addNotification({
      message: message,
      level: level,
      position: "br"
    })
  }

  setupWeb3(cb) {
    this.setState({loadingWeb3: true,});
    getWeb3.then(results => {
      let web3 = results.web3;
      if (!web3) {
        return this.setState({
          loadingWeb3: false,
          network: "Unknown",
          web3: null
        });
      }

      let networkName;
      web3.version.getNetwork((err, networkId) => {
        switch (networkId) {
          case "1":
            networkName = "Main";
            break;
          case "2":
            networkName = "Morden";
            break;
          case "3":
            networkName = "Ropsten";
            break;
          case "4":
            networkName = "Rinkeby";
            break;
          case "42":
            networkName = "Kovan";
            break;
          default:
            networkName = "Unknown";
        }

        this.setState({
          loadingWeb3: false,
          web3: web3,
          networkName: networkName
        });
        cb();
      });
    }).catch((err) => {
      this.setState({loadingWeb3: false});
      console.log('Error finding web3.', err.message);
    });
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract')
    const trustContract = contract(TrustContract)
    trustContract.setProvider(this.state.web3.currentProvider)

    // Get accounts.
    trustContract.deployed().then((trustContractInstance) => {
      this.setState({trustContractInstance})
    }).catch((err) => {
      this.addNotification(err.message, "error");
    })
  }

  render() {
    return (
      <div className="App">
        <NotificationSystem ref="notificationSystem"/>
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Trust game</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Good to Go!</h1>
              <h2>Trust Game</h2>
              <h3>What are the rules?</h3>
              <ul>
                <li>There are only 3 player in this game.</li>
                <li>Each player transfer ETHs to the contract and either decides to trust or not to trust.</li>
                <li>The game ends when the third player makes his/her decision.</li>
                <li>Result:</li>
                <li>If all 3 players decided to trust, then each player will get back the amount of fund they have transferred.</li>
                <li>If only 1 player decided not to trust, then the player will get full amount of fund. Other players and the owner get nothing</li>
                <li>Otherwise, owner will get full amount of fund and all players will get nothing.</li>
              </ul>
              {!this.state.web3 || !["Unknown", "Rinkeby"].includes(this.state.networkName) &&
                <p>The App is only live on Rinkeby Test Network, please setup MetaMask/Mist to connect to
        Rinkeby</p>
              }
              {this.state.trustContractInstance &&
              <Submissions web3={this.state.web3}
                 contractInstance={this.state.trustContractInstance}
                 addNotification={this.addNotification.bind(this)}></Submissions>}
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
