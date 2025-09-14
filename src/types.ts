export type Resolvers = Record<string, any>;
export type RegressionKind = 'LINEAR' | 'LASSO' | 'RIDGE';
export type JobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface DataPoint { x: number; y: number }

export interface StartRegressionInput {
    data: DataPoint[];
    kind: RegressionKind;
    alpha?: number | null;
}


export interface Job {
    id: string;
    status: JobStatus;
    submittedAt: string;
    startedAt?: string;
    finishedAt?: string;
    progress?: number;
    modelId?: string;
    error?: string;
}


export interface Model {
    id: string;
    kind: RegressionKind;
    alpha?: number;
    fittedAt: string;
}