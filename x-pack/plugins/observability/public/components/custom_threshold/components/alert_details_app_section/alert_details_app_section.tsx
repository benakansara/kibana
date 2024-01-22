/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import moment from 'moment';
import { DataViewBase, Query } from '@kbn/es-query';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';
import React, { useEffect, useMemo, useState } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
  useEuiTheme,
} from '@elastic/eui';
import {
  ALERT_END,
  ALERT_START,
  ALERT_RULE_NAME,
  ALERT_REASON,
  ALERT_EVALUATION_VALUES,
  ALERT_GROUP,
  TAGS,
} from '@kbn/rule-data-utils';
import { Rule, RuleTypeParams } from '@kbn/alerting-plugin/common';
import { AlertAnnotation, AlertActiveTimeRangeAnnotation } from '@kbn/observability-alert-details';
import { getPaddedAlertTimeRange } from '@kbn/observability-get-padded-alert-time-range-util';
import { DataView } from '@kbn/data-views-plugin/common';
import { MetricsExplorerChartType } from '../../../../../common/custom_threshold_rule/types';
import { useLicense } from '../../../../hooks/use_license';
import { useKibana } from '../../../../utils/kibana_react';
import { metricValueFormatter } from '../../../../../common/custom_threshold_rule/metric_value_formatter';
import { AlertSummaryField, TopAlert } from '../../../..';
import {
  AlertParams,
  CustomThresholdAlertFields,
  CustomThresholdRuleTypeParams,
} from '../../types';
import { ExpressionChart } from '../expression_chart';
import { TIME_LABELS } from '../criterion_preview_chart/criterion_preview_chart';
import { Threshold } from '../custom_threshold';
import { LogRateAnalysis } from './log_rate_analysis';
import { Groups } from './groups';
import { Tags } from './tags';

// TODO Use a generic props for app sections https://github.com/elastic/kibana/issues/152690
export type CustomThresholdRule = Rule<CustomThresholdRuleTypeParams>;
export type CustomThresholdAlert = TopAlert<CustomThresholdAlertFields>;

const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD HH:mm';
const ALERT_START_ANNOTATION_ID = 'alert_start_annotation';
const ALERT_TIME_RANGE_ANNOTATION_ID = 'alert_time_range_annotation';

interface AppSectionProps {
  alert: CustomThresholdAlert;
  rule: CustomThresholdRule;
  ruleLink: string;
  setAlertSummaryFields: React.Dispatch<React.SetStateAction<AlertSummaryField[] | undefined>>;
}

// eslint-disable-next-line import/no-default-export
export default function AlertDetailsAppSection({
  alert,
  rule,
  ruleLink,
  setAlertSummaryFields,
}: AppSectionProps) {
  const services = useKibana().services;
  const { uiSettings, charts, data, http } = services;
  const { euiTheme } = useEuiTheme();
  const { hasAtLeast } = useLicense();
  const hasLogRateAnalysisLicense = hasAtLeast('platinum');
  const [dataView, setDataView] = useState<DataView>();
  const [, setDataViewError] = useState<Error>();
  const ruleParams = rule.params as RuleTypeParams & AlertParams;
  const chartProps = {
    baseTheme: charts.theme.useChartsBaseTheme(),
  };
  const alertStartTime = alert.fields[ALERT_START];
  const alertEndTime = alert.fields[ALERT_END];
  const timeRange = useMemo(
    () => getPaddedAlertTimeRange(alertStartTime!, alertEndTime),
    [alertStartTime, alertEndTime]
  );
  const alertEnd = alert.fields[ALERT_END] ? moment(alert.fields[ALERT_END]).valueOf() : undefined;
  const annotations = [
    <AlertAnnotation
      alertStart={alert.start}
      color={euiTheme.colors.danger}
      dateFormat={uiSettings.get('dateFormat') || DEFAULT_DATE_FORMAT}
      id={ALERT_START_ANNOTATION_ID}
      key={ALERT_START_ANNOTATION_ID}
    />,
    <AlertActiveTimeRangeAnnotation
      alertStart={alert.start}
      alertEnd={alertEnd}
      color={euiTheme.colors.danger}
      id={ALERT_TIME_RANGE_ANNOTATION_ID}
      key={ALERT_TIME_RANGE_ANNOTATION_ID}
    />,
  ];

  useEffect(() => {
    const groups = alert.fields[ALERT_GROUP];
    const tags = alert.fields[TAGS];
    const alertSummaryFields = [];
    if (groups) {
      alertSummaryFields.push({
        label: i18n.translate(
          'xpack.observability.customThreshold.rule.alertDetailsAppSection.summaryField.source',
          {
            defaultMessage: 'Source',
          }
        ),
        value: <Groups groups={groups} />,
      });
    }
    if (tags && tags.length > 0) {
      alertSummaryFields.push({
        label: i18n.translate(
          'xpack.observability.customThreshold.rule.alertDetailsAppSection.summaryField.tags',
          {
            defaultMessage: 'Tags',
          }
        ),
        value: <Tags tags={tags} />,
      });
    }
    alertSummaryFields.push({
      label: i18n.translate(
        'xpack.observability.customThreshold.rule.alertDetailsAppSection.summaryField.rule',
        {
          defaultMessage: 'Rule',
        }
      ),
      value: (
        <EuiLink data-test-subj="thresholdRuleAlertDetailsAppSectionRuleLink" href={ruleLink}>
          {rule.name}
        </EuiLink>
      ),
    });
    if (rule.dashboards && rule.dashboards?.length > 0) {
      alertSummaryFields.push({
        label: i18n.translate(
          'xpack.observability.customThreshold.rule.alertDetailsAppSection.summaryField.dashboards',
          {
            defaultMessage: 'Dashboards',
          }
        ),
        value: rule.dashboards?.map((dashboard) => (
          <div>
            <EuiLink
              data-test-subj="thresholdRuleAlertDetailsAppSectionDashboardsLink"
              href={http.basePath.prepend(
                `/app/dashboards#/view/${dashboard.id}?_g=(time:(from:'${timeRange.from}',to:'${
                  timeRange.to
                }'),alert:(start:'${alert.fields[ALERT_START]}'${
                  alert.fields[ALERT_END] ? `,end:'${alert.fields[ALERT_END]}'` : ''
                },rule:'${alert.fields[ALERT_RULE_NAME]}',reason:'${alert.fields[ALERT_REASON]}'))`
              )}
              target="_blank"
            >
              {dashboard.title}
            </EuiLink>
          </div>
        )),
      });
    }

    setAlertSummaryFields(alertSummaryFields);
  }, [alert, rule, ruleLink, setAlertSummaryFields, http, timeRange]);

  const derivedIndexPattern = useMemo<DataViewBase>(
    () => ({
      fields: dataView?.fields || [],
      title: dataView?.getIndexPattern() || 'unknown-index',
    }),
    [dataView]
  );

  useEffect(() => {
    const initDataView = async () => {
      const ruleSearchConfiguration = ruleParams.searchConfiguration;
      try {
        const createdSearchSource = await data.search.searchSource.create(ruleSearchConfiguration);
        setDataView(createdSearchSource.getField('index'));
      } catch (error) {
        setDataViewError(error);
      }
    };

    initDataView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.search.searchSource]);

  const overview = !!ruleParams.criteria ? (
    <EuiFlexGroup direction="column" data-test-subj="thresholdAlertOverviewSection">
      {ruleParams.criteria.map((criterion, index) => (
        <EuiFlexItem key={`criterion-${index}`}>
          <EuiPanel hasBorder hasShadow={false}>
            <EuiTitle size="xs">
              <h4>{criterion.label || 'CUSTOM'} </h4>
            </EuiTitle>
            <EuiText size="s" color="subdued">
              <FormattedMessage
                id="xpack.observability.customThreshold.rule.alertDetailsAppSection.criterion.subtitle"
                defaultMessage="Last {lookback} {timeLabel}"
                values={{
                  lookback: criterion.timeSize,
                  timeLabel: TIME_LABELS[criterion.timeUnit as keyof typeof TIME_LABELS],
                }}
              />
            </EuiText>
            <EuiSpacer size="s" />
            <EuiFlexGroup>
              <EuiFlexItem style={{ minHeight: 150, minWidth: 160 }} grow={1}>
                <Threshold
                  chartProps={chartProps}
                  id={`threshold-${index}`}
                  threshold={criterion.threshold}
                  value={alert.fields[ALERT_EVALUATION_VALUES]![index]}
                  valueFormatter={(d) =>
                    metricValueFormatter(
                      d,
                      criterion.metrics[0] ? criterion.metrics[0].name : undefined
                    )
                  }
                  title={i18n.translate(
                    'xpack.observability.customThreshold.rule.alertDetailsAppSection.thresholdTitle',
                    {
                      defaultMessage: 'Threshold breached',
                    }
                  )}
                  comparator={criterion.comparator}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={5}>
                <ExpressionChart
                  annotations={annotations}
                  chartType={MetricsExplorerChartType.line}
                  derivedIndexPattern={derivedIndexPattern}
                  expression={criterion}
                  filterQuery={(ruleParams.searchConfiguration?.query as Query)?.query as string}
                  groupBy={ruleParams.groupBy}
                  hideTitle
                  timeRange={timeRange}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPanel>
        </EuiFlexItem>
      ))}
      {hasLogRateAnalysisLicense && (
        <LogRateAnalysis alert={alert} dataView={dataView} rule={rule} services={services} />
      )}
    </EuiFlexGroup>
  ) : null;

  return overview;
}
