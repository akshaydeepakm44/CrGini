import React from 'react';
import ServiceWorkspace from './ServiceWorkspace';
import { getBoostServiceBySlug } from '../data/boostServiceData';

export default function AdCreativeWorkspace(props) {
  const service = getBoostServiceBySlug('ad-creatives');
  return <ServiceWorkspace serviceConfig={service} {...props} />;
}
