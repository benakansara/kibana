/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { retryIfConflicts } from '../../../../lib/retry_if_conflicts';
import { ruleAuditEvent, RuleAuditAction } from '../../../../rules_client/common/audit_events';
import { RulesClientContext } from '../../../../rules_client/types';

type AlertGroupsResult = Array<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ['kibana.alert.group']: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ['kibana.alert.context.groupByKeys']: any;
}>;

export async function getAlertGroups(context: RulesClientContext): Promise<AlertGroupsResult> {
  //   try {
  //     bulkUntrackBodySchema.validate(params);
  //   } catch (error) {
  //     throw Boom.badRequest(`Failed to validate params: ${error.message}`);
  //   }

  return await retryIfConflicts(
    context.logger,
    `rulesClient.getAlertGroups`,
    async () => await getAlertGroupsWithOCC(context)
  );
}

async function getAlertGroupsWithOCC(context: RulesClientContext) {
  try {
    if (!context.alertsService) throw new Error('unable to access alertsService');
    return await context.alertsService.getAlertGroups();
  } catch (error) {
    context.auditLogger?.log(
      ruleAuditEvent({
        action: RuleAuditAction.GET_ALERT_GROUPS,
        error,
      })
    );
    throw error;
  }
}
