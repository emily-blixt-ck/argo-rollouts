import {AnalysisStatus, FunctionalStatus} from './types';

export const ANALYSIS_STATUS_THEME_MAP: {[key in AnalysisStatus]: string} = {
    Successful: FunctionalStatus.SUCCESS,
    Error: FunctionalStatus.WARNING,
    Failed: FunctionalStatus.ERROR,
    Running: FunctionalStatus.IN_PROGRESS,
    Pending: FunctionalStatus.INACTIVE,
    Inconclusive: FunctionalStatus.WARNING,
    Unknown: FunctionalStatus.INACTIVE, // added by frontend
};
