import React from 'react';
import VideoWorkspace from '../components/VideoWorkspace';

export default function VideosPage({ requests = [], onRefresh, user }) {
  return (
    <div style={{ padding: '28px 32px', maxWidth: '1600px', margin: '0 auto' }}>
      <VideoWorkspace
        requests={requests}
        onRefreshData={onRefresh}
        user={user}
      />
    </div>
  );
}
