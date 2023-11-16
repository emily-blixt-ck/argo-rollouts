import * as React from 'react';
import * as moment from 'moment';
import {CartesianGrid, DotProps, Label, Line, LineChart, ReferenceLine, ResponsiveContainer, ReferenceArea, Tooltip, TooltipProps, XAxis, YAxis} from 'recharts';
import {NameType, ValueType} from 'recharts/types/component/DefaultTooltipContent';
import {Typography} from 'antd';

import {AnalysisStatus, FunctionalStatus, TransformedMeasurement} from '../types';
import {ANALYSIS_STATUS_THEME_MAP} from '../constants';
import {isValidDate} from '../transforms';

import StatusIndicator from '../status-indicator/status-indicator';

import classNames from 'classnames/bind';
import './metric-chart.scss';

const {Text} = Typography;
const cx = classNames;

const defaultValueFormatter = (value: number | string | null) => (value === null ? '' : value.toString());

const timeTickFormatter = (axisData: string) => (isValidDate(axisData) ? moment(axisData).format('LT') : '');

type MeasurementDotProps = DotProps & {
    payload: {
        phase: AnalysisStatus;
        startedAt: string;
        value: string | null;
    };
};

const MeasurementDot = ({cx, cy, height, payload}: MeasurementDotProps) => (
    <circle r={4} cx={cx} cy={cy} className={`dot-${ANALYSIS_STATUS_THEME_MAP[payload.phase as AnalysisStatus] as FunctionalStatus}`} />
);

type TooltipContentProps = TooltipProps<ValueType, NameType> & {
    conditionKeys: string[];
    valueFormatter: (value: number | string | null) => string;
};

const TooltipContent = ({active, conditionKeys, payload, valueFormatter}: TooltipContentProps) => {
    if (!active || payload?.length === 0 || !payload?.[0].payload) {
        return null;
    }

    const data = payload[0].payload;
    let label;
    if (data.phase === AnalysisStatus.Error) {
        label = data.message ?? 'Measurement error';
    } else if (conditionKeys.length > 0) {
        label = conditionKeys.map((cKey) => `${valueFormatter(data.chartValue[cKey])} ${conditionKeys.length > 1 ? ` (${cKey})` : ''}`).join(' , ');
    } else {
        label = valueFormatter(data.chartValue);
    }

    return (
        <div className={cx('tooltip')}>
            <Text className={cx('tooltip-timestamp')} type='secondary' style={{fontSize: 12}}>
                {moment(data.startedAt).format('LTS')}
            </Text>
            <div className={cx('tooltip-status')}>
                <StatusIndicator size='small' status={data.phase} />
                <Text>{label}</Text>
            </div>
        </div>
    );
};

interface MetricChartProps {
    className?: string[] | string;
    conditionKeys: string[];
    data: TransformedMeasurement[];
    failThresholds: number[] | null;
    max: number | null;
    min: number | null;
    successThresholds: number[] | null;
    valueFormatter?: (value: number | string | null) => string;
    yAxisFormatter?: (value: any, index: number) => string;
    yAxisLabel: string;
}

const MetricChart = ({
    className,
    conditionKeys,
    data,
    failThresholds,
    max,
    min,
    successThresholds,
    valueFormatter = defaultValueFormatter,
    yAxisFormatter = defaultValueFormatter,
    yAxisLabel,
}: MetricChartProps) => {
    // show ticks at boundaries of analysis
    const timeTicks: string[] = [...([data[0]?.startedAt] ?? []), ...(data.length > 1 ? [data[data.length - 1]?.startedAt] ?? [] : [])];

    return (
        <ResponsiveContainer className={cx(className)} height={254} width='100%'>
            <LineChart
                className={cx('metric-chart')}
                data={data}
                margin={{
                    top: 0,
                    right: 0,
                    left: 0,
                    bottom: 0,
                }}>
                <CartesianGrid strokeDasharray='4 4' />
                <XAxis className={cx('chart-axis')} dataKey='startedAt' ticks={timeTicks} tickFormatter={timeTickFormatter} />
                <YAxis className={cx('chart-axis')} width={60} domain={[min ?? 0, max ?? 'auto']} tickFormatter={yAxisFormatter}>
                    <Label className={cx('chart-label')} angle={-90} dx={-20} position='inside' value={yAxisLabel} />
                </YAxis>
                <Tooltip content={<TooltipContent conditionKeys={conditionKeys} valueFormatter={valueFormatter} />} filterNull={false} />
                {failThresholds !== null && (
                    <>
                        {failThresholds.map((threshold, idx) => (
                            <ReferenceLine key={`fail-line-${idx}`} className={cx('reference-line', 'is-ERROR')} y={threshold} />
                        ))}
                    </>
                )}
                {successThresholds !== null && (
                    <>
                        {successThresholds.map((threshold, idx) => (
                            <ReferenceLine key={`success-line-${idx}`} className={cx('reference-line', 'is-SUCCESS')} y={threshold} />
                        ))}
                    </>
                )}
                {conditionKeys.length === 0 ? (
                    <Line
                        className={cx('chart-line')}
                        dataKey={conditionKeys.length === 0 ? 'chartValue' : `chartValue.${conditionKeys[0]}`}
                        isAnimationActive={false}
                        activeDot={false}
                        dot={(props: any) => <MeasurementDot payload={props.payload} {...props} />}
                    />
                ) : (
                    <>
                        {conditionKeys.map((cKey) => (
                            <Line
                                key={cKey}
                                className={cx('chart-line')}
                                dataKey={`chartValue.${cKey}`}
                                isAnimationActive={false}
                                activeDot={false}
                                dot={(props: any) => <MeasurementDot payload={props.payload} {...props} />}
                            />
                        ))}
                    </>
                )}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default MetricChart;
