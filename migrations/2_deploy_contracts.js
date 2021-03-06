const Web3 = require("web3");
const web3 = new Web3(Web3.givenProvider || 'HTTP://127.0.0.1:7545');

const Token = artifacts.require("Token");
const Exchange = artifacts.require("Exchange");

module.exports = async function (deployer) {
  const accounts = await web3.eth.getAccounts();

  await deployer.deploy(Token);

  const feeAccount = accounts[0];
  const feePercentage = 10;

  await deployer.deploy(Exchange, feeAccount, feePercentage);
};
