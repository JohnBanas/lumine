import { createSelector } from "reselect";
import { get } from "lodash";
import { etherAddress, tokenFormat, ether, RED, GREEN } from "../helpers";
import moment from "moment";

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

// get exchange state
const exchange = state => {
  const exchange = get(state, "exchange.contract")
  return exchange;
}

export const exchangeSelector = createSelector(exchange, e => e);

// are filled orders loaded, defaults to false
const filledOrdersLoaded = state => {
  const filledOrdersLoaded = get(state, "exchange.filledOrders.loaded", false);
  return filledOrdersLoaded;
}
export const filledOrdersLoadedSelector = createSelector(filledOrdersLoaded, bool => bool);

const filledOrders = state => {
  const filledOrders = get(state, "exchange.filledOrders.data", []);
  return filledOrders;
}

const decorateOrder = (order) => {
  let etherAmount;
  let tokenAmount;
  if (order.tokenGive === etherAddress) {
    etherAmount = order.amountGive;
    tokenAmount = order.amountGet;
  } else {
    etherAmount = order.amountGet;
    tokenAmount = order.amountGive;
  }

  // price of token to ether round to 5 decimal places
  const range = 100000
  let tokenPrice = (etherAmount / tokenAmount);
  tokenPrice = Math.round(tokenPrice * range) / range;

  // time format
  let time = moment.unix(order.timestamp).format('h:mm:ss a M/D');

  return ({
    ...order,
    etherAmount: ether(etherAmount),
    tokenAmount: tokenFormat(tokenAmount),
    tokenPrice,
    formattedTimestamp: time
  });
}

const decorateSingleFilledOrder = (order, previousOrder) => {
  return ({
    ...order,
    tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)
  })
}

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
  if (previousOrder.id === orderId) {
    return GREEN;
  }

  console.log(previousOrder.tokenPrice)
  console.log(tokenPrice)

  if (previousOrder.tokenPrice <= tokenPrice) {
    return GREEN
  } else {
    return RED
  }
}

const decorateFilledOrders = (orders) => {
  let previousOrder = orders[0];
  return (
    orders.map((order) => {
      order = decorateOrder(order);
      order = decorateSingleFilledOrder(order, previousOrder);
      previousOrder = order;
      return order;
    })
  )
}

export const filledOrdersSelector = createSelector(
  filledOrders,
  (orders) => {

    // sort orders (ascending) for price comparison
    orders = orders.sort((a, b) => a.timestamp - b.timestamp)

    orders = decorateFilledOrders(orders);
    // sort orders (descending) for display
    orders = orders.sort((a, b) => b.timestamp - a.timestamp)
    console.log(orders)
    return orders;
  }
);

// selector to ensure our token and exchange contracts are loaded 
export const contractsLoadedSelector = createSelector(
  tokenLoadedSelector,
  exchangeLoadedSelector,
  (tokensLoadedBoolean, exchangeLoadedBoolean) => (tokensLoadedBoolean && exchangeLoadedBoolean)
)
