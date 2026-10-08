import React from 'react';
import ServiceWorkspace from './ServiceWorkspace';
import { getBoostServiceBySlug } from '../data/boostServiceData';

export default function StrategicPlanWorkspace(props) {
  const service = getBoostServiceBySlug('strategic-plans');
  return <ServiceWorkspace serviceConfig={service} {...props} />;
}
