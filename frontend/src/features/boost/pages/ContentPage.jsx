import React from 'react';
import ContentWorkspace from '../components/ContentWorkspace';

export default function ContentPage({ requests = [], onRefresh, user }) {
  return (
    <div style={{ padding: '28px 32px', maxWidth: '1600px', margin: '0 auto' }}>
      <ContentWorkspace
        requests={requests}
        onRefreshData={onRefresh}
        user={user}
      />
    </div>
  );
}
