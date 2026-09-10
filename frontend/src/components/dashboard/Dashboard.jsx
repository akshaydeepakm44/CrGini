import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import DashboardOverview from './views/DashboardOverview';
import PodSquadView from './views/PodSquadView';
import StrategicPlannerView from './views/StrategicPlannerView';
import CreativePlannerView from './views/CreativePlannerView';
import DevRelPlannerView from './views/DevRelPlannerView';
import SettingsView from './views/SettingsView';
import TeamView from './views/TeamView';
import BillingView from './views/BillingView';
import TopUpModal from './modals/TopUpModal';
import HelpModal from './modals/HelpModal';
import NewCampaignModal from './modals/NewCampaignModal';

export default function Dashboard({ user, onLogout }) {

  const [activeNav, setActiveNav] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [credits, setCredits] = useState(2450);

  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);

  const handleTopUpCredits = (addedAmount) => {
    setCredits((prev) => prev + addedAmount);
    setIsTopUpModalOpen(false);
  };

  const handleLaunchCampaign = (topic) => {

    console.log('Initiated AI campaign:', topic);
  };

  return (
    <div className="dashboard-layout maximalist-dashboard">
      <div className="dash-ambient-glow-1" />
      <div className="dash-ambient-glow-2" />
      <div className="dash-ambient-glow-3" />
      <div className="dash-grid-overlay" />

      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        credits={credits}
        onOpenTopUp={() => setIsTopUpModalOpen(true)}
        onLogout={onLogout}
      />

      <div className={`dash-main ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>

        <TopBar
          activeNav={activeNav}
          user={user}
          onOpenHelp={() => setIsHelpModalOpen(true)}
          onOpenSettings={() => setActiveNav('settings')}
        />

        <main className="dash-content-body">

          {activeNav === 'dashboard' && (
            <DashboardOverview
              user={user}
              credits={credits}
              onOpenNewCampaign={() => setIsNewCampaignModalOpen(true)}
              onOpenTopUp={() => setIsTopUpModalOpen(true)}
              onNavigate={(nav) => setActiveNav(nav)}
            />
          )}

          {activeNav === 'squad' && <PodSquadView />}

          {activeNav === 'strategic-planner' && (
            <StrategicPlannerView
              onNavigateToCreative={() => setActiveNav('creative-planner')}
            />
          )}

          {activeNav === 'creative-planner' && <CreativePlannerView />}

          {activeNav === 'devrel-planner' && <DevRelPlannerView />}

          {activeNav === 'settings' && <SettingsView />}

          {activeNav === 'team' && <TeamView user={user} />}

          {activeNav === 'billing' && (
            <BillingView
              credits={credits}
              onOpenTopUp={() => setIsTopUpModalOpen(true)}
              onTopUpCredits={handleTopUpCredits}
            />
          )}
        </main>
      </div>

      <TopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        onTopUp={handleTopUpCredits}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <NewCampaignModal
        isOpen={isNewCampaignModalOpen}
        onClose={() => setIsNewCampaignModalOpen(false)}
        onLaunch={handleLaunchCampaign}
      />
    </div>
  );
}
