/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { ObservabilityPluginSetup } from '@kbn/observability-plugin/server';
import type {
  RuleRegistryPluginSetupContract,
  RuleRegistryPluginStartContract,
} from '@kbn/rule-registry-plugin/server';
import type {
  PluginStartContract as AlertingPluginStart,
  PluginSetupContract as AlertingPluginSetup,
} from '@kbn/alerting-plugin/server/plugin';
import type { SloPluginSetup, SloPluginStart } from '@kbn/slo-plugin/server';
import type { InferenceServerStart, InferenceServerSetup } from '@kbn/inference-plugin/server';
import type { SpacesPluginSetup, SpacesPluginStart } from '@kbn/spaces-plugin/server';
import type {
  ApmDataAccessPluginStart,
  ApmDataAccessPluginSetup,
} from '@kbn/apm-data-access-plugin/server';

/* eslint-disable @typescript-eslint/no-empty-interface*/

export interface ConfigSchema {}

export interface InvestigateAppSetupDependencies {
  observability: ObservabilityPluginSetup;
  ruleRegistry: RuleRegistryPluginSetupContract;
  slo: SloPluginSetup;
  alerting: AlertingPluginSetup;
  inference: InferenceServerSetup;
  spaces?: SpacesPluginSetup;
  apmDataAccess: ApmDataAccessPluginSetup;
}

export interface InvestigateAppStartDependencies {
  ruleRegistry: RuleRegistryPluginStartContract;
  slo: SloPluginStart;
  alerting: AlertingPluginStart;
  inference: InferenceServerStart;
  spaces?: SpacesPluginStart;
  apmDataAccess: ApmDataAccessPluginStart;
}

export interface InvestigateAppServerSetup {}

export interface InvestigateAppServerStart {}
