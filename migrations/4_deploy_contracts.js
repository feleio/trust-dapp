var Trust = artifacts.require("./Trust.sol");
const Web3 = require('web3');
const TruffleConfig = require('../truffle');

module.exports = function(deployer, network) {
  var price;
  var web3;
  const config = TruffleConfig.networks[network];
  if (process.env.ACCOUNT_PASSWORD) {
    web3 = new Web3(new Web3.providers.HttpProvider('http://' + config.host + ':' + config.port));

    console.log('>> Unlocking account ' + config.from);
    web3.personal.unlockAccount(config.from, process.env.ACCOUNT_PASSWORD, 36000);
  } else {
    web3 = new Web3(deployer.provider);
  }

  price = web3.toWei(0.001, "ether");
  deployer.deploy(Trust, price);
};
