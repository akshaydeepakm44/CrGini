import React from 'react';
import CreativeWorkspace from '../components/CreativeWorkspace';

export default function PostersCreativesPage({ requests = [], onRefresh, user }) {
  return (
    <div style={{ padding: '28px 32px', maxWidth: '1600px', margin: '0 auto' }}>
      <CreativeWorkspace
        requests={requests}
        onRefreshData={onRefresh}
        user={user}
      />
    </div>
  );
}
