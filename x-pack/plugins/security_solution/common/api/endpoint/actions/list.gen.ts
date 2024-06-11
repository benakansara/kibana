/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/*
 * NOTICE: Do not edit this file manually.
 * This file is automatically generated by the OpenAPI Generator, @kbn/openapi-generator.
 *
 * info:
 *   title: Actions List Schema
 *   version: 2023-10-31
 */

import { z } from 'zod';

import {
  AgentIds,
  Commands,
  Page,
  StartDate,
  EndDate,
  UserIds,
  Types,
  WithOutputs,
} from '../model/schema/common.gen';

export type EndpointActionListRequestQuery = z.infer<typeof EndpointActionListRequestQuery>;
export const EndpointActionListRequestQuery = z.object({
  agentIds: AgentIds.optional(),
  commands: Commands.optional(),
  page: Page.optional(),
  /**
   * Number of items per page
   */
  pageSize: z.number().int().min(1).max(10000).optional().default(10),
  startDate: StartDate.optional(),
  endDate: EndDate.optional(),
  userIds: UserIds.optional(),
  types: Types.optional(),
  withOutputs: WithOutputs.optional(),
});
