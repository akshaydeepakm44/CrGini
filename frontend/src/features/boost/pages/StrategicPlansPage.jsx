import React from 'react';
import StrategicPlanWorkspace from '../components/StrategicPlanWorkspace';

export default function StrategicPlansPage({ requests = [], onRefresh, user }) {
  return (
    <div style={{ padding: '28px 32px', maxWidth: '1600px', margin: '0 auto' }}>
      <StrategicPlanWorkspace
        requests={requests}
        onRefreshData={onRefresh}
        user={user}
      />
    </div>
  );
}
