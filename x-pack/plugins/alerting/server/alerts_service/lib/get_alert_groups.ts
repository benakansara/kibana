/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { ElasticsearchClient } from '@kbn/core-elasticsearch-server';
import { Logger } from '@kbn/logging';

type AlertGroupsResult = Array<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ['kibana.alert.group']: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ['kibana.alert.context.groupByKeys']: any;
}>;

export async function getAlertGroups({
  logger,
  esClient,
}: {
  logger: Logger;
  esClient: ElasticsearchClient;
}): Promise<AlertGroupsResult> {
  try {
    const searchResponse = await esClient.search({
      index: '.alerts-observability.*',
      allow_no_indices: true,
      body: {
        // size: 5,
        query: {
          bool: {
            filter: {
              range: {
                '@timestamp': {
                  gte: 'now-15m',
                  lt: 'now',
                },
              },
            },
          },
        },
        _source: ['kibana.alert.group'],
      },
    });

    return searchResponse.hits.hits.map((hit) => hit._source) as AlertGroupsResult;
  } catch (err) {
    logger.error(`Error - ${err.message}`);
    throw err;
  }
}
