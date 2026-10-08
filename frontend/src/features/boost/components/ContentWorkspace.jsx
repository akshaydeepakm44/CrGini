import React from 'react';
import ServiceWorkspace from './ServiceWorkspace';
import { getBoostServiceBySlug } from '../data/boostServiceData';

export default function ContentWorkspace(props) {
  const service = getBoostServiceBySlug('content');
  return <ServiceWorkspace serviceConfig={service} {...props} />;
}
