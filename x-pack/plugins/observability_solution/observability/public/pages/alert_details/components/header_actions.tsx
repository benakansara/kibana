/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, useState } from 'react';
import { i18n } from '@kbn/i18n';
import { noop } from 'lodash';
import { CaseAttachmentsWithoutOwner } from '@kbn/cases-plugin/public/types';
import { AttachmentType } from '@kbn/cases-plugin/common';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPopover,
  EuiText,
} from '@elastic/eui';
import {
  AlertStatus,
  ALERT_RULE_UUID,
  ALERT_STATUS_ACTIVE,
  ALERT_UUID,
  ALERT_INVESTIGATION_IDS,
  ALERT_RULE_CATEGORY,
  ALERT_START,
  ALERT_END,
} from '@kbn/rule-data-utils';

import { v4 as uuidv4 } from 'uuid';
import { getPaddedAlertTimeRange } from '@kbn/observability-get-padded-alert-time-range-util';
import { useKibana } from '../../../utils/kibana_react';
import { useFetchRule } from '../../../hooks/use_fetch_rule';
import type { TopAlert } from '../../../typings/alerts';
import { paths } from '../../../../common/locators/paths';
import { useBulkUntrackAlerts } from '../hooks/use_bulk_untrack_alerts';
import { useCreateInvestigation } from '../hooks/use_create_investigation';
import { useUpdateInvestigationIds } from '../hooks/use_update_investigation_ids';

export interface HeaderActionsProps {
  alert: TopAlert | null;
  alertIndex?: string;
  alertStatus?: AlertStatus;
  onUntrackAlert: () => void;
}

export function HeaderActions({
  alert,
  alertIndex,
  alertStatus,
  onUntrackAlert,
}: HeaderActionsProps) {
  const {
    cases: {
      hooks: { useCasesAddToExistingCaseModal },
    },
    triggersActionsUi: { getEditRuleFlyout: EditRuleFlyout, getRuleSnoozeModal: RuleSnoozeModal },
    http,
    application: { navigateToApp },
    investigate,
  } = useKibana().services;

  const { rule, refetch } = useFetchRule({
    ruleId: alert?.fields[ALERT_RULE_UUID] || '',
  });

  const investigationId = alert?.fields[ALERT_INVESTIGATION_IDS] ?? 'new';

  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [ruleConditionsFlyoutOpen, setRuleConditionsFlyoutOpen] = useState<boolean>(false);
  const [snoozeModalOpen, setSnoozeModalOpen] = useState<boolean>(false);

  const selectCaseModal = useCasesAddToExistingCaseModal();

  const { mutateAsync: untrackAlerts } = useBulkUntrackAlerts();

  const handleUntrackAlert = useCallback(async () => {
    if (alert) {
      await untrackAlerts({
        indices: ['.internal.alerts-observability.*'],
        alertUuids: [alert.fields[ALERT_UUID]],
      });
      onUntrackAlert();
    }
  }, [alert, untrackAlerts, onUntrackAlert]);

  const handleTogglePopover = () => setIsPopoverOpen(!isPopoverOpen);
  const handleClosePopover = () => setIsPopoverOpen(false);

  const attachments: CaseAttachmentsWithoutOwner =
    alert && rule
      ? [
          {
            alertId: alert?.fields[ALERT_UUID] || '',
            index: alertIndex || '',
            rule: {
              id: rule.id,
              name: rule.name,
            },
            type: AttachmentType.alert,
          },
        ]
      : [];

  const handleAddToCase = () => {
    setIsPopoverOpen(false);
    selectCaseModal.open({ getAttachments: () => attachments });
  };

  const handleEditRuleDetails = () => {
    setIsPopoverOpen(false);
    setRuleConditionsFlyoutOpen(true);
  };

  const handleOpenSnoozeModal = () => {
    setIsPopoverOpen(false);
    setSnoozeModalOpen(true);
  };

  const { mutateAsync: createInvestigation } = useCreateInvestigation();
  const { mutateAsync: updateInvestigationIds } = useUpdateInvestigationIds();

  const alertStart = alert?.fields[ALERT_START];
  const alertEnd = alert?.fields[ALERT_END];

  const createOrOpenInvestigation = async () => {
    if (!alert) return;

    if (!alert.fields[ALERT_INVESTIGATION_IDS]) {
      const paddedAlertTimeRange = getPaddedAlertTimeRange(alertStart!, alertEnd);

      const investigationResponse = await createInvestigation({
        investigation: {
          id: uuidv4(),
          title: `Investigate ${alert.fields[ALERT_RULE_CATEGORY]} breached`,
          params: {
            timeRange: {
              from: new Date(paddedAlertTimeRange.from).getTime(),
              to: new Date(paddedAlertTimeRange.to).getTime(),
            },
          },
          origin: {
            type: 'alert',
            id: alert.fields[ALERT_UUID] ?? '',
          },
        },
      });

      updateInvestigationIds({
        index: alertIndex ?? '',
        alertUuid: alert.fields[ALERT_UUID],
        investigationIds: [investigationResponse.id],
      });

      navigateToApp('investigate', { path: `/${investigationResponse.id}`, replace: false });
    } else {
      navigateToApp('investigate', {
        path: `/${alert?.fields[ALERT_INVESTIGATION_IDS]}`,
        replace: false,
      });
    }
  };

  return (
    <>
      <EuiFlexGroup direction="row" gutterSize="s" justifyContent="flexEnd">
        {investigate && (
          <EuiFlexItem grow={false}>
            <EuiButton
              onClick={() => {
                createOrOpenInvestigation();
              }}
              fill
              data-test-subj="investigate-alert-button"
            >
              <EuiText size="s">
                {i18n.translate('xpack.observability.alertDetails.investigateAlert', {
                  defaultMessage:
                    investigationId === 'new' ? 'Start investigation' : 'Ongoing investigation',
                })}
              </EuiText>
            </EuiButton>
          </EuiFlexItem>
        )}
        <EuiFlexItem grow={false}>
          <EuiButton
            fill
            iconType="bellSlash"
            onClick={handleOpenSnoozeModal}
            disabled={!alert?.fields[ALERT_RULE_UUID] || !rule}
            data-test-subj="snooze-rule-button"
          >
            <EuiText size="s">
              {i18n.translate('xpack.observability.alertDetails.editSnoozeRule', {
                defaultMessage: 'Snooze the rule',
              })}
            </EuiText>
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiPopover
            panelPaddingSize="none"
            isOpen={isPopoverOpen}
            closePopover={handleClosePopover}
            button={
              <EuiButtonIcon
                display="base"
                size="m"
                iconType="boxesVertical"
                data-test-subj="alert-details-header-actions-menu-button"
                onClick={handleTogglePopover}
                aria-label={i18n.translate('xpack.observability.alertDetails.actionsButtonLabel', {
                  defaultMessage: 'Actions',
                })}
              />
            }
          >
            <div style={{ width: '220px' }}>
              <EuiFlexGroup direction="column" alignItems="flexStart" gutterSize="s">
                <div />

                <EuiButtonEmpty
                  size="s"
                  color="text"
                  iconType="plus"
                  onClick={handleAddToCase}
                  data-test-subj="add-to-case-button"
                >
                  <EuiText size="s">
                    {i18n.translate('xpack.observability.alertDetails.addToCase', {
                      defaultMessage: 'Add to case',
                    })}
                  </EuiText>
                </EuiButtonEmpty>

                <EuiButtonEmpty
                  size="s"
                  color="text"
                  iconType="pencil"
                  onClick={handleEditRuleDetails}
                  disabled={!alert?.fields[ALERT_RULE_UUID] || !rule}
                  data-test-subj="edit-rule-button"
                >
                  <EuiText size="s">
                    {i18n.translate('xpack.observability.alertDetails.editRule', {
                      defaultMessage: 'Edit rule',
                    })}
                  </EuiText>
                </EuiButtonEmpty>

                <EuiButtonEmpty
                  size="s"
                  color="text"
                  iconType="eyeClosed"
                  onClick={handleUntrackAlert}
                  data-test-subj="untrack-alert-button"
                  disabled={alertStatus !== ALERT_STATUS_ACTIVE}
                >
                  <EuiText size="s">
                    {i18n.translate('xpack.observability.alertDetails.untrackAlert', {
                      defaultMessage: 'Mark as untracked',
                    })}
                  </EuiText>
                </EuiButtonEmpty>

                <EuiHorizontalRule margin="none" />

                <EuiButtonEmpty
                  size="s"
                  color="text"
                  iconType="link"
                  disabled={!alert?.fields[ALERT_RULE_UUID] || !rule}
                  data-test-subj="view-rule-details-button"
                  href={rule ? http.basePath.prepend(paths.observability.ruleDetails(rule.id)) : ''}
                  target="_blank"
                >
                  <EuiText size="s">
                    {i18n.translate('xpack.observability.alertDetails.viewRuleDetails', {
                      defaultMessage: 'Go to rule details',
                    })}
                  </EuiText>
                </EuiButtonEmpty>

                <div />
              </EuiFlexGroup>
            </div>
          </EuiPopover>
        </EuiFlexItem>
      </EuiFlexGroup>
      {rule && ruleConditionsFlyoutOpen ? (
        <EditRuleFlyout
          initialRule={rule}
          onClose={() => {
            setRuleConditionsFlyoutOpen(false);
          }}
          onSave={async () => {
            refetch();
          }}
        />
      ) : null}

      {rule && snoozeModalOpen ? (
        <RuleSnoozeModal
          rule={rule}
          onClose={() => setSnoozeModalOpen(false)}
          onRuleChanged={async () => {
            refetch();
          }}
          onLoading={noop}
        />
      ) : null}
    </>
  );
}
