import React, { Component } from "react";
import { connect } from "react-redux";
import { filledOrdersLoadedSelector, filledOrdersSelector } from "../store/selectors";
import Spinner from "./Spinner";

const showFilledOrders = (filledOrders) => {
  return (
    <tbody>
      {filledOrders.map((order, index) => {
        return (
          <tr className={`order-${order.id}`} key={order.id}>
            <td className="text-muted">{order.formattedTimestamp}</td>
            <td>{order.tokenAmount}</td>
            <td className={`text-${order.tokenPriceClass}`}>{order.tokenPrice}</td>
          </tr>
        )
      })}
    </tbody>
  )
}


class Trades extends Component {
  render() {
    return (
      <div className="vertical">
        <div className="card bg-dark text-white">
          <div className="card-header">
            Currency Trades
          </div>
          <div className="card-body">
            <table className="table table-dark table-sm small">
              <thead>
                <tr>
                  <th scope="col">Time</th>
                  <th scope="col">LUMI</th>
                  <th scope="col">LUMI/ETH</th>
                </tr>
              </thead>

              {this.props.filledOrdersLoaded ? showFilledOrders(this.props.filledOrders) : <Spinner type="table" />}
            </table>
          </div>
        </div>
      </div>
    );
  }
};

function mapStateToProps(state) {
  return {
    filledOrders: filledOrdersSelector(state),
    filledOrdersLoaded: filledOrdersLoadedSelector(state)
  }
}

export default connect(mapStateToProps)(Trades);
