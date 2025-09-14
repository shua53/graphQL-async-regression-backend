import { makeExecutableSchema } from '@graphql-tools/schema';
import type { IResolvers } from '@graphql-tools/utils';

export const typeDefs = `

enum RegressionKind {
 LINEAR 
 LASSO 
 RIDGE 
 }
 
enum JobStatus {
 QUEUED 
 RUNNING 
 COMPLETED 
 FAILED 
 }

type Job {
id: ID!
status: JobStatus!
submittedAt: String!
startedAt: String
finishedAt: String
progress: Float
modelId: ID
error: String
}

input DataPoint {
 x: Float!
 y: Float! 
 }

input StartRegressionInput {
data: [DataPoint!]!
kind: RegressionKind!
alpha: Float
}

type Model {
id: ID!
kind: RegressionKind!
alpha: Float
fittedAt: String!
predict(x: Float!): Float!
}

type Query {
job(id: ID!): Job
model(id: ID!): Model
}

type Mutation {
startRegression(input: StartRegressionInput!): Job!
}
`;

export const makeSchema = (resolvers: IResolvers) =>
    makeExecutableSchema({ typeDefs, resolvers });