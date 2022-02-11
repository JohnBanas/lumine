import React, { Component } from 'react';
import './App.css';
import Navbar from './Navbar';
import Content from './Content';
import {
  loadWeb3,
  loadAccount,
  loadToken,
  loadExchange
} from '../store/interactions';
import { connect } from 'react-redux';
import { contractsLoadedSelector } from '../store/selectors';

class App extends Component {
  componentDidMount() {
    this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    const web3 = loadWeb3(dispatch)
    await loadAccount(web3, dispatch);
    const networkId = await web3.eth.net.getId()
    const token = await loadToken(web3, networkId, dispatch);
    if (!token) {
      window.alert('Token contract not deployed to the current network. Please select another network with Metamask.')
      return;
    }
    const exchange = await loadExchange(web3, networkId, dispatch);
    if (!exchange) {
      window.alert('Exchange contract not deployed to the current network. Please select another network with Metamask.')
    }
  }

  render() {
    return (
      <div>
        <Navbar />
        {this.props.contractsLoaded ? <Content /> : <div className='content'>Loading...</div>}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    contractsLoaded: contractsLoadedSelector(state)
  }
}

export default connect(mapStateToProps)(App);
