import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';

const ServiceVisibilityContext = createContext(null);

// DiziGini: Digitalising is the primary active platform. Other channels are deactivated.
const DEFAULT_ACTIVE_SERVICES = [
  'channel:digitalising',
  'digitalising',
  'lead-research',
  'company-study',
  'key-people',
  'pitch-support',
  'custom-digitalising'
];

const DEFAULT_DEACTIVATED = [
  'channel:boosting',
  'boosting',
  'channel:design',
  'design',
  'channel:development',
  'development',
  'strategic-planner',
  'content-creator',
  'devrel',
  'gtm',
  'ad-creatives',
  'brand-identity',
  'ui-ux-audit',
  'figma-project',
  'redesign-request',
  'technical-discovery',
  'clickable-prototype',
  'web-app'
];

export function ServiceVisibilityProvider({ children }) {
  const [servicesList, setServicesList] = useState(() => {
    try {
      const cached = localStorage.getItem('cg_service_visibility');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return null;
  });

  const [loading, setLoading] = useState(!servicesList);

  const fetchVisibility = useCallback(async () => {
    try {
      const list = await api.getServicesVisibility();
      if (list && Array.isArray(list)) {
        setServicesList(list);
        localStorage.setItem('cg_service_visibility', JSON.stringify(list));
      }
    } catch (err) {
      console.warn('[ServiceVisibilityContext] error loading settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisibility();
    // Poll or sync every 30s to detect admin changes
    const timer = setInterval(fetchVisibility, 30000);
    return () => clearInterval(timer);
  }, [fetchVisibility]);

  // Lookup map: id -> boolean
  const isChannelActive = useCallback((channelSlug) => {
    if (!channelSlug) return false;
    const clean = channelSlug.toLowerCase().trim();

    if (servicesList) {
      const channelItem = servicesList.find(
        (s) => s.id === `channel:${clean}` || (s.is_channel && s.channel?.toLowerCase() === clean)
      );
      if (channelItem) return Boolean(channelItem.is_active);
    }

    // DiziGini default: Only digitalising is active
    if (clean === 'digitalising') return true;
    return false;
  }, [servicesList]);

  const isServiceActive = useCallback((serviceId) => {
    if (!serviceId) return false;
    const clean = serviceId.toLowerCase().trim();
    
    // Check in remote services list if present
    if (servicesList) {
      const item = servicesList.find((s) => s.id.toLowerCase() === clean);
      if (item) {
        if (!item.is_active) return false;
        if (item.channel && !isChannelActive(item.channel)) return false;
        return true;
      }
    }

    // Default fallback: Digitalising services active, others deactivated
    if (DEFAULT_ACTIVE_SERVICES.includes(clean)) return true;
    if (DEFAULT_DEACTIVATED.includes(clean)) return false;
    return false;
  }, [servicesList, isChannelActive]);

  return (
    <ServiceVisibilityContext.Provider
      value={{
        servicesList,
        loading,
        isChannelActive,
        isServiceActive,
        refreshVisibility: fetchVisibility,
      }}
    >
      {children}
    </ServiceVisibilityContext.Provider>
  );
}

export function useServiceVisibility() {
  const ctx = useContext(ServiceVisibilityContext);
  if (!ctx) {
    // Return safe fallback if used outside provider
    return {
      servicesList: null,
      loading: false,
      isChannelActive: (channel) => channel?.toLowerCase() !== 'digitalising',
      isServiceActive: (serviceId) => !DEFAULT_DEACTIVATED.includes(serviceId?.toLowerCase()),
      refreshVisibility: () => {},
    };
  }
  return ctx;
}
