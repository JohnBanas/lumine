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
contract('Exchange', ([deployer, feeAccount, userOne]) => {
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
  describe('deployment', () => {

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
      result = await exchange.depositEther({ from: userOne, value: amount,  })
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

  describe('fallback function', () => {
    it('revert if Ether is sent', async () => {

      // sendTransaction sends a general ethereum transaction for any amount
      //  we want to reject because we cannot refund ether, so we revert
      await exchange.sendTransaction({ value: ether(10), from: userOne }).should.be.rejectedWith(EVM_REVERT)

    })
  })

  describe('depositing tokens', () => {
    let result;
    let amount;
    

    describe('success', () => {

      beforeEach(async () => {
        amount = formatTokens(10)
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
        await exchange.depositToken(ETHER_ADDRESS, formatTokens(10), { from: userOne }).should.be.rejectedWith(EVM_REVERT);
      })

      it('fails when no tokens are approved', async () => {
        // don't approve tokens before depositing
        await exchange.depositToken(token.address, amount, { from: userOne }).should.be.rejectedWith(EVM_REVERT);
      })

    })

  })

})
