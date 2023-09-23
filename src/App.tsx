import React,{useEffect} from 'react';
import { locations } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useMemo } from 'react';
import { Config } from './locations/ConfigScreen';
import { PageRouter } from './locations/Page';

const ComponentLocationSettings = {
  [locations.LOCATION_APP_CONFIG]: Config,
  [locations.LOCATION_PAGE]: PageRouter,
};

const App = () => {
  
  const sdk = useSDK();

  useEffect(()=>{

    if (import.meta.env.VITE_APP_ENV !== "dev") {
      console.log= function(){}
      console.dir= function(){}
      console.error= function(){}
     
    }
    
  },[]);
  
  const Component = useMemo(() => {
    console.log(sdk.location)
    for (const [location, component] of Object.entries(ComponentLocationSettings)) {
      if (sdk.location.is(location)) {
        return component;
      }
    }
  }, [sdk.location]);

  return Component ? <Component /> : null;
};

export default App;
