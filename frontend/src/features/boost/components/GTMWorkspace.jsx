import React from 'react';
import ServiceWorkspace from './ServiceWorkspace';
import { getBoostServiceBySlug } from '../data/boostServiceData';

export default function GTMWorkspace(props) {
  const service = getBoostServiceBySlug('gtm-strategy');
  return <ServiceWorkspace serviceConfig={service} {...props} />;
}
