import React, { Component } from "react";
import { connect } from "react-redux";
// import Spinner from "./Spinner";




class TheName extends Component {



  render() {
    return (
      <div className="vertical">
        <div className="card bg-dark text-white">
          <div className="card-header">
            Order Book
          </div>
          <div className="card-body">
            <table className="table table-dark table-sm small">

            </table>
          </div>
        </div>
      </div>
    );
  }
};

function mapStateToProps(state) {
  return {

  }
}

export default connect(mapStateToProps)(TheName);
