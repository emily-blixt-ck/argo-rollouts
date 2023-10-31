import * as React from 'react';

import {Radio, Typography} from 'antd';
import type {RadioChangeEvent} from 'antd';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChartLine, faTable} from '@fortawesome/free-solid-svg-icons';

import Header from '../header/header';
import CriteriaList from '../criteria-list/criteria-list';
import Legend from '../legend/legend';
import MetricChart from '../metric-chart/metric-chart';
import MetricTable from '../metric-table/metric-table';
import QueryBox from '../query-box/query-box';
import {AnalysisStatus, FunctionalStatus, TransformedMetricSpec, TransformedMetricStatus} from '../types';
import {isFiniteNumber} from '../transforms';

import classNames from 'classnames';
import './styles.scss';

const {Title} = Typography;
const cx = classNames;

interface MetricPanelProps {
    className?: string[] | string;
    metricSpec?: TransformedMetricSpec;
    metricResults: TransformedMetricStatus;
    status: AnalysisStatus;
    substatus?: FunctionalStatus.ERROR | FunctionalStatus.WARNING;
    title: string;
}

const MetricPanel = ({className, metricSpec, metricResults, status, substatus, title}: MetricPanelProps) => {
    const consecutiveErrorLimit = isFiniteNumber(metricSpec.consecutiveErrorLimit ?? null) ? metricSpec.consecutiveErrorLimit : 0;
    const failureLimit = isFiniteNumber(metricSpec.failureLimit ?? null) ? metricSpec.failureLimit : 0;
    const inconclusiveLimit = isFiniteNumber(metricSpec.inconclusiveLimit ?? null) ? metricSpec.inconclusiveLimit : 0;

    const canChartMetric = metricResults.chartable && metricResults.chartMax !== null;

    const [selectedView, setSelectedView] = React.useState(canChartMetric ? 'chart' : 'table');

    const onChangeView = ({target: {value}}: RadioChangeEvent) => {
        setSelectedView(value);
    };

    return (
        <div className={cx(className)}>
            <div className={cx('metric-header')}>
                <Header title={title} subtitle={metricResults.statusLabel} status={status} substatus={substatus} />
                {canChartMetric && (
                    <Radio.Group onChange={onChangeView} buttonStyle='outline' value={selectedView}>
                        <Radio.Button value='chart'>
                            <FontAwesomeIcon icon={faChartLine} />
                        </Radio.Button>
                        <Radio.Button value='table'>
                            <FontAwesomeIcon icon={faTable} />
                        </Radio.Button>
                    </Radio.Group>
                )}
            </div>
            <Legend
                className={cx('legend')}
                errors={metricResults.error ?? 0}
                failures={metricResults.failed ?? 0}
                inconclusives={metricResults.inconclusive ?? 0}
                successes={metricResults.successful ?? 0}
            />
            {selectedView === 'chart' && (
                <MetricChart
                    className={cx('metric-section', 'top-content')}
                    data={metricResults.transformedMeasurements}
                    max={metricResults.chartMax}
                    min={metricResults.chartMin}
                    failThresholds={metricSpec.failThresholds}
                    successThresholds={metricSpec.successThresholds}
                    yAxisLabel={metricResults.name}
                    conditionKeys={metricSpec.conditionKeys}
                />
            )}
            {selectedView === 'table' && (
                <MetricTable
                    className={cx('metric-section', 'top-content')}
                    data={metricResults.transformedMeasurements}
                    conditionKeys={metricSpec.conditionKeys}
                    failCondition={metricSpec.failConditionLabel}
                    successCondition={metricSpec.successConditionLabel}
                />
            )}
            <div className={cx('metric-section', 'medium-space')}>
                <Title className={cx('section-title')} level={5}>
                    Pass requirements
                </Title>
                <CriteriaList
                    analysisStatus={status}
                    maxConsecutiveErrors={consecutiveErrorLimit}
                    maxFailures={failureLimit}
                    maxInconclusives={inconclusiveLimit}
                    consecutiveErrors={metricResults.consecutiveError ?? 0}
                    failures={metricResults.failed ?? 0}
                    inconclusives={metricResults.inconclusive ?? 0}
                    showIcons={metricResults.measurements?.length > 0}
                />
            </div>
            {metricSpec?.query !== undefined && (
                <>
                    <div className={cx('query-header')}>
                        <Title className={cx('section-title')} level={5}>
                            Query
                        </Title>
                        {/* <QueryLink query={transformedDetails.query} profile={metric.profile} /> */}
                    </div>
                    <QueryBox className={cx('query-box')} query={metricSpec.query} />
                </>
            )}
        </div>
    );
};

export default MetricPanel;
