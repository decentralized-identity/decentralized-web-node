import { ServerInstance } from './ServerInstance';
export interface OperationRequest {
  server: ServerInstance;
  method?: string;
  path?: string;
  params?: any;
  query?: any;
  headers?: any;
  body?: any;
}
