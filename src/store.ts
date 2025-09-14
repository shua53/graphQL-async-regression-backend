import type { Job, Model } from './types.js';


const jobs = new Map<string, Job>();
const models = new Map<string, Model>();


export const JobStore = {
    create(job: Job) { jobs.set(job.id, job); return job; },
    get(id: string) { return jobs.get(id); },
    update(id: string, patch: Partial<Job>) {
        const current = jobs.get(id);
        if (!current) return undefined;
        const next = { ...current, ...patch } as Job;
        jobs.set(id, next);
        return next;
    }
};


export const ModelStore = {
    create(model: Model) { models.set(model.id, model); return model; },
    get(id: string) { return models.get(id); }
};