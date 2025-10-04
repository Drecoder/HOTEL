import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
  // THIS IS THE MINIMUM REQUIREMENT
  @Query(() => Boolean)
  healthCheck(): boolean {
    return true;
  }
}