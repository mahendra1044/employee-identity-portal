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
  
  // Mock IDP routes (for development/testing only)
  // ⚠️ This entire mock-idp folder can be deleted when using a real IDP
  if (features.mockIdp?.enabled && process.env.NODE_ENV !== 'production') {
    import('../mock-idp/index.js')
      .then(({ setupMockIdp }) => {
        setupMockIdp(app);
        logger.info('[Routes] Mock IDP routes enabled at /api/mock-idp/*');
      })
      .catch(err => {
        logger.warn('[Routes] Mock IDP module not found or failed to load. This is OK if you removed it.');
        logger.debug('[Routes] Mock IDP error:', err.message);
      });
  }
}
