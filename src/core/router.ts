// ============================================
// Hash-based SPA Router
// ============================================

type RouteHandler = (params: Record<string, string>) => void | Promise<void>;
type RouteGuard = () => boolean | Promise<boolean>;

interface Route {
  path: string;
  pattern: RegExp;
  handler: RouteHandler;
  guard?: RouteGuard;
}

interface RouterOptions {
  basePath?: string;
  onRouteChange?: (path: string) => void;
  onNotFound?: (path: string) => void;
}

export class Router {
  private routes: Route[] = [];
  private currentRoute: Route | null = null;
  private options: RouterOptions;

  constructor(options: RouterOptions = {}) {
    this.options = options;
    this.handleHashChange = this.handleHashChange.bind(this);
  }

  start(): void {
    window.addEventListener('hashchange', this.handleHashChange);
    window.addEventListener('popstate', this.handleHashChange);
    this.handleHashChange();
  }

  stop(): void {
    window.removeEventListener('hashchange', this.handleHashChange);
    window.removeEventListener('popstate', this.handleHashChange);
  }

  on(path: string, handler: RouteHandler, guard?: RouteGuard): Router {
    const paramNames: string[] = [];
    const regexPath = path.replace(/:([^/]+)/g, (_match, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });

    const pattern = new RegExp(`^${regexPath}$`);

    this.routes.push({ path, pattern, handler, guard });

    return this;
  }

  navigate(path: string): void {
    const hash = path.startsWith('#') ? path : `#${path}`;
    window.location.hash = hash;
  }

  getCurrentPath(): string {
    return window.location.hash.slice(1) || '/';
  }

  private async handleHashChange(): Promise<void> {
    const path = this.getCurrentPath();

    this.options.onRouteChange?.(path);

    for (const route of this.routes) {
      const match = path.match(route.pattern);
      if (match) {
        // Check guard
        if (route.guard) {
          const allowed = await route.guard();
          if (!allowed) return;
        }

        this.currentRoute = route;

        // Extract params
        const paramNames: string[] = [];
        route.path.replace(/:([^/]+)/g, (_match, name) => {
          paramNames.push(name);
          return '';
        });

        const params: Record<string, string> = {};
        paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });

        await route.handler(params);
        return;
      }
    }

    // No route matched
    this.options.onNotFound?.(path);
  }
}

export function createRouter(options?: RouterOptions): Router {
  return new Router(options);
}

// Page transition helper
export function transitionTo(callback: () => void): void {
  const app = document.getElementById('app');
  if (!app) {
    callback();
    return;
  }

  app.classList.add('animate-page-exit');

  setTimeout(() => {
    app.classList.remove('animate-page-exit');
    callback();
    app.classList.add('animate-page-enter');

    setTimeout(() => {
      app.classList.remove('animate-page-enter');
    }, 400);
  }, 200);
}