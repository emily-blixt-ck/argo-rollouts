import * as React from 'react';
import {Modal, Tabs} from 'antd';
import {RolloutAnalysisRunInfo} from '../../../models/rollout/generated';

import MetricLabel from './metric-label/metric-label';
import {AnalysisPanel, MetricPanel} from './panels';
import {analysisEndTime, analysisStartTime, metricStatusLabel, metricSubstatus, transformMetrics} from './transforms';
import {AnalysisStatus} from './types';

interface AnalysisModalProps {
    analysis: RolloutAnalysisRunInfo;
    onClose: () => void;
    open: boolean;
}

export const AnalysisModal = ({analysis, onClose, open}: AnalysisModalProps) => {
    const analysisResults = analysis.specAndStatus?.status;

    const analysisStart = analysisStartTime(analysis.objectMeta?.creationTimestamp);
    const analysisEnd = analysisEndTime(analysisResults?.metricResults ?? []);

    const analysisSubstatus = metricSubstatus(
        (analysisResults?.phase ?? AnalysisStatus.Unknown) as AnalysisStatus,
        analysisResults?.runSummary.failed ?? 0,
        analysisResults?.runSummary.error ?? 0,
        analysisResults?.runSummary.inconclusive ?? 0
    );
    const transformedMetrics = transformMetrics(analysis.specAndStatus);

    const tabItems = [
        {
            label: <MetricLabel label='Summary' status={analysis.status as AnalysisStatus} substatus={analysisSubstatus} />,
            key: 'analysis-summary',
            children: (
                <AnalysisPanel
                    title={metricStatusLabel((analysis.status ?? AnalysisStatus.Unknown) as AnalysisStatus, analysis.failed ?? 0, analysis.error ?? 0, analysis.inconclusive ?? 0)}
                    status={(analysisResults.phase ?? AnalysisStatus.Unknown) as AnalysisStatus}
                    substatus={analysisSubstatus}
                    image='image'
                    message={analysisResults.message}
                    startTime={analysisStart}
                    endTime={analysisEnd}
                />
            ),
        },
        ...Object.values(transformedMetrics)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((metric) => ({
                label: <MetricLabel label={metric.name} status={(metric.status.phase ?? AnalysisStatus.Unknown) as AnalysisStatus} substatus={metric.status.substatus} />,
                key: metric.name,
                children: (
                    <MetricPanel
                        title={metric.name}
                        status={(metric.status.phase ?? AnalysisStatus.Unknown) as AnalysisStatus}
                        substatus={metric.status.substatus}
                        metricSpec={metric.spec}
                        metricResults={metric.status}
                    />
                ),
            })),
    ];

    return (
        <Modal centered open={open} title='Analysis' onCancel={onClose} width={866} footer={null}>
            <Tabs tabPosition='left' size='small' items={tabItems} />
        </Modal>
    );
};
