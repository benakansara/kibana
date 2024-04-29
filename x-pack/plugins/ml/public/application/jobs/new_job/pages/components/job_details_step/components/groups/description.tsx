/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { FC } from 'react';
import React, { memo } from 'react';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';
import { EuiDescribedFormGroup, EuiFormRow } from '@elastic/eui';
import type { Validation } from '../../../../../common/job_validator';

interface Props {
  children: React.ReactNode;
  validation: Validation;
}

export const Description: FC<Props> = memo(({ children, validation }) => {
  const title = i18n.translate('xpack.ml.newJob.wizard.jobDetailsStep.jobGroupSelect.title', {
    defaultMessage: 'Groups',
  });
  return (
    <EuiDescribedFormGroup
      title={<h3>{title}</h3>}
      description={
        <FormattedMessage
          id="xpack.ml.newJob.wizard.jobDetailsStep.jobGroupSelect.description"
          defaultMessage=" Optional grouping for jobs. New groups can be created or picked from the list of existing groups."
        />
      }
    >
      <EuiFormRow error={validation.message} isInvalid={validation.valid === false}>
        <>{children}</>
      </EuiFormRow>
    </EuiDescribedFormGroup>
  );
});
