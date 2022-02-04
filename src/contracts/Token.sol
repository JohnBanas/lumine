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

  /* Track Balances */
  mapping(address => uint256) public balanceOf;

  /* Events */
  event Transfer(address indexed from, address indexed to, uint256 value);

  /* Send Tokens */
  function transfer(address _to, uint256 _value) public returns (bool success) {
    require(balanceOf[msg.sender] >= _value);
    balanceOf[msg.sender] = balanceOf[msg.sender].sub(_value);
    balanceOf[_to] = balanceOf[_to].add(_value);
    emit Transfer(msg.sender, _to, _value);
    return true;
  }

  constructor() public {
    // Create 270 million tokens
    totalSupply = 270000000 * (10 ** decimals);
    //key value mapping 
    balanceOf[msg.sender] = totalSupply;
  }
}