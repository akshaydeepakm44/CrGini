import React from 'react';
import ServiceWorkspace from './ServiceWorkspace';
import { getBoostServiceBySlug } from '../data/boostServiceData';

export default function DevRelWorkspace(props) {
  const service = getBoostServiceBySlug('devrel');
  return <ServiceWorkspace serviceConfig={service} {...props} />;
}
