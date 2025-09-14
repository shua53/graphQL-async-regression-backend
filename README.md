# GraphQL Async Regression Backend
Schema-first GraphQL service that kicks off a 1-minute mock job to fit a model and lets clients poll status. 

## Project Structure

```text
.
├── package.json
├── tsconfig.json
└── src
    ├── index.ts
    ├── schema.ts
    ├── resolvers.ts
    ├── types.ts
    ├── store.ts
    └── executor.ts
```

### `src/index.ts`: server bootstrap
- Sets up Express + HTTP server.
- Builds schema and starts Apollo Server v4.
- Mounts `/graphql` (with CORS + JSON body parsing).
- Listens on `PORT` (default `4000`).

### `src/schema.ts`: GraphQL SDL
- Declares `Job`, `Model`, enums `RegressionKind`, `JobStatus`.
- Declares inputs `DataPoint`, `StartRegressionInput`.
- Operations: `startRegression`, `job`, `model`; `Model.predict(x)` field.
- Exports `makeSchema()` to combine SDL + resolvers.

### `src/resolvers.ts`: resolvers
- Validates input with Zod (`alpha` optional for LASSO/RIDGE, disallowed for LINEAR).
- `startRegression` enqueues a job; queries read from stores.
- `Model.predict(x)` returns `x + 1`.

### `src/types.ts`: TypeScript types
- Interfaces for `Job`, `Model`, input shapes, enums.
- Shared typing for executor/store/resolvers.

### `src/store.ts`: in-memory store
- Two `Map`s for `jobs` and `models`.
- Simple `create/get/update` helpers.

### `src/executor.ts`: async runner
- `enqueueRegression` creates a `QUEUED` job and kicks off work.
- `runJob` simulates ~`RUN_SECONDS` with progress updates, saves a `Model`, marks job `COMPLETED` (or `FAILED` on error).

## Sample GraphQL operations

**1) Enqueue a regression job**
```graphql
mutation Start {
  startRegression(input: {
    data: [{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 3 }],
    kind: LINEAR
  }) {
    id
    status
    submittedAt
    progress
  }
}
````

**2) Poll job status** 

```graphql
query Job($id: ID!) {
  job(id: $id) {
    id
    status
    progress
    modelId
    error
  }
}
```

**3) Fetch the model once ready**

```graphql
query Model($id: ID!) {
  model(id: $id) {
    id
    kind
    alpha
    fittedAt
  }
}
```

**4) Predict with the model** 

```graphql
query Predict($id: ID!) {
  model(id: $id) {
    id
    predict(x: 5)
  }
}
```

## Design Decisions

### Domain model
- **Job**: `{ id, status, progress, submittedAt, startedAt?, finishedAt?, modelId?, error? }`  
  Mirrors a real task runner and is perfect for polling.
- **Model**: `{ id, kind, alpha?, fittedAt }` with `predict(x: Float!): Float!`  
  Ke*eps prediction ergonomic and discoverable on the type.

### Async, job-based orchestration
- `startRegression` enqueues work and returns a `Job` immediately.
- Clients poll `job(id)` until `COMPLETED`, then fetch `model(id)` and call `Model.predict(x)`.
- Satisfies the 30s HTTP timeout constraint.

### Mock Python runner
- A Promise with progress ticks simulates 1 minute.
- Runs in the background (decoupled from the HTTP lifecycle).

### Storage
- **In-memory** Maps for jobs/models to keep the simplicity.

### Validation & errors
- `alpha` is optional for `LASSO`/`RIDGE`, and disallowed for `LINEAR`.
- Background failures set `status=FAILED` and populate `error` for the polling client.


## Future Work

### Persistence
Move state to Redis/Postgres; define TTL for completed jobs/models.

### Security
Input size limits; DoS safeguards.
