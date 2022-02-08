import { formatTokens, EVM_REVERT, ETHER_ADDRESS, ether } from './helpers';

// eslint-disable-next-line no-undef
const Exchange = artifacts.require('../src/contracts/Exchange.sol');
const Token = artifacts.require('../src/contracts/Token.sol');
require('chai').use(require('chai-as-promised')).should();

/* 
templates

beforeEach(async () => {

})

describe('', () => {

})


it('', async () => {
        
}) 
      
      */

// smart contract deployment tests (through truffle 'truffle test' in terminal)
// destructured array variables for ganache created addresses, for testing purposes ERC-20 standards
// eslint-disable-next-line no-undef
contract('Exchange', ([deployer, feeAccount, userOne, userTwo]) => {
  let token;
  let exchange;
  const feePercent = 10;

  // Fetch Exchange contract
  beforeEach(async () => {
    token = await Token.new();
    // give userOne 100 tokens to be able to deposit with an exchange
    token.transfer(userOne, formatTokens(100));
    // fee account is passed to the smart contract constructor
    exchange = await Exchange.new(feeAccount, feePercent);

  })

  // Testing Exchange deployment
  describe('deployment', async () => {

    // Tracks the feeAccount
    it('tracks the fee account', async () => {
      // Read Token name
      const result = await exchange.feeAccount();
      // check that the feeAccount is set
      result.should.equal(feeAccount);
    })

    // tracks the percentage fee
    it('tracks the fee percentage', async () => {
      // Read Token name
      const result = await exchange.feePercent();
      // check that the feePercent is set
      result.toString().should.equal(feePercent.toString());
    })
  })

  describe('depositing Ether', async () => {

    let result;
    let amount;

    beforeEach(async () => {
      amount = ether(1);
      result = await exchange.depositEther({ from: userOne, value: amount, })
    })

    it('tracks the Ether deposit', async () => {
      const balance = await exchange.tokens(ETHER_ADDRESS, userOne);
      balance.toString().should.equal(amount.toString());
    })

    it('emits a Deposit event', async () => {
      const log = result.logs[0];
      log.event.should.equal('Deposit');

      const event = log.args;
      event.token.toString().should.equal(ETHER_ADDRESS, 'The token is correct!');
      event.user.toString().should.equal(userOne, "The user is correct!");
      event.amount.toString().should.equal(amount.toString(), "Transfer amount correct!");
      event.balance.toString().should.equal(amount.toString(), 'New balance is correct!');
    })

  })

  describe('withdraw Ether', async () => {
    let result;
    let amount;

    beforeEach(async () => {
      // First deposit 1 ether
      amount = ether(1)
      await exchange.depositEther({ from: userOne, value: amount })
    })

    describe('success', () => {

      beforeEach(async () => {
        // Then withdraw 1 ether
        result = await exchange.withdrawEther(amount, { from: userOne });
      })

      it('withdraw Ether funds', async () => {
        // set a balance variable to equal the Ether tokens of userOne (tokens mapping)
        const balance = await exchange.tokens(ETHER_ADDRESS, userOne);
        // for a correct test of the withdraw fx, the balance should be 0 
        // because we withdrew 1 Ether that we originally deposited
        balance.toString().should.equal('0');
      })

      it('emits a Withdraw event', async () => {
        const log = result.logs[0];
        log.event.should.equal('Withdraw');

        const event = log.args;
        event.token.toString().should.equal(ETHER_ADDRESS, 'The token is correct!');
        event.user.toString().should.equal(userOne, "The user is correct!");
        event.amount.toString().should.equal(amount.toString(), "Transfer amount correct!");
        event.balance.toString().should.equal('0', 'New balance is correct!');
      })


    })

    describe('failure', () => {
      it('rejects withdraw for insufficient balance', async () => {
        await exchange.withdrawEther(ether(100), { from: userOne }).should.be.rejectedWith(EVM_REVERT);
      })
    })

  })

  describe('withdraw Tokens', async () => {
    let result;
    let amount;

    describe('success', () => {

      beforeEach(async () => {
        // First deposit 1 tokens
        amount = formatTokens(1)
        await token.approve(exchange.address, amount, { from: userOne });
        await exchange.depositToken(token.address, amount, { from: userOne });

        //withdraw tokens
        result = await exchange.withdrawToken(token.address, amount, { from: userOne });
      })

      it('withdraws Token funds', async () => {
        // set a balance variable to equal the tokens of userOne (tokens mapping)
        const balance = await exchange.tokens(token.address, userOne);
        // for a correct test of the withdraw fx, the balance should be 0 
        // because we withdrew all 10 Tokens that we originally deposited
        balance.toString().should.equal('0');
      })

      it('emits a Withdraw event', async () => {
        const log = result.logs[0];
        log.event.should.equal('Withdraw');

        const event = log.args;
        event.token.toString().should.equal(token.address, 'The token is correct!');
        event.user.toString().should.equal(userOne, "The user is correct!");
        event.amount.toString().should.equal(amount.toString(), "Transfer amount correct!");
        event.balance.toString().should.equal('0', 'New balance is correct!');
      })


    })

    describe('failure', () => {

      it('rejects Ether withdraw', async () => {
        await exchange.withdrawToken(ETHER_ADDRESS, formatTokens(1), { from: userOne }).should.be.rejectedWith(EVM_REVERT);
      })
      it('rejects withdraw for insufficient balance', async () => {
        await exchange.withdrawToken(token.address, formatTokens(100), { from: userOne }).should.be.rejectedWith(EVM_REVERT);
      })
    })

  })

  describe('fallback function', async () => {
    it('revert if Ether is sent', async () => {

      // sendTransaction sends a general ethereum transaction for any amount
      //  we want to reject because we cannot refund ether, so we revert
      await exchange.sendTransaction({ value: ether(1), from: userOne }).should.be.rejectedWith(EVM_REVERT)

    })
  })

  describe('depositing tokens', async () => {
    let result;
    let amount;


    describe('success', () => {

      beforeEach(async () => {
        amount = formatTokens(1)
        await token.approve(exchange.address, amount, { from: userOne });
        result = await exchange.depositToken(token.address, amount, { from: userOne });
      })

      it('tracks the token deposit', async () => {
        // checks exchange token balance
        let balance;
        balance = await token.balanceOf(exchange.address)
        balance.toString().should.equal(amount.toString())

        //checks balance after deposit
        balance = await exchange.tokens(token.address, userOne);
        balance.toString().should.equal(amount.toString())

      })

      // Check for event Deposit to trigger.
      it('emits a Deposit event', async () => {
        const log = result.logs[0];
        log.event.should.equal('Deposit');

        const event = log.args;
        event.token.toString().should.equal(token.address, 'The token is correct!');
        event.user.toString().should.equal(userOne, "The user is correct!");
        event.amount.toString().should.equal(amount.toString(), "Transfer amount correct!");
        event.balance.toString().should.equal(amount.toString(), 'New balance is correct!');
      })
    })

    describe('failure', () => {

      // Don't allow Ether deposits
      it('rejects Ether deposits', async () => {
        // cannot deposit ether
        await exchange.depositToken(ETHER_ADDRESS, formatTokens(1), { from: userOne }).should.be.rejectedWith(EVM_REVERT);
      })

      it('fails when no tokens are approved', async () => {
        // don't approve tokens before depositing
        await exchange.depositToken(token.address, amount, { from: userOne }).should.be.rejectedWith(EVM_REVERT);
      })

    })

  })

  describe('checking balances', async () => {
    beforeEach(async () => {
      await exchange.depositEther({ from: userOne, value: ether(1) })
    })

    it('returns user balance', async () => {
      const result = await exchange.balanceOf(ETHER_ADDRESS, userOne);
      result.toString().should.equal(ether(1).toString());
    })

  })

  describe('making orders', async () => {

    /* 
    The _Order struct: 
      uint256 id;
      address user;
      address tokenGet;
      uint256 amountGet;
      address tokenGive;
      uint256 amountGive;
      uint256 timestamp;
    */

    let result;

    // call the makeOrder fx before each test 
    beforeEach(async () => {
      result = await exchange.makeOrder(token.address, formatTokens(1), ETHER_ADDRESS, ether(1), { from: userOne });
    })

    // check to see if the order count increases
    it('tracks the order just created', async () => {
      const orderCount = await exchange.orderCount();
      orderCount.toString().should.equal('1');
      // since we are tracking the order count we can access the mapping location
      const order = await exchange.orders('1');
      // check order attributes
      order.id.toString().should.equal('1', 'id is correct');
      order.user.toString().should.equal(userOne, 'User is correct');
      order.tokenGet.toString().should.equal(token.address, 'tokenGet is correct');
      order.amountGet.toString().should.equal(formatTokens(1).toString(), 'amountGet is correct');
      order.tokenGive.toString().should.equal(ETHER_ADDRESS, 'tokenGive is correct');
      order.amountGive.toString().should.equal(formatTokens(1).toString(), 'amountGive is correct');
      order.timestamp.toString().length.should.be.at.least(1, 'timestamp is correct');
    })

    it('emits an _Order event', async () => {
      const log = result.logs[0];
      log.event.should.equal('Order');
      const event = log.args;
      // check event attributes
      event.id.toString().should.equal('1', 'id is correct');
      event.user.toString().should.equal(userOne, 'User is correct');
      event.tokenGet.toString().should.equal(token.address, 'tokenGet is correct');
      event.amountGet.toString().should.equal(formatTokens(1).toString(), 'amountGet is correct');
      event.tokenGive.toString().should.equal(ETHER_ADDRESS, 'tokenGive is correct');
      event.amountGive.toString().should.equal(formatTokens(1).toString(), 'amountGive is correct');
      event.timestamp.toString().length.should.be.at.least(1, 'timestamp is correct');
    })

  })

  describe('order actions', async () => {

    beforeEach(async () => {
      // userOne deposits Ether only
      await exchange.depositEther({ from: userOne, value: ether(1) });
      // give tokens to userTwo
      await token.transfer(userTwo, formatTokens(100), { from: deployer });
      // userTwo approving the exchange for 2 tokens
      await token.approve(exchange.address, formatTokens(2), { from: userTwo });
      // the exchange deposits 2 tokens for userTwo
      await exchange.depositToken(token.address, formatTokens(2), { from: userTwo });
      // userOne makes an order to buy tokens with Ether
      await exchange.makeOrder(token.address, formatTokens(1), ETHER_ADDRESS, ether(1), { from: userOne });
    })

    describe('fill the order', async () => {
      let result;

      describe('success', async () => {
        
        beforeEach(async () => {
          // userTwo fills the order from userOne through the exchange
          result = await exchange.fillOrder('1', { from: userTwo })
        })

        it('executes the trade and charges the fees', async () => {
          let balance;
          // wait until userOne gets the tokens
          balance = await exchange.balanceOf(token.address, userOne);
          //balance of userOne should equal the 1 token received
          balance.toString().should.equal(formatTokens(1).toString(), 'userOne receives tokens');
          //wait for userTwo to receive Ether for the tokens
          balance = await exchange.balanceOf(ETHER_ADDRESS, userTwo);
          // balance of userTwo should equal the one ether received
          balance.toString().should.equal(ether(1).toString(), 'userTwo receives Ether');
          // wait for Ether to deduct from userOne
          balance = await exchange.balanceOf(ETHER_ADDRESS, userOne);
          //the balance should be 0 since userone is paying usertwo
          balance.toString().should.equal('0', 'userTwo has their ether deducted from userOne');
          // check the balance of userTwo's tokens to make sure the tokens minus a fee are deducted
          balance = await exchange.balanceOf(token.address, userTwo);
          // if user had 2 tokens and traded 1 for a 10% fee they should have 0.9 token left
          balance.toString().should.equal(formatTokens(0.9).toString(), 'userTwo tokens deducted including exchange fee');
          // wait for the fee account
          const feeAccount = await exchange.feeAccount();
          // balance of the fee account
          balance = await exchange.balanceOf(token.address, feeAccount);
          // is balance accurate
          balance.toString().should.equal(formatTokens(0.1).toString(), 'feeAccount received fee');
        })

        it('updates filled order mapping', async () => {
          const orderFilled = await exchange.orderFilled(1);
          orderFilled.should.equal(true);
        })

        it('emits a Trade event', async () => {
          const log = result.logs[0]
          log.event.should.equal('Trade');
          const event = log.args;
          event.id.toString().should.equal('1', 'id is correct');
          event.user.should.equal(userOne, 'user is correct');
          event.tokenGet.should.equal(token.address, 'tokenGet is correct');
          event.amountGet.toString().should.equal(formatTokens(1).toString(), 'amountGet is correct');
          event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct');
          event.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct');
          event.userFill.should.equal(userTwo, 'userFill is correct');
          event.timestamp.length.should.be.at.least(1, 'timestamp is correct');
        })

      })

      describe('failure', async () => {

        it('rejects invalid order ids', async() => {
          const invalidOrderId = 99999;
          await exchange.fillOrder(invalidOrderId, { from: userTwo }).should.be.rejectedWith(EVM_REVERT);
        })

        it('rejects already filled orders', async () => {
          //fill an order
          await exchange.fillOrder('1', { from: userTwo }).should.be.fulfilled;
          //try to fill it again
          await exchange.fillOrder('1', { from: userTwo }).should.be.rejectedWith(EVM_REVERT);
        })

        it('rejects cancelled orders', async () => {
          // Cancel the order
          await exchange.cancelOrder('1', { from: userOne }).should.be.fulfilled;
          //try to fill it
          await exchange.fillOrder('1', { from: userTwo }).should.be.rejectedWith(EVM_REVERT);
        })

      })

    })

    describe('cancelling orders', async () => {
      let result;

      describe('success', async () => {
        beforeEach(async () => {
          // cancel order fx
          result = await exchange.cancelOrder('1', { from: userOne });
        })

        it('updates cancelled orders', async () => {
          const orderCancelled = await exchange.orderCancelled(1);
          orderCancelled.should.equal(true);
        })

        it('emits an Cancel event', async () => {
          const log = result.logs[0];
          log.event.should.equal('Cancel');
          const event = log.args;
          // check event attributes
          event.id.toString().should.equal('1', 'id is correct');
          event.user.toString().should.equal(userOne, 'User is correct');
          event.tokenGet.toString().should.equal(token.address, 'tokenGet is correct');
          event.amountGet.toString().should.equal(formatTokens(1).toString(), 'amountGet is correct');
          event.tokenGive.toString().should.equal(ETHER_ADDRESS, 'tokenGive is correct');
          event.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct');
          event.timestamp.toString().length.should.be.at.least(1, 'timestamp is correct');
        })

      })

      describe('failure', async () => {

        it('rejects invalid order ids', async () => {
          const invalidOrderId = 999999999;
          await exchange.cancelOrder(invalidOrderId, { from: userOne }).should.be.rejectedWith(EVM_REVERT);
        })

        it('rejects unauthorized order cancellations', async () => {
          // try to cancel order with another user
          await exchange.cancelOrder(1, { from: userTwo }).should.be.rejectedWith(EVM_REVERT);
        })

      })

    })

  })

})
