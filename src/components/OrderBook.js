import React, { Component } from "react";
import { connect } from "react-redux";
import {
  orderBookSelector,
  orderBookLoadedSelector
} from '../store/selectors';
import { loadAllOrders } from "../store/interactions";
import Spinner from "./Spinner";

const renderOrder = (order) => {
  return (
    <tr key={order.id}>
      <td>{order.tokenAmount}</td>
      <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
      <td>{order.etherAmount}</td>
    </tr>
  )
}

const showOrderBook = (props) => {
  const { orderBook } = props;
  return (
    <tbody>
      {orderBook.sellOrders.map((order) => renderOrder(order))}
      <tr>
        <th>LUMI</th>
        <th>LUMI/ETH</th>
        <th>ETH</th>
      </tr>
      {orderBook.buyOrders.map((order) => renderOrder(order))}
    </tbody>
  )
}

class OrderBook extends Component {
  render() {
    return (
      <div className="vertical">
        <div className="card bg-dark text-white">
          <div className="card-header">
            Order Book
          </div>
          <div className="card-body">
            <table className="table table-dark table-sm small">
              {this.props.showOrderBook ? showOrderBook(this.props) : <Spinner type="table" />}
            </table>
          </div>
        </div>
      </div>
    );
  }
};

function mapStateToProps(state) {
  return {
    loadAllOrders: loadAllOrders(state),
    orderBook: orderBookSelector(state),
    showOrderBook: orderBookLoadedSelector(state)
  }
}

export default connect(mapStateToProps)(OrderBook);
