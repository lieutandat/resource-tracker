export class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = '';
    
    window.addEventListener('popstate', () => {
      this.navigate(window.location.pathname, false);
    });
  }

  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path, pushState = true) {
    if (pushState) {
      window.history.pushState({}, '', path);
    }
    
    this.currentRoute = path;
    const handler = this.routes[path] || this.routes['/'];
    if (handler) handler();
  }

  start() {
    this.navigate(window.location.pathname, false);
  }
}