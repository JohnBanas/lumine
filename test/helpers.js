const web3 = require('web3');
//helper fx for formatting ether to wei
export const ether = (tokenAmount) => {
  return new web3.utils.BN(
    web3.utils.toWei(tokenAmount.toString(), 'ether')
  )
};

// calls ether helper fx, this is to help explicitly identify when we are
//  testing for ether and when we are testing our tokens
export const formatTokens = (n) => ether(n);

// Ether address for mapping
export const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';

// Variable to hold the revert returns
export const EVM_REVERT = 'VM Exception while processing transaction: revert';
