/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { InferenceClient, withoutOutputUpdateEvents } from '@kbn/inference-plugin/server';
import { lastValueFrom, map } from 'rxjs';
import { RCA_SYSTEM_PROMPT_BASE } from './system_prompt_base';
import { ObservationStepSummary } from './observe';
import { stringifySummaries } from './stringify_summaries';

type SignificantEventSeverity = 'info' | 'unusual' | 'warning' | 'critical';

type SignificantEventType = 'alert' | 'slo' | 'event';

export interface SignificantEvent {
  severity: SignificantEventSeverity;
  '@timestamp'?: string;
  description: string;
  type: SignificantEventType;
}

export interface SignificantEventsTimeline {
  events: SignificantEvent[];
}

export async function generateSignificantEventsTimeline({
  inferenceClient,
  report,
  connectorId,
  summaries,
}: {
  inferenceClient: InferenceClient;
  report: string;
  connectorId: string;
  summaries: ObservationStepSummary[];
}): Promise<SignificantEventsTimeline> {
  return await lastValueFrom(
    inferenceClient
      .output('generate_timeline', {
        system: `${RCA_SYSTEM_PROMPT_BASE}`,
        connectorId,
        input: `Your current task is to generate a timeline
        of significant events, based on the given RCA report,
        according to a structured schema. This timeline will
        be presented to the user as a visualization.

        ${stringifySummaries(summaries)}

        # Report

        ${report}
    `,
        schema: {
          type: 'object',
          properties: {
            events: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  timestamp: {
                    type: 'string',
                    description: 'The ISO timestamp of when the event occurred',
                  },
                  severity: {
                    type: 'string',
                    enum: ['info', 'unusual', 'warning', 'critical'],
                  },
                  type: {
                    type: 'string',
                    enum: ['alert', 'slo', 'event'],
                  },
                  description: {
                    type: 'string',
                    description: 'A description of the event',
                  },
                },
                required: ['severity', 'description'],
              },
            },
          },
          required: ['events'],
        } as const,
      })
      .pipe(
        withoutOutputUpdateEvents(),
        map((timelineCompleteEvent) => {
          return {
            events: timelineCompleteEvent.output.events.map((event) => {
              return {
                '@timestamp': event.timestamp,
                severity: event.severity,
                type: event.type ?? 'event',
                description: event.description,
              };
            }),
          };
        })
      )
  );
}
