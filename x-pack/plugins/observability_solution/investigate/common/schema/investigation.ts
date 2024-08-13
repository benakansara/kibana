/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import * as t from 'io-ts';
import { alertOriginSchema, blankOriginSchema } from './origin';

const investigationResponseSchema = t.type({
  id: t.string,
  title: t.string,
  createdAt: t.number,
  createdBy: t.string,
  params: t.type({
    timeRange: t.type({ from: t.number, to: t.number }),
  }),
  origin: t.union([alertOriginSchema, blankOriginSchema]),
  status: t.union([t.literal('ongoing'), t.literal('closed')]),
});

type InvestigationResponse = t.OutputOf<typeof investigationResponseSchema>;

export { investigationResponseSchema };
export type { InvestigationResponse };
