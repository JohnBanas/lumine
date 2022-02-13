import { createSelector } from "reselect";
import { get, groupBy } from "lodash";
import { etherAddress, tokenFormat, ether, RED, GREEN } from "../helpers";
import moment from "moment";
import { reject } from 'lodash';

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

//all orders state selector
const allOrdersLoaded = state => {
  const allOrdersLoaded = get(state, 'exchange.allOrders.loaded', false);
  return allOrdersLoaded;
}

export const allOrdersLoadedSelector = createSelector(allOrdersLoaded, loaded => loaded);

const allOrders = state => {
  const allOrders = get(state, 'exchange.allOrders.data', []);
  return allOrders;
}

export const allOrdersSelector = createSelector(allOrders, orders => orders);

//cancelled orders state selector
const cancelledOrdersLoaded = state => {
  const cancelledOrdersLoaded = get(state, 'exchange.cancelledOrders.loaded', false);
  return cancelledOrdersLoaded;
}

export const cancelledOrdersLoadedSelector = createSelector(cancelledOrdersLoaded, loaded => loaded);

const cancelledOrders = state => {
  const cancelledOrders = get(state, 'exchange.cancelledOrders.data', []);
  return cancelledOrders;
}

export const cancelledOrdersSelector = createSelector(cancelledOrders, orders => orders);

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
    return orders;
  }
);

// selector to ensure our token and exchange contracts are loaded 
export const contractsLoadedSelector = createSelector(
  tokenLoadedSelector,
  exchangeLoadedSelector,
  (tokensLoadedBoolean, exchangeLoadedBoolean) => (tokensLoadedBoolean && exchangeLoadedBoolean)
)

const orderBookLoaded = state => {
  return cancelledOrdersLoaded(state) && filledOrdersLoaded(state) && allOrdersLoadedSelector(state);
}

export const orderBookLoadedSelector = createSelector(orderBookLoaded, obl => obl);

//create order book

const openOrders = state => {
  const all = allOrders(state);
  const filled = filledOrders(state);
  const cancelled = cancelledOrders(state);

  const openOrders = reject(all, (order) => {
    const orderFilled = filled.some((o) => o.id === order.id)
    const orderCancelled = cancelled.some((o) => o.id === order.id)
    return (orderFilled || orderCancelled)
  })

  return openOrders;
}

export const orderBookSelector = createSelector(
  openOrders,
  (orders) => {
    //format orders
    orders = decorateOrderBookOrders(orders)
    //group orders into buy and sell orders
    orders = groupBy(orders, 'orderType')
    // fetch buy orders
    const buyOrders = get(orders, 'buy', [])

    // fetch sell orders
    const sellOrders = get(orders, 'sell', [])

    orders = {
      ...orders,
      buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice),
      sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
    }

    return orders
  }
)

const decorateOrderBookOrders = (orders) => {
  return (
    orders.map((order) => {
      order = decorateOrder(order)
      order = decorateOrderBookOrder(order)
      return order
    })
  )
}

const decorateOrderBookOrder = (order) => {
  const orderType = order.tokenGive === etherAddress ? 'buy' : 'sell';
  return ({
    ...order,
    orderType,
    orderTypeClass: (orderType === 'buy' ? GREEN : RED),
    orderFillClass: orderType === 'buy' ? 'sell' : 'buy'

  })
}
