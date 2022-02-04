import { formatTokens, EVM_REVERT } from './helpers';

// eslint-disable-next-line no-undef
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
contract('Token', ([deployer, receiver, exchange]) => {
  const name = 'Lumine';
  const symbol = 'LUMI';
  const decimals = '18';
  const totalSupply = formatTokens(270000000).toString();
  let token;
  
    // Fetch token from blockchain before each test
    beforeEach( async () => {
      token = await Token.new();
    })
  
  // Testing Token deployment
  describe('deployment', () => {
    
    //Do we have Token name?
    it('tracks the name', async () => {
      // Read Token name
      const result = await token.name();
      // check that the token name is "Lumine"
      result.should.equal(name);
    })

    // Do we have token symbol?
    it('tracks the symbol', async () => {
      const result = await token.symbol();
      result.should.equal(symbol);
    })

    // Do we have the correct number of decimals in tokens (18)
    it('tracks the decimals', async () => {
      const result = await token.decimals();
      result.toString().should.equal(decimals);
    })

    // Correct total supply? 270 million 
    it('tracks the total supply', async () => {
      const result = await token.totalSupply();
      result.toString().should.equal(totalSupply);
    })

    // Deployer of Token contract receives token balance
    it('assigns total supply to deployer', async () => {
      const result = await token.balanceOf(deployer);
      result.toString().should.equal(totalSupply);
    })
  })

  // Deployer sending tokens
  describe('sending tokens', () => {
    let amount;
    let result;

    // successful deployer send tokens tests
    describe('success', async () => {
      // before each test create variable for amount of tokens being tested
      // then the result of the transfer fx from the smart contract
      beforeEach(async () => {
        amount = formatTokens(100);
        result = await token.transfer(receiver, amount, { from: deployer });
      })

      // Deployer transfers tokens to another address
      it('transfers token balances', async () => {
        let balanceOf;

        // Balance after
        balanceOf = await token.balanceOf(deployer);
        balanceOf.toString().should.equal(formatTokens(269999900).toString())
        balanceOf = await token.balanceOf(receiver);
        balanceOf.toString().should.equal(formatTokens(100).toString());
      })

      // When deployer transfers, we should get a Transfer event trigger
      it('emits a Transfer event', async () => {
        const log = result.logs[0];
        log.event.should.equal('Transfer');

        const event = log.args;
        event.from.toString().should.equal(deployer, 'From value is correct!');
        event.to.toString().should.equal(receiver, "To value is correct!");
        event.value.toString().should.equal(amount.toString(), "Transfer amount correct!");
      })
    })

    // failure deployer send token tests
    describe('failure', async () => {
      let amount;

      // Not enough token in account
      it('rejects insufficient balances with error', async () => {
        let invalidAmount;
        invalidAmount = formatTokens(300000000); // 300 million - Greater than totalSupply (insufficient)
        await token.transfer(receiver, invalidAmount, { from: deployer }).should.be.rejectedWith(EVM_REVERT);

        /* Attempt to transfer when you have no tokens */
        invalidAmount = formatTokens(10);
        await token.transfer(deployer, invalidAmount, { from: receiver }).should.be.rejectedWith(EVM_REVERT);
      })

      it('rejects invalid receiver', async () => {
        //invalid address
        await token.transfer(0x0, amount, { from: deployer }).should.be.rejected;
      })
    }) 
  })

  /* Approving tokens for other address to have an allowance and send tokens */
  describe('approving tokens', async () => {
    let result;
    let amount;

    // Before each test create an amount approved for exchange to use
    beforeEach(async () => {
      amount = formatTokens(100);
      result = await token.approve(exchange, amount, { from: deployer });
    })

    // exchange successfully approved for tokens tests
    describe('success', async () => {

      // Deployer gives exchange an allowance
      it('allocates an allowance for delegated token spending on an exchange', async () => {
        const allowance = await token.allowance(deployer, exchange);
        allowance.toString().should.equal(amount.toString());
      })  
      
      // On approve fx call Approval event is triggered
      it('emits an Approval event', async () => {
        const log = result.logs[0];
        log.event.should.equal('Approval');

        const event = log.args;
        event.owner.toString().should.equal(deployer, 'owner is correct!');
        event.spender.toString().should.equal(exchange, "spender is correct!");
        event.value.toString().should.equal(amount.toString(), "value amount correct!");
      })

    })

    // Failed exchange approval for invalid address
    describe('failure', async () => {
      it('rejects invalid spenders', async () => {
        //invalid address
        await token.approve(0x0, amount, { from: deployer }).should.be.rejected;
      })
    })

    // Deployer delegates exchange addresses who can send tokens
    describe('delegated token transfers', () => {
      let amount;
      let result;

      // Before each tests create an amount and an approval allowance for exchange
      beforeEach(async () => {
        amount = formatTokens(100);
        await token.approve(exchange, amount, { from: deployer })
      })

      // Successful exchange transfers
      describe('success', async () => {
        // Before each test call the transferFrom fx
        beforeEach(async () => {
          result = await token.transferFrom(deployer, receiver, amount, { from: exchange });
        })

        // Tests that amount is subtracted from deployer and added to exchange 
        it('transfers token balances', async () => {
          let balanceOf;

          // Balance after
          balanceOf = await token.balanceOf(deployer);
          balanceOf.toString().should.equal(formatTokens(269999900).toString())
          balanceOf = await token.balanceOf(receiver);
          balanceOf.toString().should.equal(formatTokens(100).toString());
        })

        // Does allowance go back to 0 after transfer?
        it('resets the allowance', async () => {
          const allowance = await token.allowance(deployer, exchange);
          allowance.toString().should.equal('0');
        })

        // On transferFrom fx call is a Transfer event triggered?
        it('emits a Transfer event', async () => {
          const log = result.logs[0];
          log.event.should.equal('Transfer');

          const event = log.args;
          event.from.toString().should.equal(deployer, 'From value is correct!');
          event.to.toString().should.equal(receiver, "To value is correct!");
          event.value.toString().should.equal(amount.toString(), "Transfer amount correct!");
        })
      })

      // Failure of exchange transfers
      describe('failure', async () => {
        let amount;
        it('rejects insufficient amounts', async () => {
          let invalidAmount;
          invalidAmount = formatTokens(300000000); // 300 million - Greater than totalSupply (insufficient)
          await token.transferFrom(deployer, receiver, invalidAmount, { from: exchange }).should.be.rejectedWith(EVM_REVERT);
        })

        it('rejects invalid recipients', async () => {
          //invalid address
          await token.transferFrom(deployer, 0x0, amount, { from: exchange }).should.be.rejected;
        })
      })
    })

  })
})
