import React from 'react';
import AdCreativeWorkspace from '../components/AdCreativeWorkspace';

export default function AdCreativesPage({ requests = [], onRefresh, user }) {
  return (
    <div style={{ padding: '28px 32px', maxWidth: '1600px', margin: '0 auto' }}>
      <AdCreativeWorkspace
        requests={requests}
        onRefreshData={onRefresh}
        user={user}
      />
    </div>
  );
}
