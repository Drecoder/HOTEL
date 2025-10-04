import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway';
import { NestFactory } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { Module } from '@nestjs/common';

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }: { request: any; context: any }) {
    // Forward JWT to subgraphs
    if (context.req?.headers?.authorization) {
      request.http.headers.set('authorization', context.req.headers.authorization);
    }
  }
}

const gateway = new ApolloGateway({
  serviceList: [
    { name: 'users', url: 'http://localhost:3333/graphql' },
    { name: 'hotel', url: 'http://localhost:8080/graphql' },
  ],
  buildService({ url }) {
    return new AuthenticatedDataSource();
  },
});

@Module({
  imports: [
    GraphQLModule.forRootAsync({
      useFactory: async () => {
        return {
          autoSchemaFile: true,
          context: ({ req }: { req: any }) => ({ req }),
          gateway,
          // Optionally, you can add other GqlModuleOptions properties here
        };
      },
    }),
  ],
})
export class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3332); // gateway port
}
bootstrap();
