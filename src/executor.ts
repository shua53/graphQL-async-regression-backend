import crypto from 'crypto';
import { JobStore, ModelStore } from './store.js';
import type { StartRegressionInput, Job, Model } from './types.js';

const RUN_SECONDS = Number(process.env.RUN_SECONDS ?? '60');

export async function enqueueRegression(input: StartRegressionInput): Promise<Job> {
    const job: Job = {
        id: crypto.randomUUID(),
        status: 'QUEUED',
        submittedAt: new Date().toISOString(),
        progress: 0
    };
    JobStore.create(job);

    setImmediate(() => runJob(job.id, input).catch(err => {
        JobStore.update(job.id, { status: 'FAILED', error: String(err), finishedAt: new Date().toISOString() });
    }));
    return job;
}

async function runJob(jobId: string, input: StartRegressionInput) {
    JobStore.update(jobId, { status: 'RUNNING', startedAt: new Date().toISOString(), progress: 0.01 });

    const steps = 10;
    const stepMs = Math.max(1, Math.floor((RUN_SECONDS * 1000) / steps));

    for (let i = 1; i <= steps; i++) {
        await sleep(stepMs);
        JobStore.update(jobId, { progress: i / steps });
    }

    const model: Model = {
        id: crypto.randomUUID(),
        kind: input.kind,
        alpha: input.kind === 'LINEAR' ? undefined : input.alpha ?? 1.0,
        fittedAt: new Date().toISOString()
    };
    ModelStore.create(model);


    JobStore.update(jobId, { status: 'COMPLETED', finishedAt: new Date().toISOString(), modelId: model.id, progress: 1 });
}

// Simulate Python script
function sleep(ms: number) { return new Promise(res => setTimeout(res, ms)); }