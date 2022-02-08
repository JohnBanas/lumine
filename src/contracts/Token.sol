// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "../../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";


contract Token {

  /* Not necessary in solidity ^0.8.0 */
  using SafeMath for uint;

  // Required Variables ERC-20
  string public name = "Lumine";
  string public symbol = "LUMI";
  uint256 public decimals = 18;
  uint256 public totalSupply;

  /* Mappings */

  /* Track Balances */
  mapping(address => uint256) public balanceOf;

  /* Tracking Allowance */
  mapping(address => mapping(address => uint256)) public allowance;

  /* Events */
  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);

  constructor() public {
    // Create 270 million tokens
    totalSupply = 270000000 * (10 ** decimals);
    //key value mapping 
    balanceOf[msg.sender] = totalSupply;
  }

  /* Internal, token transfer helper fx */
  function _transfer(address _from, address _to, uint256 _value) internal {
    // must be a valid address
    require(_to != address(0));
    // remove the token amount from the sending user's balance
    balanceOf[_from] = balanceOf[_from].sub(_value);
    // add value to the recieving user's balance
    balanceOf[_to] = balanceOf[_to].add(_value);
    // emit a Transfer event
    emit Transfer(_from, _to, _value);
  }

  /* Send Tokens */
  function transfer(address _to, uint256 _value) public returns (bool success) {
    // check the balance of the sender to see if they have enough token to send
    require(balanceOf[msg.sender] >= _value);
    // call internal fx _transfer
    _transfer(msg.sender, _to, _value);
    // return a true value
    return true;
  }

  /* Approve tokens for address to use*/
  function approve(address _spender, uint256 _value) public returns (bool success) {
    // validate the address
    require(_spender != address(0));
    // use the allowance mapping to track the token sender's approved amount of token value
    allowance[msg.sender][_spender] = _value;
    // emit an Approval event
    emit Approval(msg.sender, _spender, _value);
    // return the boolean success 
    return true;
  }

  /* Transfer from */
  function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
    // confirm that the balance is sufficient to send tokens
    require(_value <= balanceOf[_from]);
    // check that the value of token being sent is less than the allowed amount
    //  through the allowance mapping
    require(_value <= allowance[_from][msg.sender]);
    // subtract the value from the allowance mapping approval amount
    allowance[_from][msg.sender] = allowance[_from][msg.sender].sub(_value);
    // call transfer helper fx to send tokens
    _transfer(_from, _to, _value);
    // return boolean value
    return true;
  }
  
}
