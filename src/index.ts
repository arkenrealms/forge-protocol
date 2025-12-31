import util from '@arken/node/util';
import { initTRPC } from '@trpc/server';
import { serialize, deserialize } from '@arken/node/util/rpc';
import type { Application, ApplicationModelType, ApplicationServiceType } from '@arken/node/types';
import { z } from 'zod';
import { createRouter as createCoreRouter } from './modules/core/core.router';
import type * as Arken from '@arken/node/types';
import * as dotenv from 'dotenv';

export const t = initTRPC.context<{}>().create();
export const router = t.router;
export const procedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

export const createRouter = (service: any) =>
  router({
    core: createCoreRouter(t),
  });

export type Router = ReturnType<typeof createRouter>;

dotenv.config();

export default class Server implements Application {
  router: Router;
  service: ApplicationServiceType = {};
  model: ApplicationModelType = {};

  server: any;
  http: any;
  https: any;
  isHttps: boolean;
  cache: any;
  db: any;
  services: any;
  applications: any;
  application: any;
  filters: Record<string, any> = { applicationId: null };
}
