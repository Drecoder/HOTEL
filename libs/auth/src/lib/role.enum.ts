/**
 * Defines the user roles for authorization purposes, corresponding to
 * the permissions defined in the GraphQL schema.
 */
export enum Role {
  GUEST = 'GUEST',
  FRONTDESK = 'FRONTDESK',
  OPERATIONS = 'OPERATIONS',
  PUBLIC = 'PUBLIC', // For publicly accessible queries like room search
}
