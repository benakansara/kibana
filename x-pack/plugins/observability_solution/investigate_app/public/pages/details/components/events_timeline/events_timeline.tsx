/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React, { useMemo, useRef } from 'react';
import moment from 'moment';

import { Chart, Axis, AreaSeries, Position, ScaleType, Settings } from '@elastic/charts';
import { useActiveCursor } from '@kbn/charts-plugin/public';
import { EuiSkeletonText } from '@elastic/eui';
import { getBrushData } from '@kbn/observability-utils-browser/chart/utils';
import { Group } from '@kbn/observability-alerting-rule-utils';
import { ALERT_GROUP } from '@kbn/rule-data-utils';
import { SERVICE_NAME } from '@kbn/observability-shared-plugin/common';
import { v4 } from 'uuid';
import { EventResponse } from '@kbn/investigation-shared';
import { AnnotationEvent } from './annotation_event';
import { TIME_LINE_THEME } from './timeline_theme';
import { useFetchEvents } from '../../../../hooks/use_fetch_events';
import { useInvestigation } from '../../contexts/investigation_context';
import { useKibana } from '../../../../hooks/use_kibana';
import { AlertEvent } from './alert_event';
import { LLMEvent } from './llm_event';

export const EventsTimeLine = () => {
  const { dependencies } = useKibana();

  const baseTheme = dependencies.start.charts.theme.useChartsBaseTheme();

  const { globalParams, updateInvestigationParams } = useInvestigation();
  const { alert, investigation } = useInvestigation();

  const filter = useMemo(() => {
    const group = (alert?.[ALERT_GROUP] as unknown as Group[])?.find(
      ({ field }) => field === SERVICE_NAME
    );
    return group ? `{"${SERVICE_NAME}":"${alert?.[SERVICE_NAME]}"}` : '';
  }, [alert]);

  const { data: events, isLoading } = useFetchEvents({
    rangeFrom: globalParams.timeRange.from,
    rangeTo: globalParams.timeRange.to,
    filter,
  });

  const chartRef = useRef(null);
  const handleCursorUpdate = useActiveCursor(dependencies.start.charts.activeCursor, chartRef, {
    isDateHistogram: true,
  });

  const data = useMemo(() => {
    const points = [
      { x: moment(globalParams.timeRange.from).valueOf(), y: 0 },
      { x: moment(globalParams.timeRange.to).valueOf(), y: 0 },
    ];

    // adding 100 fake points to the chart so the chart shows cursor on hover
    for (let i = 0; i < 100; i++) {
      const diff =
        moment(globalParams.timeRange.to).valueOf() - moment(globalParams.timeRange.from).valueOf();
      points.push({ x: moment(globalParams.timeRange.from).valueOf() + (diff / 100) * i, y: 0 });
    }
    return points;
  }, [globalParams.timeRange.from, globalParams.timeRange.to]);

  if (isLoading) {
    return <EuiSkeletonText />;
  }

  const alertEvents = events?.filter((evt) => evt.eventType === 'alert');
  const annotations = events?.filter((evt) => evt.eventType === 'annotation');

  let rcaAnalysisTimelineEvents: EventResponse[] = [];
  const rcaAnalysisEvents = investigation?.automatedRcaAnalysis;
  if (rcaAnalysisEvents && rcaAnalysisEvents.length > 0) {
    const rcaResponseEvent = rcaAnalysisEvents.find(
      (event) => 'response' in event && 'report' in event.response && 'timeline' in event.response
    );
    if (rcaResponseEvent) {
      const timelineEvents = rcaResponseEvent.response.timeline?.events;

      if (timelineEvents) {
        rcaAnalysisTimelineEvents = timelineEvents.map((e: any) => ({
          ...e,
          id: v4(),
          title: e.description,
          timestamp: e['@timestamp'],
          eventType: 'LLM',
        }));
      }
    }
  }

  return (
    <>
      <Chart size={['100%', 100]} ref={chartRef}>
        <Settings
          xDomain={{
            min: moment(globalParams.timeRange.from).valueOf(),
            max: moment(globalParams.timeRange.to).valueOf(),
          }}
          theme={TIME_LINE_THEME}
          baseTheme={baseTheme}
          onPointerUpdate={handleCursorUpdate}
          externalPointerEvents={{
            tooltip: { visible: true },
          }}
          onBrushEnd={(brush) => {
            const { from, to } = getBrushData(brush);
            updateInvestigationParams({
              timeRange: { from, to },
            });
          }}
        />
        <Axis id="y" position={Position.Left} hide />
        <Axis
          id="x"
          position={Position.Bottom}
          tickFormat={(d) => moment(d).format('LTS')}
          style={{
            tickLine: {
              visible: true,
              strokeWidth: 1,
              stroke: '#98A2B3',
            },
          }}
        />

        {alertEvents?.map((event) => (
          <AlertEvent key={event.id} event={event} />
        ))}

        {annotations?.map((annotation) => (
          <AnnotationEvent key={annotation.id} event={annotation} />
        ))}

        {rcaAnalysisTimelineEvents?.map((rcaAnalysisTimelineEvent) => (
          <LLMEvent key={rcaAnalysisTimelineEvent.id} event={rcaAnalysisTimelineEvent} />
        ))}

        <AreaSeries
          id="Time"
          xScaleType={ScaleType.Time}
          xAccessor="x"
          yAccessors={['y']}
          data={data}
          filterSeriesInTooltip={() => false}
        />
      </Chart>
    </>
  );
};
