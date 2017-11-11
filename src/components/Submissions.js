import React, {Component} from 'react'

import './Submissions.css'

var Loader = require('react-loader');

class Submissions extends Component {
  constructor(props) {
    super(props);
    this.state= {
      loading: false,
      submissions: [],
      price: 0,
      owner: "",
      balance: 0
    };
    this.fetchSubmission = this.fetchSubmission.bind(this);
    this.fetchBalance = this.fetchBalance.bind(this);
    this.fetchOwner = this.fetchOwner.bind(this);
    this.load = this.load.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.gameResult = this.gameResult.bind(this);
    this.getSubmissions = this.getSubmissions.bind(this);
    this.handleWithdrawClick = this.handleWithdrawClick.bind(this);
    this.handleResetClick = this.handleResetClick.bind(this);
  }

  componentWillMount() {
    this.load().then(() => {
      this.setState({loading: false});
    });
  }

  fetchSubmission(id) {
    return this.props.contractInstance.find(id).then(
      (values) => {
        const decision = {
          player: values[0],
          isTrust: values[1],
          isWithDrawn: values[2]
        };
        return decision;
      }
    );
  }

  fetchPrice() {
    return this.props.contractInstance.price()
  }

  fetchOwner() {
    return this.props.contractInstance.owner()
  }

  fetchBalance (address) {
    const web3 = this.props.web3
    return new Promise (function (resolve, reject) {
      web3.eth.getBalance(address, function (error, result) {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      })
    })
  }

  async load() {
    this.setState({loading: true});
    const playerCount = await this.props.contractInstance.playerCount();
    let submissions = [];
    for(let i=0; i<playerCount.toNumber(); ++i){
      const submission = await this.fetchSubmission(i);
      submissions.push(submission);
    }
    const price = await this.fetchPrice();
    const owner = await this.fetchOwner();
    const balance = await this.fetchBalance(this.props.contractInstance.address);

    this.setState({balance: balance, owner: owner, submissions: submissions, price: price.toNumber()});
  }

  handleClick(isTrust) {
    this.setState({loading: true});
    this.props.contractInstance.play(
      isTrust,
      {
        value: this.state.price,
        gas: 200000
      }
    ).then((result) => {
      this.load();
      this.setState({loading: false});
    });
  }

  handleWithdrawClick() {
    this.setState({loading: true});
    this.props.contractInstance.withdraw().then((result) => {
      this.load().then(() => {
        this.setState({loading: false})
      });
    }).catch((err) => {
      this.setState({loading: false})
    });
  }

  handleResetClick() {
    this.setState({loading: true});
    this.props.contractInstance.reset().then((result) => {
      this.load().then(() => {
        this.setState({loading: false})
      });
    });
  }

  getSubmissions(accountAddress) {
    var filteredSubmissions = [];
    const submissions = this.state.submissions;
    for(let i=0;i<submissions.length;++i){
      if(submissions[i].player == accountAddress)
        filteredSubmissions.push(submissions[i]);
    }
    return filteredSubmissions;
  }

  gameResult() {
    const currentAccount = this.props.web3.eth.defaultAccount;
    const priceInEther = this.props.web3.fromWei(this.state.price);
    if(this.state.submissions.length == 3){
      var traitor;
      var trustCount = 0;
      for(let i=0;i<3;i++){
        if(this.state.submissions[i].isTrust)
          ++trustCount;
        else
          traitor = this.state.submissions[i].player;
      }

      const currentAccountSubmissions = this.getSubmissions(currentAccount);
      if(currentAccountSubmissions.length == 0 && currentAccount !== this.state.owner){
        return <h2>This account didn't take part of this game</h2>
      }

      if(this.state.balance.equals(0) && currentAccount === this.state.owner){
        return (
          <div>
            <h2>all winner has withdrawn. you can reset the game</h2>
            <button type="button" className="pure-button pure-input-1-2 button-error"
                    onClick={this.handleResetClick}>Reset
            </button>
          </div>
        )
      }

      var submissionNotWithdrawn = null;
      if(trustCount == 3){
        currentAccountSubmissions.forEach((s) => {
          if(!s.isWithDrawn)
            submissionNotWithdrawn = s;
        });
        if(submissionNotWithdrawn === null)
          return <h2>You win {priceInEther} ether in this game but you have already withdrawn the fund</h2>
        else
          return (
            <div>
              <h2>You win {priceInEther} ether in this game </h2>
              <button type="button" className="pure-button pure-input-1-2 button-success"
                      onClick={this.handleWithdrawClick}>Withdraw
              </button>
            </div>
          )
      } else if(trustCount == 2){
        currentAccountSubmissions.forEach((s) => {
          if(!s.isWithDrawn && !s.isTrust)
            submissionNotWithdrawn = s;
        });
        if(currentAccount === traitor)
          if(submissionNotWithdrawn === null)
            return <h2>You win {priceInEther * 3} in this game but you have already withdrawn the fund</h2>
          else
            return (
              <div>
                <h2>You win {priceInEther * 3} in this game</h2>
                <button type="button" className="pure-button pure-input-1-2 button-success"
                        onClick={this.handleWithdrawClick}>Withdraw
                </button>
              </div>
            )
        else
          return <h2>You lost {priceInEther} in this game</h2>
      } else {
        if(currentAccount === this.state.owner){
          return (
            <div>
              <h2>No one win this game, you can withdraw</h2>
              <button type="button" className="pure-button pure-input-1-2 button-success"
                      onClick={this.handleWithdrawClick}>Withdraw
              </button>
            </div>
          )
        } else {
          return <h2>No one win this game, waiting for owner to reset the game</h2>
        }
      }
    }
    else
      return null;
  }

  render() {
    const priceInEther = this.props.web3.fromWei(this.state.price);
    return (
      <div>
        <h3>{priceInEther} ether will be taken for each decision submitted</h3>
        <div>
          <table>
            <tbody>
              <tr>
                <th><strong>Player</strong></th>
                {this.state.submissions.length == 3 && <th><strong>Did Trust?</strong></th>}
                <th><strong>has withDraw?</strong></th>
              </tr>
              {this.state.submissions.map((submission, i) => {
                return(
                  <tr key={i}>
                    <td>{submission.player}</td>
                    {this.state.submissions.length == 3 && <td>{submission.isTrust.toString()}</td>}
                    <td>{submission.isWithDrawn.toString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <Loader loaded={!this.state.loading}>
          {this.state.submissions.length < 3 && <div>
            <h2>You will player no.{this.state.submissions.length + 1}. Do you trust?</h2>
            <button type="button" className="pure-button pure-input-1-2 button-success"
                    onClick={() => this.handleClick(true)}>Trust
            </button>
            <button type="button" className="pure-button pure-input-1-2 button-error"
                    onClick={() => this.handleClick(false)}>Do not trust
            </button>
          </div>}
          {this.state.submissions.length == 3 && this.gameResult()}
        </Loader>
      </div>
    )
  }
}

export default Submissions;
