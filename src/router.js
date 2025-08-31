export class Router {
  constructor({ routes, targetElement }) {
    this.routes = routes;
    this.targetElement = targetElement;
    this.currentCleanup = null;
    this.onRoute = this.onRoute.bind(this);
    window.addEventListener('hashchange', this.onRoute);
  }

  init() {
    if (!location.hash) location.hash = '#/';
    this.onRoute();
  }

  onRoute() {
    const path = location.hash.slice(1) || '/';
    const handler = this.routes[path] || this.routes['/404'];
    if (!handler) return;

    if (this.currentCleanup) {
      try { this.currentCleanup(); } catch {}
      this.currentCleanup = null;
    }

    const result = handler(this.targetElement, this);
    if (typeof result === 'function') this.currentCleanup = result;

    window.scrollTo(0, 0);
  }

  navigate(path) {
    const hash = `#${path}`;
    if (location.hash !== hash) location.hash = hash; else this.onRoute();
  }

  destroy() {
    window.removeEventListener('hashchange', this.onRoute);
    if (this.currentCleanup) this.currentCleanup();
  }
}