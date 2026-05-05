/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { RuleType, RuleTypeParams, RuleTypeState } from '@kbn/alerting-plugin/server';
import { DEFAULT_AAD_CONFIG, AlertsClientError } from '@kbn/alerting-plugin/server';
import { schema } from '@kbn/config-schema';
import type { DefaultAlert } from '@kbn/alerts-as-data-utils';
import type { ElasticsearchClient } from '@kbn/core/server';
import { ALERTING_EXAMPLE_APP_ID } from '../../common/constants';

interface CpuUsageParams extends RuleTypeParams {
  threshold: number;
  warnThreshold?: number;
  timeWindowMinutes: number;
  indexPattern: string;
  hostField: string;
  cpuField: string;
  filterQuery?: string;
}

interface CpuUsageState extends RuleTypeState {
  lastCheckedAt?: string;
}

interface AlertState {
  host: string;
  cpuUsage: number;
}

type CpuActionGroupIds = 'cpu_critical' | 'cpu_warning';

async function queryCpuUsagePerHost(
  esClient: ElasticsearchClient,
  params: CpuUsageParams
): Promise<Array<{ host: string; cpuUsage: number }>> {
  const { indexPattern, timeWindowMinutes, hostField, cpuField, filterQuery } = params;

  const query: Record<string, unknown> = {
    bool: {
      filter: [
        {
          range: {
            '@timestamp': {
              gte: `now-${timeWindowMinutes}m`,
              lte: 'now',
            },
          },
        },
      ],
    },
  };

  if (filterQuery) {
    (query.bool as Record<string, unknown[]>).filter.push({
      query_string: { query: filterQuery },
    });
  }

  const response = await esClient.search({
    index: indexPattern,
    size: 0,
    query,
    aggs: {
      hosts: {
        terms: {
          field: hostField,
          size: 100,
        },
        aggs: {
          avg_cpu: {
            avg: {
              field: cpuField,
            },
          },
        },
      },
    },
  });

  const hostsAgg = response.aggregations?.hosts as
    | { buckets: Array<{ key: string; avg_cpu: { value: number | null } }> }
    | undefined;

  if (!hostsAgg?.buckets) {
    return [];
  }

  return hostsAgg.buckets
    .filter((bucket) => bucket.avg_cpu.value != null)
    .map((bucket) => ({
      host: bucket.key,
      cpuUsage: bucket.avg_cpu.value!,
    }));
}

export const ruleType: RuleType<
  CpuUsageParams,
  never,
  CpuUsageState,
  AlertState,
  never,
  CpuActionGroupIds,
  'recovered',
  DefaultAlert
> = {
  id: 'example.cpu-usage-per-host',
  name: 'CPU Usage Per Host',
  actionGroups: [
    { id: 'cpu_critical', name: 'CPU Critical' },
    { id: 'cpu_warning', name: 'CPU Warning' },
  ],
  defaultActionGroupId: 'cpu_critical',
  minimumLicenseRequired: 'basic',
  isExportable: true,
  recoveryActionGroup: {
    id: 'recovered',
    name: 'Recovered',
  },
  doesSetRecoveryContext: true,
  actionVariables: {
    context: [
      { name: 'host', description: 'The hostname that triggered the alert' },
      { name: 'cpuUsage', description: 'The average CPU usage percentage' },
      { name: 'threshold', description: 'The configured threshold' },
      {
        name: 'reason',
        description: 'A human-readable description of why the alert fired',
      },
    ],
  },
  async executor({ services, params, state }) {
    const { alertsClient } = services;
    if (!alertsClient) {
      throw new AlertsClientError();
    }

    const esClient = services.scopedClusterClient.asCurrentUser;
    const hostMetrics = await queryCpuUsagePerHost(esClient, params);

    for (const { host, cpuUsage } of hostMetrics) {
      if (cpuUsage >= params.threshold) {
        alertsClient.report({
          id: host,
          actionGroup: 'cpu_critical',
          state: { host, cpuUsage },
          context: {
            host,
            cpuUsage: Math.round(cpuUsage * 1000) / 10,
            threshold: params.threshold * 100,
            reason: `CPU usage on ${host} is ${Math.round(cpuUsage * 1000) / 10}% (threshold: ${params.threshold * 100}%)`,
          },
        });
      } else if (params.warnThreshold != null && cpuUsage >= params.warnThreshold) {
        alertsClient.report({
          id: host,
          actionGroup: 'cpu_warning',
          state: { host, cpuUsage },
          context: {
            host,
            cpuUsage: Math.round(cpuUsage * 1000) / 10,
            threshold: params.warnThreshold * 100,
            reason: `CPU usage on ${host} is ${Math.round(cpuUsage * 1000) / 10}% (warning threshold: ${params.warnThreshold * 100}%)`,
          },
        });
      }
    }

    return {
      state: {
        lastCheckedAt: new Date().toISOString(),
      },
    };
  },
  category: 'observability',
  producer: ALERTING_EXAMPLE_APP_ID,
  solution: 'stack',
  alerts: DEFAULT_AAD_CONFIG,
  validate: {
    params: schema.object({
      threshold: schema.number({
        defaultValue: 0.9,
        min: 0,
        max: 1,
        meta: { description: 'CPU usage threshold as a decimal (0.9 = 90%)' },
      }),
      warnThreshold: schema.maybe(
        schema.number({
          min: 0,
          max: 1,
          meta: { description: 'Warning threshold as a decimal (0.75 = 75%)' },
        })
      ),
      timeWindowMinutes: schema.number({
        defaultValue: 5,
        min: 1,
        meta: { description: 'Time window in minutes to aggregate CPU usage' },
      }),
      indexPattern: schema.string({
        defaultValue: 'metrics-*',
        meta: { description: 'Index pattern to query for CPU metrics' },
      }),
      hostField: schema.string({
        defaultValue: 'host.name',
        meta: { description: 'Field containing the host name' },
      }),
      cpuField: schema.string({
        defaultValue: 'system.cpu.total.norm.pct',
        meta: { description: 'Field containing the CPU usage value (0-1)' },
      }),
      filterQuery: schema.maybe(
        schema.string({
          meta: { description: 'Optional filter query to scope the data' },
        })
      ),
    }),
  },
};
