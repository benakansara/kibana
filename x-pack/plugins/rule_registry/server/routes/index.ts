/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { IRouter } from '@kbn/core/server';
import { getAlertsGroupAggregations } from './get_alerts_group_aggregations';
import { RacRequestHandlerContext } from '../types';
import { getAlertByIdRoute } from './get_alert_by_id';
import { updateAlertByIdRoute } from './update_alert_by_id';
import { getAlertsIndexRoute } from './get_alert_index';
import { bulkUpdateAlertsRoute } from './bulk_update_alerts';
import { findAlertsByQueryRoute } from './find';
import { getFeatureIdsByRegistrationContexts } from './get_feature_ids_by_registration_contexts';
import { getBrowserFieldsByFeatureId } from './get_browser_fields_by_feature_id';
import { getAlertSummaryRoute } from './get_alert_summary';
import { getAADFieldsByRuleType } from './get_aad_fields_by_rule_type';
import { updateAlertInvestigationIdsRoute } from './update_alert_investigation_ids';

export function defineRoutes(router: IRouter<RacRequestHandlerContext>) {
  getAlertByIdRoute(router);
  updateAlertByIdRoute(router);
  getAlertsIndexRoute(router);
  bulkUpdateAlertsRoute(router);
  findAlertsByQueryRoute(router);
  getAlertsGroupAggregations(router);
  getFeatureIdsByRegistrationContexts(router);
  getBrowserFieldsByFeatureId(router);
  getAlertSummaryRoute(router);
  getAADFieldsByRuleType(router);
  updateAlertInvestigationIdsRoute(router);
}
