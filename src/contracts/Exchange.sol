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
[X] Withdraw Ether
[X] Deposit Tokens
[X] Withdraw Tokens
[X] Check balances
[X] Make Order
[X] Cancel Order
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

		/* Mappings (similar to arrays) */
		mapping(uint256 => _Order) public orders;
		mapping(address => mapping(address => uint256)) public tokens; // track tokens (first address) that have been deposited
		// second address is the user that has deposited
		// mapping for cancelled orders, b/c we don't remove orders from mapping
		mapping(uint256 => bool) public orderCancelled;

		/* Order Counter Cache */
		uint256 public orderCount;

		//  Define events
		event Deposit(address token, address user, uint256 amount, uint256 balance);
		event Withdraw(address token, address user, uint256 amount, uint256 balance);
		event Order(
			uint256 id,
			address user,
			address tokenGet,
			uint256 amountGet,
			address tokenGive,
			uint256 amountGive,
			uint256 timestamp
		);
		event Cancel(
			uint256 id,
			address user,
			address tokenGet,
			uint256 amountGet,
			address tokenGive,
			uint256 amountGive,
			uint256 timestamp
		);

		// Model an order with a struct (similar to object being stored in database)
		struct _Order {
			//need to add attributes 
			uint256 id;
			address user;
			address tokenGet;
			uint256 amountGet;
			address tokenGive;
			uint256 amountGive;
			uint256 timestamp;
		}
		// Store the order with the mapping
		

		/* constructor function */
    constructor (address _feeAccount, uint256 _feePercent) public {
				feeAccount = _feeAccount;
				feePercent = _feePercent;
		}

		// fallback function reverts if ether is sent to smart contract by mistake
		function () external {
			revert();
		}

		// Withdraw Ether

		function withdrawEther(uint256 _amount) public {
			// check to make sure they have the amount to withdraw
			require(tokens[ETHER][msg.sender] >= _amount);
			//update Ether balance in tokens mapping
			tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
			//send the Ether back to user
			msg.sender.transfer(_amount);
			//emit event 
			emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
		}

		// Deposit Ether 
		function depositEther() payable public {
			tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
			emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
		}

		// Withdraw Token
		function withdrawToken(address _token, uint256 _amount) public {
			// TODO: Don't allow Ether withdraw
			require(_token != ETHER);
			// check to make sure they have the amount to withdraw
			require(tokens[_token][msg.sender] >= _amount);
			// remove tokens from address
			tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);

			//require token transfer from contract (implied) to user
			require(Token(_token).transfer(msg.sender, _amount));

			// emit event
			emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
		}

		// Deposit Token
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

		// Token Balance
		function balanceOf(address _token, address _user) public view returns(uint256) {
			return tokens[_token][_user];
		}

		// add an order to storage
		function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
			// need to instantiate a new Order struct
			// increment orderCount to use as id
			orderCount = orderCount.add(1);
			// add a Order struct instantiation to the orders mapping
			orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
			// emit event
			emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
		}

		// cancel an order
		function cancelOrder(uint256 _id) public {
			// fetch order from the mapping (blockchain storage)
			_Order storage _order = orders[_id];
			// make sure the user calling the function owns the order
			require(address(_order.user) == msg.sender);
			// make sure order exist
			require(_order.id == _id);
			// update separate mapping for cancelled orders do not remove from order mapping
			orderCancelled[_id] = true;
			emit Cancel(_order.id, msg.sender, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, now);
		}

		// retrieve from storage
}



