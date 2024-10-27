/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { InferenceClient, withoutOutputUpdateEvents } from '@kbn/inference-plugin/server';
import { lastValueFrom } from 'rxjs';
import { RCA_SYSTEM_PROMPT_BASE, SYSTEM_PROMPT_ENTITIES } from './system_prompt_base';

const SYSTEM_PROMPT_ADDENDUM = `# Guide: Constructing Keyword Searches to Find Related Entities

When investigating issues like elevated failure rates for a
specific endpoint, you can use the metadata at hand (IP addresses,
URLs, session IDs, tracing IDs, etc.) to build targeted keyword searches.
By extracting meaningful fragments from the data, you can correlate
related services or hosts across distributed systems. Here’s how
you can break down the metadata and format your searches.

## Grouping fields

Define grouping fields for the entities you want to extract. For
instance, "service.name" if you are looking for services, or
"kubernetes.pod.name" if you are looking for pods. Focus
on services, unless you are looking for deployment or
configuration changes.

---

## Key Metadata and Search Format

### Example: Investigating a service failure for \`/api/products\`

You can break down various pieces of metadata into searchable
fragments. For each value, include a short description of its
relationship to the investigation. This value will be used
by the system to determine the relevance of a given entity
that matches the search request.

### 1. **IP Address and Port**
- **Fragments:**
  - \`"10.44.0.11:8080"\`: Full address.
  - \`"10.44.0.11"\`: IP address only.
  - \`"8080"\`: Port number.
- **Relationship:** Describes the IP and port of the investigated service
(\`myservice\`).

### 2. **Outgoing Request URL**
- **Fragments:**
  - \`"http://called-service/api/product"\`: Full outgoing URL.
  - \`"/api/product*"\`: Endpoint path.
  - \`"called-service"\`: Service name of the upstream dependency.
  - **Relationship:** Identifies an outgoing request from \`myservice\`
  to an upstream service.

### 3. **Parent and Span IDs**
  - **Fragments:**
    - \`"000aa"\`: Parent ID.
    - \`"000bbb"\`: Span ID.
  - **Relationship:** Tracing IDs linking \`myservice\` with downstream
  services making calls.

---

## Example Search Format in JSON

To structure your keyword search, format the fragments and their
relationships in a JSON array like this:

\`\`\`json
{
  "groupingFields": [ "service.name" ],
  "values": [
    {
      "fragments": [
        "10.44.0.11:8080",
        "10.44.0.11",
        "8080"
      ],
      "relationship": "This describes the IP address and port that the investigated service (<service-name>) is running on."
    },
    {
      "fragments": [
        "http://<upstream-service>/api/product",
        "/api/product",
        "<upstream-service>>"
      ],
      "relationship": "These URL fragments, found in the data for the investigated service (<service-name>), were part of outgoing connections to an upstream service."
    },
    {
      "fragments": [
        "000aa",
        "000bbb"
      ],
      "relationship": "These describe parent and span IDs found on the investigated service (<service-name>). They could be referring to spans found on the downstream service that called out to <service-name>."
    }
  ]
}`;

export async function writeKeywordSearch({
  connectorId,
  inferenceClient,
  entity,
  dataToAnalyzePrompt,
  context,
}: {
  connectorId: string;
  inferenceClient: InferenceClient;
  entity: Record<string, string>;
  dataToAnalyzePrompt: string;
  context: string;
}): Promise<{
  groupingFields: string[];
  values: Array<{
    fragments: string[];
    relationship: string;
  }>;
}> {
  const outputCompleteEvent$ = await lastValueFrom(
    inferenceClient
      .output('extract_keyword_searches', {
        connectorId,
        system: `${RCA_SYSTEM_PROMPT_BASE}

        ${SYSTEM_PROMPT_ENTITIES}`,
        input: `Your current task is to to extract keyword searches
        to find related entities to the entity ${JSON.stringify(entity)},
        based on the following context:
        
        ${dataToAnalyzePrompt}

        ## Context
        ${context}

        ## Instructions
        ${SYSTEM_PROMPT_ADDENDUM}`,
        schema: {
          type: 'object',
          properties: {
            groupingFields: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            values: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  fragments: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                  relationship: {
                    type: 'string',
                  },
                },
                required: ['fragments', 'relationship'],
              },
            },
          },
          required: ['values', 'groupingFields'],
        } as const,
      })
      .pipe(withoutOutputUpdateEvents())
  );

  return outputCompleteEvent$.output;
}
