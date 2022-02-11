import { combineReducers } from 'redux';

// Redux reducer to control web3 state
function web3(state = {}, action) {
  switch (action.type) {
    case 'WEB3_LOADED':
      return { ...state, connection: action.connection }
    case 'WEB3_ACCOUNT_LOADED':
      return { ...state, account: action.account }
    default:
      return state;
  }
};

// Redux reducer for token contract
function token(state = {}, action) {
  switch (action.type) {
    case 'TOKEN_LOADED':
      return { ...state, loaded: true, contract: action.contract }
    default:
      return state;
  }
}

// Redux reducer for exchange contract
function exchange(state = {}, action) {
  switch (action.type) {
    case 'EXCHANGE_LOADED':
      return { ...state, loaded: true, contract: action.contract }
    default:
      return state;
  }
}

/* ROOT REDUCER: combines all other state reducer fxs */
const rootReducer = combineReducers({
  web3,
  token,
  exchange
});

export default rootReducer;
