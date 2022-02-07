// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

/* Import the Token contract */
import './Token.sol';

import "../../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

/* 

Deposit & Withdraw

Manage Orders - Make or Cancel

Handle Trades - Charge fees


TODO:
[X] Set the fee and account
[X] Deposit Ether
[] Withdraw Ether
[X] Deposit Tokens
[] Withdraw Tokens
[] Check balances
[] Make Order
[] Cancel Order
[] Fill Order
[] Charge Fees


 */

contract Exchange	{

		/* Not necessary in solidity ^0.8.0 */
  	using SafeMath for uint;

		/* State variables */
		address public feeAccount; // The account that recieves exchange fees
		uint256 public feePercent; // percentage fee
		address constant ETHER = address(0); // store Ether in tokens mapping with a blank address
		mapping(address => mapping(address => uint256)) public tokens; // track tokens (first address) that have been deposited
		// second address is the user that has deposited

		//  Define event
		event Deposit(address token, address user, uint256 amount, uint256 balance);

		/* constructor function */
    constructor (address _feeAccount, uint256 _feePercent) public {
				feeAccount = _feeAccount;
				feePercent = _feePercent;
		}

		// fallback function reverts if ether is sent to smart contract by mistake
		function () external {
			revert();
		}

		// Deposit Ether 
		function depositEther() payable public {
			tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
			emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
		}

		function depositToken(address _token, uint256 _amount) public {
			// TODO: Don't allow Ether deposits
			require(_token != ETHER);

			// Which token?
			require(Token(_token).transferFrom(msg.sender, address(this), _amount));

			// update the amount of tokens being deposited from exchange
			tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);

			// Emit event
			emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
		}

}



