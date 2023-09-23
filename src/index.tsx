import React, { useEffect } from 'react';
import { render } from 'react-dom';

import { GlobalStyles } from '@contentful/f36-components';
import { SDKProvider } from '@contentful/react-apps-toolkit';

import App from './App';
import './index.css';

const root = document.getElementById('root');
  render(
    <SDKProvider>
      <GlobalStyles />
      

      <App />
    </SDKProvider>,
    root
  );

