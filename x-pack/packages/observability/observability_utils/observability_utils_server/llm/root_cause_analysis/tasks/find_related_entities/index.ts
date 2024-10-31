/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { InferenceClient } from '@kbn/inference-plugin/server';
import { Logger } from '@kbn/logging';
import {
  DocumentAnalysis,
  TruncatedDocumentAnalysis,
} from '@kbn/observability-utils-common/llm/log_analysis/document_analysis';
import { ObservabilityElasticsearchClient } from '../../../../es/client/create_observability_es_client';
import {
  analyzeFetchedRelatedEntities,
  RelatedEntityFromSearchResults,
} from './analyze_fetched_related_entities';
import {
  RelatedEntityKeywordSearch,
  writeKeywordSearchForRelatedEntities,
} from './write_keyword_searches_for_related_entities';
import { FieldPatternResultWithChanges } from '../../../../entities/get_log_patterns';

export type { RelatedEntityFromSearchResults };

export async function findRelatedEntities({
  connectorId,
  inferenceClient,
  start,
  end,
  index,
  esClient,
  entity,
  analysis,
  logger,
  context,
  ownPatterns,
  patternsFromOtherEntities,
}: {
  connectorId: string;
  inferenceClient: InferenceClient;
  start: number;
  end: number;
  index: string | string[];
  esClient: ObservabilityElasticsearchClient;
  entity: Record<string, string>;
  analysis: {
    truncated: TruncatedDocumentAnalysis;
    full: DocumentAnalysis;
  };
  logger: Logger;
  context: string;
  ownPatterns: FieldPatternResultWithChanges[];
  patternsFromOtherEntities: FieldPatternResultWithChanges[];
}): Promise<{
  searches: RelatedEntityKeywordSearch[];
  content: string;
  foundEntities: RelatedEntityFromSearchResults[];
}> {
  const { groupingFields, searches } = await writeKeywordSearchForRelatedEntities({
    connectorId,
    inferenceClient,
    entity,
    analysis: analysis.truncated,
    ownPatterns,
    context,
  });

  const { content: relatedEntitiesContent, foundEntities } = await analyzeFetchedRelatedEntities({
    entity,
    connectorId,
    start,
    end,
    esClient,
    index,
    inferenceClient,
    searches,
    groupingFields,
    logger,
    analysis,
    ownPatterns,
    patternsFromOtherEntities,
    context,
  });

  return {
    searches,
    content: relatedEntitiesContent,
    foundEntities,
  };
}
