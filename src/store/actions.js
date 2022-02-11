// action for loading web3 connection (blockchain node)
export function web3Loaded(connection) {
  return {
    type: 'WEB3_LOADED',
    connection
  }
}

// get out account from the blockchain 
// this is setup for localhost development this would be
//different in real world application
export function web3AccountLoaded(account) {
  return {
    type: 'WEB3_ACCOUNT_LOADED',
    account
  }
}

// handle token loading (the token contract)
export function tokenLoaded(contract) {
  return {
    type: 'TOKEN_LOADED',
    contract
  }
}

// handle exchange loading (the exchange contract)
export function exchangeLoaded(contract) {
  return {
    type: 'EXCHANGE_LOADED',
    contract
  }
}
