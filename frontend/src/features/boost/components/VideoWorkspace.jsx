import React from 'react';
import ServiceWorkspace from './ServiceWorkspace';
import { getBoostServiceBySlug } from '../data/boostServiceData';

export default function VideoWorkspace(props) {
  const service = getBoostServiceBySlug('videos');
  return <ServiceWorkspace serviceConfig={service} {...props} />;
}
