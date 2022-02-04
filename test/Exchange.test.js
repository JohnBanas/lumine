import { formatTokens, EVM_REVERT } from './helpers';

// eslint-disable-next-line no-undef
const Exchange = artifacts.require('../src/contracts/Exchange.sol');
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
contract('Exchange', ([deployer, feeAccount]) => {
  let exchange;
  const feePercent = 10;

  // Fetch Exchange contract
  beforeEach(async () => {
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
})
