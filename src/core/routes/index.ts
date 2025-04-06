import express from 'express';
import { Router } from 'express';

export interface RouteDefinition {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete';
  handler: express.RequestHandler | express.RequestHandler[];
}

export class ApiRouter {
  private router: Router;
  private version: string;

  constructor(version: string) {
    this.router = Router();
    this.version = version;
  }

  addRoute(route: RouteDefinition) {
    const { path, method, handler } = route;
    this.router[method](path, handler);
  }

  getRouter() {
    return this.router;
  }

  getVersion() {
    return this.version;
  }
}

export class RouterRegistry {
  private static instance: RouterRegistry;
  private routers: Map<string, ApiRouter> = new Map();

  private constructor() {}

  static getInstance(): RouterRegistry {
    if (!RouterRegistry.instance) {
      RouterRegistry.instance = new RouterRegistry();
    }
    return RouterRegistry.instance;
  }

  registerRouter(version: string, router: ApiRouter) {
    this.routers.set(version, router);
  }

  getRouters(): Map<string, ApiRouter> {
    return this.routers;
  }
} 