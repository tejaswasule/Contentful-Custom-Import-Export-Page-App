import React, { useEffect, useState } from 'react';

import { ContentType, PageAppSDK } from '@contentful/app-sdk';
import { Heading, Paragraph, Grid, Box } from '@contentful/f36-components';

import Collection from '../components/Collection';
import CollectionList from '../components/CollectionList';
import { useCMA, useSDK } from '@contentful/react-apps-toolkit';

interface DashboardProps {
  contentTypes: ContentType[];
}

interface CollectionsState {
  total: number | null;
  published: number | null;
  totalContentType: number | null;
  recent: any[] | null;
}

export default function Dashboard({ contentTypes }: DashboardProps) {
  const sdk = useSDK<PageAppSDK>();
  const cma = useCMA();
  const [data, setData] = useState<CollectionsState>({
    total: null,
    published: null,
    totalContentType: null,
    recent: null,
  });

  useEffect(() => {
    async function fetchData() {
      
      const [total, published, totalContentType] = await Promise.all([
        cma.entry
          .getMany({})
          .then((entries) => entries.total || 0)
          .catch(() => 0),
        sdk.space
          .getPublishedEntries()
          .then((entries) => entries.total || 0)
          .catch(() => 0),
        cma.contentType
          .getMany({})
          .then((types) => types.total)
          .catch(() => 0),
        ,
      ]);

      setData({ ...data, total, published, totalContentType });
      
      const recent = await cma.entry
        .getMany({ query: { 'sys.updatedBy.sys.id': sdk.user.sys.id, limit: 10 } })
        .then((resp) => resp.items)
        .catch(() => []);

      // Set the final data. Loading complete.
      setData({ total, published, totalContentType, recent });
    }

    fetchData();
  }, []);

  return (
    <Box marginTop="spacingXl">
      
      <Heading>Welcome {sdk.user.firstName} {sdk.user.lastName}</Heading>
      <Grid columns="1fr 1fr 1fr" columnGap="spacingM">
        <Collection label="Content Types" value={data.totalContentType} />
        <Collection label="Total entries" value={data.total} />
        <Collection label="Published entries" value={data.published} />
        
      </Grid>

      <Box marginTop="spacingXl">
        
        <Heading as="h2">Your recent work</Heading>
        <Paragraph>These entries were most recently updated by you.</Paragraph>
        <CollectionList
          contentTypes={contentTypes}
          entries={data.recent}
          onClickItem={(entryId) => sdk.navigator.openEntry(entryId)}
        />
      </Box>
    </Box>
  );
}
