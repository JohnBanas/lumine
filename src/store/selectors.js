import { createSelector } from "reselect";
import { get } from "lodash";

// this selector reads state from Redux to get our "account"
const account = state => {
  const account = get(state, "web3.account");
  return account;
}
export const accountSelector = createSelector(account, a => a);

// is token loaded, defaults to false
const tokenLoaded = state => {
  const token = get(state, "token.loaded", false);
  return token;
}

export const tokenLoadedSelector = createSelector(tokenLoaded, bool => bool);

// is exchange loaded, defaults to false
const exchangeLoaded = state => {
  const exchange = get(state, "exchange.loaded", false);
  return exchange;
}
export const exchangeLoadedSelector = createSelector(exchangeLoaded, bool => bool);

// selector to ensure our token and exchange contracts are loaded 
export const contractsLoadedSelector = createSelector(
  tokenLoadedSelector,
  exchangeLoadedSelector,
  (tokensLoadedBoolean, exchangeLoadedBoolean) => (tokensLoadedBoolean && exchangeLoadedBoolean)
)
