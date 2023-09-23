import React, { useEffect, useState,Suspense,lazy  } from 'react';
import { useCMA } from '@contentful/react-apps-toolkit';
import { ContentTypeProps } from 'contentful-management';

import { Route, BrowserRouter, Routes } from 'react-router-dom';
import { Heading, Box } from '@contentful/f36-components';

import { PageLayout } from '../components/PageLayout';
import Dashboard from '../page/Dashboard';
//import Import from '../page/Import';
//import Export from '../page/Export'

const Export = lazy(() => import('../page/Export'));
const Import = lazy(() => import('../page/Import'));
const Collection = lazy(() => import('../components/Collection'));

function NotFound() {
  return <Heading>404</Heading>;
}

export const PageRouter = () => {
  return (
    <BrowserRouter>
      <Page />
    </BrowserRouter>
  );
};

const Page = () => {
  const cma = useCMA();
  const [contentTypes, setContentTypes] = useState<ContentTypeProps[]>([]);

  useEffect(() => {
    cma.contentType.getMany({}).then((result) => result?.items && setContentTypes(result.items));
  }, []);

  return (
    <Box marginTop="spacingXl" className="page">
      
        <Routes>
          <Route path="/" element={<PageLayout />}>
            <Route index element={<Dashboard contentTypes={contentTypes}/>}/>
            <Route path="import" element={<Suspense fallback={<div>Loading...</div>}><Import/></Suspense>} />
            <Route path="export" element={<Suspense fallback={<div>Loading...</div>}><Export/></Suspense>}  />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      
    </Box>
  );
};
