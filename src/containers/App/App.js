import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import logo from './logo.svg';
import './App.scss';
import Loadable from 'react-loadable';
import Loading from '../../components/Loading/Loading';

const TestSplitCode = Loadable({
	loader: () => import(/* webpackChunkName: "test-split-code" */ '../../components/TestSplitCode/TestSplitCode'),
	loading: Loading
});

class App extends Component {
	render() {
		return (
			<div className="App">
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<p>
						Edit <code>src/App.js</code> and save to reload.
					</p>
					<a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
						Learn React
					</a>
				</header>
				<TestSplitCode />
			</div>
		);
	}
}

export default hot(module)(App);
