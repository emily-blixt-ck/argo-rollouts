import * as React from 'react';

import {Space, Typography} from 'antd';

import {AnalysisStatus} from '../types';
import StatusIndicator from '../status-indicator/status-indicator';

import classNames from 'classnames';

const {Text} = Typography;

interface LegendItemProps {
    label: string;
    status: AnalysisStatus;
}

const LegendItem = ({label, status}: LegendItemProps) => (
    <Space size={4}>
        <StatusIndicator size='small' status={status} />
        <Text>{label}</Text>
    </Space>
);

interface LegendProps {
    className?: string[] | string;
    errors: number;
    failures: number;
    inconclusives: number;
    successes: number;
}

const Legend = ({className, errors, failures, inconclusives, successes}: LegendProps) => (
    <Space className={classNames(className)} size='small'>
        {successes > 0 && <LegendItem status={AnalysisStatus.Successful} label={`${successes} Success${successes !== 1 ? `es` : ''}`} />}
        {failures > 0 && <LegendItem status={AnalysisStatus.Failed} label={`${failures} Failure${failures !== 1 ? `s` : ''}`} />}
        {errors > 0 && <LegendItem status={AnalysisStatus.Error} label={`${errors} Error${errors !== 1 ? `s` : ''}`} />}
        {inconclusives > 0 && <LegendItem status={AnalysisStatus.Inconclusive} label={`${inconclusives} Inconclusive`} />}
    </Space>
);

export default Legend;
export {LegendItem};
