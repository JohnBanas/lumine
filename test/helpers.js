const web3 = require('web3');
//helper fx
export const formatTokens = (tokenAmount) => {
  return new web3.utils.BN(
    web3.utils.toWei(tokenAmount.toString(), 'ether')
  )
};

export const EVM_REVERT = 'VM Exception while processing transaction: revert';
