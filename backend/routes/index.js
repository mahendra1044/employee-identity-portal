import { setupAuthRoutes } from './auth.js';
import { setupSearchRoutes } from './search.js';
import { setupSystemRoutes } from './systems.js';
import { setupSnowRoutes } from './snow.js';
import samlRouter from './saml.js';

export function setupAllRoutes(app, features, logger) {
  setupAuthRoutes(app, features, logger);
  setupSearchRoutes(app, features, logger);
  setupSystemRoutes(app, features, logger);
  setupSnowRoutes(app, features, logger);
  
  // SAML SSO routes (only if MFA auth mode is enabled)
  if (features.authMode === 'USE_MFA_AUTH') {
    app.use('/api/saml', samlRouter);
    logger.info('[Routes] SAML SSO routes enabled');
  }
}
