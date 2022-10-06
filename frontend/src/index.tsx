import {env} from './static/constants';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { DAppProvider, ChainId, Config   } from '@usedapp/core';

const config_local: Config = {
  autoConnect: true,
  multicallAddresses: {
    [env.REACT_APP_CHAIN_ID] : env.REACT_APP_MULTICALL_ADDRESS_LOCAL,
    [ChainId.Mumbai]: env.REACT_APP_MULTICALL_MUMBAI,
  },
  readOnlyUrls: {
    [ChainId.Mumbai]: env.REACT_APP_CHAIN_RPC_URL_MUMBAI,
    [env.REACT_APP_CHAIN_ID] : env.REACT_APP_CHAIN_RPC_URL,
  }
};
//console.log(config_local);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <DAppProvider config={config_local}>
      <App />
    </DAppProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
