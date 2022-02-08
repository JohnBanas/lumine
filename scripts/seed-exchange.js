// truffle script runner use 'truffle exec scripts/seed-exchange.js'
// this seeds the exchange with orders so we have existing data 
const Web3 = require("web3");
const web3 = new Web3(Web3.givenProvider || 'HTTP://127.0.0.1:7545');

/* Import our contracts */
const Token = artifacts.require("Token");
const Exchange = artifacts.require("Exchange");

//import helpers
const { formatTokens, ether, ETHER_ADDRESS, wait } = require('../test/helpers');


module.exports = async function (callback) {
  try {
    // Fetch all accounts from wallet
    const accounts = await web3.eth.getAccounts();

    //Fetch the deployed token
    const token = await Token.deployed();
    console.log(`
    Token has been fetched.
    `);

    // fetch the deployed exchange
    const exchange = await Exchange.deployed();
    console.log(`
    Exchange has been fetched.
    `);

    // Give tokens to first account in the list
    const sender = accounts[0];
    const receiver = accounts[1];
    //the amount
    let amount = web3.utils.toWei('10000', 'ether') // 10,000 tokens

    //transfer tokens
    await token.transfer(receiver, amount, { from: sender });
    console.log(`
    Transferred ${amount} tokens from ${sender} to ${receiver}
    `)

    // set up exchange users
    const userOne = accounts[0];
    const userTwo = accounts[1];

    //userOne deposits Ether
    amount = 1
    await exchange.depositEther({ from: userOne, value: ether(amount) });
    console.log(`
    Deposited ${amount} Ether from ${userOne}
    `)

    // userTwo approves tokens before our exchange contract can deposit them
    amount = 10000
    await token.approve(exchange.address, formatTokens(amount), { from: userTwo });
    console.log(`
    Approved ${amount} tokens from ${userTwo}
    `);

    // userTwo deposits tokens
    await exchange.depositToken(token.address, formatTokens(amount), { from: userTwo });
    console.log(`
    Deposited ${amount} tokens from ${userTwo}
    `)

    /********* Seed a cancel order ***********/
    
    // userOne makes an order to get tokens
    let result;
    let orderId;
    result = await exchange.makeOrder(token.address, formatTokens(100), ETHER_ADDRESS, ether(0.1), { from: userOne });
    console.log(`
    Made order from ${userOne}
    `);

    // userOne cancels the order
    orderId = result.logs[0].args.id;
    await exchange.cancelOrder(orderId, { from: userOne });
    console.log(`
    Cancelled order from ${userOne}
    `);

    /********* Seed a filled orders ***********/

    // userOne makes order
    result = await exchange.makeOrder(token.address, formatTokens(100), ETHER_ADDRESS, ether(0.1), { from: userOne });
    console.log(`
    Made order from ${userOne}
    `);

    // User 2 fills order
    orderId = result.logs[0].args.id;
    await exchange.fillOrder(orderId, { from: userTwo });
    console.log(`
    Filled order from ${userOne}
    `);

    // Wait 1 second
    await wait(1);

    // User 1 makes another order
    result = await exchange.makeOrder(token.address, formatTokens(50), ETHER_ADDRESS, ether(0.01), { from: userOne });
    console.log(`
    Made order from ${userOne}
    `);

    // User 2 fills another order
    orderId = result.logs[0].args.id;
    await exchange.fillOrder(orderId, { from: userTwo });
    console.log(`
    Filled order from ${userOne}
    `);

    // Wait 1 second
    await wait(1);

    // User 1 makes final order
    result = await exchange.makeOrder(token.address, formatTokens(200), ETHER_ADDRESS, ether(0.15), { from: userOne });
    console.log(`
    Made order from ${userOne}
    `);

    // User 2 fills final order
    orderId = result.logs[0].args.id;
    await exchange.fillOrder(orderId, { from: userTwo });
    console.log(`
    Filled order from ${userOne}
    `);

    // Wait 1 second
    await wait(1);

    /********* Seed a open orders ***********/

    // User 1 makes 10 orders
    for (let i = 1; i <= 10; i++) {
      result = await exchange.makeOrder(token.address, formatTokens(10 * i), ETHER_ADDRESS, ether(0.01), { from: userOne });
      console.log(`
      Made order from ${userOne}
      `);
      // Wait 1 second
      await wait(1);
    }

    // User 2 makes 10 orders
    for (let i = 1; i <= 10; i++) {
      result = await exchange.makeOrder(ETHER_ADDRESS, ether(0.01), token.address, formatTokens(10 * i), { from: userTwo });
      console.log(`
      Made order from ${userTwo}
      `);
      // Wait 1 second
      await wait(1);
    }

    console.log(`
    Orders finished successfully.
    `);

  } catch (err) {
    return console.log('Error: ', err);
  }

  callback();
}
