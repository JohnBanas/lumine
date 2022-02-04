import { formatTokens, EVM_REVERT } from './helpers';

// eslint-disable-next-line no-undef
const Token = artifacts.require('../src/contracts/Token.sol');
require('chai').use(require('chai-as-promised')).should();

// smart contract deployment tests (through truffle 'truffle test' in terminal)
// eslint-disable-next-line no-undef
contract('Token', ([deployer, receiver]) => {
  const name = 'Lumine';
  const symbol = 'LUMI';
  const decimals = '18';
  const totalSupply = formatTokens(270000000).toString();
  let token;
  
    // Fetch token from blockchain
    beforeEach( async () => {
      token = await Token.new();
    })
  describe('deployment', () => {
    it('tracks the name', async () => {
      // Read Token name
      const result = await token.name();
      // check that the token name is "Lumine"
      result.should.equal(name);
    })

    it('tracks the symbol', async () => {
      const result = await token.symbol();
      result.should.equal(symbol);
    })

    it('tracks the decimals', async () => {
      const result = await token.decimals();
      result.toString().should.equal(decimals);
    })

    it('tracks the total supply', async () => {
      const result = await token.totalSupply();
      result.toString().should.equal(totalSupply);
    })

    it('assigns total supply to deployer', async () => {
      const result = await token.balanceOf(deployer);
      result.toString().should.equal(totalSupply);
    })
  })

  describe('sending tokens', () => {
    let amount;
    let result;

    describe('success', async () => {
      beforeEach(async () => {
        amount = formatTokens(100);
        result = await token.transfer(receiver, amount, { from: deployer });
      })

      it('transfers token balances', async () => {
        let balanceOf;

        // Balance after
        balanceOf = await token.balanceOf(deployer);
        balanceOf.toString().should.equal(formatTokens(269999900).toString())
        balanceOf = await token.balanceOf(receiver);
        balanceOf.toString().should.equal(formatTokens(100).toString());
      })

      it('emits a transfer event', async () => {
        const log = result.logs[0];
        log.event.should.equal('Transfer');

        const event = log.args;
        event.from.toString().should.equal(deployer, 'From value is correct!');
        event.to.toString().should.equal(receiver, "To value is correct!");
        event.value.toString().should.equal(amount.toString(), "Transfer amount correct!");
      })
    })

    describe('failure', async () => {
      it('rejects insufficient balances with error', async () => {
        let invalidAmount;
        invalidAmount = formatTokens(300000000); // 300 million - Greater than totalSupply (insufficient)
        await token.transfer(receiver, invalidAmount, { from: deployer }).should.be.rejectedWith(EVM_REVERT);
      })
    })

    
  })
})
