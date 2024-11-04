/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { i18n } from '@kbn/i18n';
import type { RootCauseAnalysisEvent } from '@kbn/observability-ai-server/root_cause_analysis';
import { EcsFieldsResponse } from '@kbn/rule-registry-plugin/common';
import React, { useState, useRef, useEffect } from 'react';
import { omit } from 'lodash';
import { EuiButton, EuiSpacer } from '@elastic/eui';
import {
  ALERT_FLAPPING_HISTORY,
  ALERT_RULE_EXECUTION_TIMESTAMP,
  ALERT_RULE_EXECUTION_UUID,
  EVENT_ACTION,
  EVENT_KIND,
} from '@kbn/rule-registry-plugin/common/technical_rule_data_field_names';
import { isRequestAbortedError } from '@kbn/server-route-repository-client';
import { useKibana } from '../../../../hooks/use_kibana';
import { useInvestigation } from '../../contexts/investigation_context';
import { useUpdateInvestigation } from '../../../../hooks/use_update_investigation';

export interface InvestigationContextualInsight {
  key: string;
  description: string;
  data: unknown;
}

export function AssistantHypothesis({ investigationId }: { investigationId: string }) {
  const {
    alert,
    globalParams: { timeRange },
    investigation,
  } = useInvestigation();

  const { mutateAsync: updateInvestigation } = useUpdateInvestigation();

  const {
    core: { notifications },
    services: { investigateAppRepositoryClient },
    dependencies: {
      start: {
        observabilityAIAssistant: { useGenAIConnectors },
        observabilityAIAssistantApp: { RootCauseAnalysisContainer },
      },
    },
  } = useKibana();

  const { loading: loadingConnector, selectedConnector } = useGenAIConnectors();

  const serviceName = alert?.['service.name'] as string | undefined;

  const [events, setEvents] = useState<RootCauseAnalysisEvent[]>(investigation?.automatedRcaAnalysis?.events ?? []);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const controllerRef = useRef(new AbortController());

  useEffect(() => {
    const updateInvestigationSO = async () => {
      if (investigation && events.length > 0) {
        if (
          events.find(
            (event) =>
              'response' in event && 'report' in event.response && 'timeline' in event.response
          )
        ) {
          await updateInvestigation({
            investigationId: investigationId!,
            payload: {
              automatedRcaAnalysis: { events },
            },
          });
        }
      }
    };

    updateInvestigationSO();
  }, [events, investigation, investigationId, updateInvestigation]);

  const runRootCauseAnalysis = ({
    alert: nonNullishAlert,
    connectorId,
    serviceName: nonNullishServiceName,
  }: {
    alert: EcsFieldsResponse;
    connectorId: string;
    serviceName: string;
  }) => {
    const rangeFrom = timeRange.from;

    const rangeTo = timeRange.to;

    setLoading(true);

    setError(undefined);

    setEvents([]);

    investigateAppRepositoryClient
      .stream('POST /internal/observability/investigation/root_cause_analysis', {
        params: {
          body: {
            connectorId,
            context: `The user is investigating an alert for the ${serviceName} service,
            and wants to find the root cause. Here is the alert:

            ${JSON.stringify(sanitizeAlert(nonNullishAlert))}`,
            rangeFrom,
            rangeTo,
            serviceName: nonNullishServiceName,
          },
        },
        signal: controllerRef.current.signal,
      })
      .subscribe({
        next: (event) => {
          // console.log(event);
          setEvents((prev) => {
            return prev.concat(event.event);
          });
        },
        error: (nextError) => {
          if (!isRequestAbortedError(nextError)) {
            notifications.toasts.addError(nextError, {
              title: i18n.translate(
                'xpack.investigateApp.assistantHypothesis.failedToLoadAnalysis',
                {
                  defaultMessage: `Failed to load analysis`,
                }
              ),
            });
            setError(nextError);
          } else {
            setError(
              new Error(
                i18n.translate('xpack.investigateApp.assistantHypothesis.analysisAborted', {
                  defaultMessage: `Analysis was aborted`,
                })
              )
            );
          }

          setLoading(false);
        },
        complete: () => {
          setEvents((prev) => {
            // console.log('done', prev);
            return prev;
          });
          setLoading(false);
        },
      });
  };

  const startAnalysis = async () => {
    setEvents([]);

    if (investigation) {
      await updateInvestigation({
        investigationId: investigationId!,
        payload: {
          automatedRcaAnalysis: { events: [] },
        },
      });
    }

    if (alert && selectedConnector && serviceName) {
      runRootCauseAnalysis({
        alert,
        connectorId: selectedConnector,
        serviceName,
      });
    }
  };

  if (!serviceName) {
    return null;
  }

  return (
    <>
      <RootCauseAnalysisContainer
        events={events}
        loading={loading || loadingConnector}
        onStopAnalysisClick={() => {
          controllerRef.current.abort();
          controllerRef.current = new AbortController();
        }}
        onResetAnalysisClick={() => {
          controllerRef.current.abort();
          controllerRef.current = new AbortController();
          startAnalysis();
        }}
        error={error}
        onStartAnalysisClick={startAnalysis}
      />
      {events.length > 0 && !loading && (
        <>
          <EuiSpacer size="s" />
          <EuiButton
            data-test-subj="rootCauseAnalysisRerunAnalysisButton"
            iconType="sparkles"
            fill
            onClick={startAnalysis}
          >
            {i18n.translate('xpack.investigateApp.rca.rerunAnalysisButtonText', {
              defaultMessage: 'Re-run analysis',
            })}
          </EuiButton>
        </>
      )}
    </>
  );
}

function sanitizeAlert(alert: EcsFieldsResponse) {
  return omit(
    alert,
    ALERT_RULE_EXECUTION_TIMESTAMP,
    '_index',
    ALERT_FLAPPING_HISTORY,
    EVENT_ACTION,
    EVENT_KIND,
    ALERT_RULE_EXECUTION_UUID,
    '@timestamp'
  );
}
