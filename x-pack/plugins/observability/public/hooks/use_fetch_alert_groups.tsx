/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useQuery } from '@tanstack/react-query';
import { INTERNAL_BASE_ALERTING_API_PATH } from '@kbn/alerting-plugin/common';
import { useKibana } from '../utils/kibana_react';

export const useFetchAlertGroups = () => {
  const { http } = useKibana().services;

  const fetchAlertGroups = useQuery(['alertGroups'], () => {
    try {
      // const body = JSON.stringify({
      //   ...(indices?.length ? { indices } : {}),
      //   ...(alertUuids ? { alert_uuids: alertUuids } : {}),
      // });
      // return http.post(`${INTERNAL_BASE_ALERTING_API_PATH}/alerts/get_alert_groups`, { body });
      return http.post(`${INTERNAL_BASE_ALERTING_API_PATH}/alerts/get_alert_groups`);
    } catch (e) {
      throw new Error(`Unable to parse alert groups params: ${e}`);
    }
  });

  return fetchAlertGroups;
};
