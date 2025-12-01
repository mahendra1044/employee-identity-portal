import jwt from 'jsonwebtoken';
import { rbacService } from '../services/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export function setupAuthRoutes(app, features, logger) {
  app.post('/auth/login', (req, res) => {
    if (!features.useMockAuth) {
      return res.status(501).json({ error: 'Real auth not implemented' });
    }
    
    // Accept userId field for login
    const { userId: userIdInput, password } = req.body || {};
    
    if (!userIdInput || !password) {
      return res.status(400).json({ error: 'User ID and password required' });
    }
    
    // Get RBAC data for user (accepts "u1001")
    const rbacData = rbacService.getRbacLoginResponse(userIdInput);
    
    const token = jwt.sign({ 
      userId: rbacData.userId,
      role: rbacData.legacyRole,
      activeRoleId: rbacData.activeRole.id 
    }, JWT_SECRET, { expiresIn: '24h' });
    
    logger.info({ 
      msg: 'login', 
      userId: rbacData.userId,
      role: rbacData.legacyRole, 
      activeRole: rbacData.activeRole.name,
      isMaster: rbacData.isMaster
    });
    
    return res.json({ 
      token, 
      role: rbacData.legacyRole,
      // RBAC fields
      userId: rbacData.userId || userIdInput,
      assignedRoles: rbacData.assignedRoles,
      availableRoles: rbacData.availableRoles,
      activeRole: rbacData.activeRole,
      isMaster: rbacData.isMaster,
    });
  });
}
