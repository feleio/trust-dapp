var Trust = artifacts.require("./Trust.sol");
const Web3 = require('web3');

module.exports = function(deployer) {
  const web3 = new Web3(deployer.provider);
  const price = web3.toWei(0.001, "ether");
  deployer.deploy(Trust, price);
};
