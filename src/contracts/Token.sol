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
    require(_to != address(0));
    balanceOf[_from] = balanceOf[_from].sub(_value);
    balanceOf[_to] = balanceOf[_to].add(_value);
    emit Transfer(_from, _to, _value);
  }

  /* Send Tokens */
  function transfer(address _to, uint256 _value) public returns (bool success) {
    require(balanceOf[msg.sender] >= _value);
    _transfer(msg.sender, _to, _value);
    return true;
  }

  /* Approve tokens */
  function approve(address _spender, uint256 _value) public returns (bool success) {
    require(_spender != address(0));
    allowance[msg.sender][_spender] = _value;
    emit Approval(msg.sender, _spender, _value);
    return true;
  }

  /* Transfer from */
  function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
    require(_value <= balanceOf[_from]);
    require(_value <= allowance[_from][msg.sender]);
    allowance[_from][msg.sender] = allowance[_from][msg.sender].sub(_value);
    _transfer(_from, _to, _value);
    return true;
  }
  
}
