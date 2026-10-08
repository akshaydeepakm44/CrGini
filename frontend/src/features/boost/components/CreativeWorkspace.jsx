import React from 'react';
import ServiceWorkspace from './ServiceWorkspace';
import { getBoostServiceBySlug } from '../data/boostServiceData';

export default function CreativeWorkspace(props) {
  const service = getBoostServiceBySlug('posters');
  return <ServiceWorkspace serviceConfig={service} {...props} />;
}
