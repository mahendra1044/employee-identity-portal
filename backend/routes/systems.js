import { mockDataService, rbacService } from '../services/index.js';

const SYSTEMS = ['ping-directory', 'ping-federate', 'cyberark', 'saviynt', 'azure-ad', 'ping-mfa'];

export function setupSystemRoutes(app, features, logger) {
  app.get('/api/own-:system', (req, res) => {
    const system = req.params.system;
    
    if (!SYSTEMS.includes(system)) {
      return res.status(404).json({ error: 'System not found' });
    }
    
    if (!rbacService.isSystemEnabled(system, features)) {
      return res.status(404).json({ error: 'Feature not enabled' });
    }
    
    const role = (req.user && req.user.role) || 'employee';
    if (!rbacService.hasPermission(role, system, 'own')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const data = mockDataService.getSystemData(system);
    logger.info({ msg: 'system_own', system, role });
    
    res.json({ data });
  });
  
  app.get('/api/own-:system/details/:userId', (req, res) => {
    const { system, userId } = req.params;
    
    if (!SYSTEMS.includes(system)) {
      return res.status(404).json({ error: 'System not found' });
    }
    
    const role = (req.user && req.user.role) || 'employee';
    if (!rbacService.hasPermission(role, system, 'own')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const data = mockDataService.getSystemDetails(system, userId);
    
    if (!data) {
      return res.status(404).json({ error: 'No data found' });
    }
    
    logger.info({ msg: 'system_details', system, userId });
    res.json({ data });
  });
}
