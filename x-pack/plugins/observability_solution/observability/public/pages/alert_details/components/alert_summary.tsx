/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { ReactNode } from 'react';
import { EuiFlexItem, EuiFlexGroup, EuiText, EuiSpacer } from '@elastic/eui';

export interface AlertSummaryField {
  label: ReactNode | string;
  value: ReactNode | string | number;
}
interface AlertSummaryProps {
  alertSummaryFields?: AlertSummaryField[];
}

export function AlertSummary({ alertSummaryFields }: AlertSummaryProps) {
  return (
    <>
      <EuiFlexGroup data-test-subj="alert-summary-container" gutterSize="xl">
        {alertSummaryFields?.map((field, idx) => {
          return (
            <EuiFlexItem key={idx} grow={false}>
              <EuiText color="subdued">{field.label}</EuiText>
              <EuiText>{field.value}</EuiText>
            </EuiFlexItem>
          );
        })}
      </EuiFlexGroup>
      {alertSummaryFields && alertSummaryFields.length > 0 && <EuiSpacer size="l" />}
    </>
  );
}
