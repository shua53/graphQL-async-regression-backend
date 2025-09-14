import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { makeSchema } from './schema.js';
import { resolvers } from './resolvers.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());


async function main() {
    const schema = makeSchema(resolvers);
    const server = new ApolloServer({ schema });
    await server.start();


    // @ts-expect-error - express overload inference picks sub-app, but this is a RequestHandler
    app.use('/graphql', expressMiddleware(server));

    const port = Number(process.env.PORT ?? 4000);
    app.listen({ port }, () => {
        console.log(`GraphQL ready at http://localhost:${port}/graphql`);
    });
}

main().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});