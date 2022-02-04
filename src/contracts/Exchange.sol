// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

/* 

Deposit & Withdraw

Manage Orders - Make or Cancel

Handle Trades - Charge fees


TODO:
[X] Set the fee and account
[] Deposit Ether
[] Withdraw Ether
[] Deposit Tokens
[] Withdraw Tokens
[] Check balances
[] Make Order
[] Cancel Order
[] Fill Order
[] Charge Fees


 */

contract Exchange	{

		/* State variables */
		address public feeAccount; // The account that recieves exchange fees
		uint256 public feePercent; // percentage fee

		/* constructor function */
    constructor (address _feeAccount, uint256 _feePercent) public {
				feeAccount = _feeAccount;
				feePercent = _feePercent;
		}

}



