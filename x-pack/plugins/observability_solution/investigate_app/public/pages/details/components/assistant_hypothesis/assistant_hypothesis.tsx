/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { i18n } from '@kbn/i18n';
import type { RootCauseAnalysisForServiceEvent } from '@kbn/observability-utils-server/llm/service_rca';
import { EcsFieldsResponse } from '@kbn/rule-registry-plugin/common';
import React, { useState } from 'react';
import { useEffect } from 'react';
import { EuiButton, EuiSpacer } from '@elastic/eui';
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

  const [events, setEvents] = useState<RootCauseAnalysisForServiceEvent[]>(
    investigation?.automatedRcaAnalysis ?? []
  );
  const [loading, setLoading] = useState(false);

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
              automatedRcaAnalysis: events,
            },
          });
        }
      }
    };

    updateInvestigationSO();
  }, [events, investigation, investigationId, updateInvestigation]);

  const runRootCauseAnalysis = ({
    connectorId,
    serviceName: nonNullishServiceName,
  }: {
    alert: EcsFieldsResponse;
    connectorId: string;
    serviceName: string;
  }) => {
    const rangeFrom = timeRange.from;

    const rangeTo = timeRange.to;

    const signal = new AbortController().signal;

    setLoading(true);

    investigateAppRepositoryClient
      .stream('POST /internal/observability/investigation/root_cause_analysis', {
        params: {
          body: {
            connectorId,
            context: `The user is investigating an alert for the ${serviceName} service,
            and wants to find the root cause. Here is the alert:

            ${JSON.stringify(alert)}`,
            rangeFrom,
            rangeTo,
            serviceName: nonNullishServiceName,
          },
        },
        signal,
      })
      .subscribe({
        next: (event) => {
          setEvents((prev) => {
            if ('type' in event.event && event.event.type === 'chatCompletionChunk') {
              return prev;
            }
            return prev.concat(event.event);
          });
        },
        error: (error) => {
          notifications.toasts.addError(error, {
            title: i18n.translate('xpack.investigateApp.assistantHypothesis.failedToLoadAnalysis', {
              defaultMessage: `Failed to load analysis`,
            }),
          });
          setLoading(false);
        },
        complete: () => {
          setLoading(false);
        },
      });
  };

  const startAnalysis = () => {
    if (alert && selectedConnector && serviceName) {
      runRootCauseAnalysis({
        alert,
        connectorId: selectedConnector,
        serviceName,
      });
    }
  };

  const restartAnalysis = async () => {
    setEvents([]);

    if (investigation) {
      await updateInvestigation({
        investigationId: investigationId!,
        payload: {
          automatedRcaAnalysis: [],
        },
      });
    }

    startAnalysis();
  };

  if (!serviceName) {
    return null;
  }

  return (
    <>
      <RootCauseAnalysisContainer
        events={events}
        loading={loading || loadingConnector}
        onStartAnalysisClick={startAnalysis}
      />
      {events.length > 0 && !loading && (
        <>
          <EuiSpacer size="s" />
          <EuiButton
            data-test-subj="observabilityAiAssistantAppRootCauseAnalysisCalloutStartAnalysisButton"
            iconType="sparkles"
            fill
            onClick={restartAnalysis}
          >
            {i18n.translate('xpack.investigateApp.rca.calloutText', {
              defaultMessage: 'Re-run analysis',
            })}
          </EuiButton>
        </>
      )}
    </>
  );
}
