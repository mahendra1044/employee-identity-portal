import { setupAuthRoutes } from './auth.js';
import { setupSearchRoutes } from './search.js';
import { setupSystemRoutes } from './systems.js';
import { setupSnowRoutes } from './snow.js';

export function setupAllRoutes(app, features, logger) {
  setupAuthRoutes(app, features, logger);
  setupSearchRoutes(app, features, logger);
  setupSystemRoutes(app, features, logger);
  setupSnowRoutes(app, features, logger);
}
