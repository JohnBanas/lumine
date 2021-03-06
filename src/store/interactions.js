import Web3 from "web3";
import Token from "../abis/Token.json";
import Exchange from "../abis/Exchange.json";
import {
  web3Loaded,
  web3AccountLoaded,
  tokenLoaded,
  exchangeLoaded,
  cancelledOrdersLoaded,
  filledOrdersLoaded,
  allOrdersLoaded
} from "./actions";

// interaction to create web3 instance 
// currently setup for local development
// this is the Redux state management for blockchain loaded 
export const loadWeb3 = (dispatch) => {
  // ganache local dev node
  const web3 = new Web3('http://localhost:7545');

  dispatch(web3Loaded(web3));
  return web3;
}

// load our "account" (first account on ganache dev)
// this is the Redux state management for account loaded 
export const loadAccount = async (web3, dispatch) => {
  const accounts = await web3.eth.getAccounts();
  const account = await accounts[0];
  dispatch(web3AccountLoaded(account));
  return account;
}

// this is the Redux state management for token contract loaded 
export const loadToken = async (web3, networkId, dispatch) => {
  try {
    const token = await new web3.eth.Contract(Token.abi, Token.networks[networkId].address);
    dispatch(tokenLoaded(token));
    return token
  } catch (error) {
    console.log(error);
    console.log('Contract not deployed to the current network. Please select another network with Metamask.')
    return null;
  }
}

// this is the Redux state management for token contract loaded 
export const loadExchange = async (web3, networkId, dispatch) => {
  try {
    const exchange = await new web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address);
    dispatch(exchangeLoaded(exchange));
    return exchange
  } catch (error) {
    console.log(error);
    console.log('Contract not deployed to the current network. Please select another network with Metamask.')
    return null;
  }
}

export const loadAllOrders = async (exchange, dispatch) => {
  // Fetch cancelled order with "Cancel" event stream
  const cancelStream = await exchange.getPastEvents('Cancel', { fromBlock: 0, toBlock: 'latest' });
  // format cancelled order return
  const cancelledOrders = cancelStream.map((event) => event.returnValues);
  //add cancelled order to the redux store
  dispatch(cancelledOrdersLoaded(cancelledOrders));

  // Fetch filled order with "Trade" event stream
  const filledOrderStream = await exchange.getPastEvents('Trade', { fromBlock: 0, toBlock: 'latest' });
  // format trade orders return
  const filledOrders = filledOrderStream.map((event) => event.returnValues);
  //add trade orders to the redux store
  dispatch(filledOrdersLoaded(filledOrders));

  // Fetch all orders with "Order" event stream
  const orderStream = await exchange.getPastEvents('Order', { fromBlock: 0, toBlock: 'latest' });

  // format trade orders return
  const allOrders = orderStream.map((event) => event.returnValues);
  //add trade orders to the redux store
  dispatch(allOrdersLoaded(allOrders));
}




























