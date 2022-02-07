const web3 = require('web3');
//helper fx
export const ether = (tokenAmount) => {
  return new web3.utils.BN(
    web3.utils.toWei(tokenAmount.toString(), 'ether')
  )
};

export const formatTokens = (n) => ether(n);

export const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';

export const EVM_REVERT = 'VM Exception while processing transaction: revert';
