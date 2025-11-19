import jwt from 'jsonwebtoken';
import { rbacService } from '../services/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export function setupAuthRoutes(app, features, logger) {
  app.post('/auth/login', (req, res) => {
    if (!features.useMockAuth) {
      return res.status(501).json({ error: 'Real auth not implemented' });
    }
    
    const { email, password } = req.body || {};
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const role = rbacService.getRoleFromEmail(email);
    const token = jwt.sign({ email, role }, JWT_SECRET, { expiresIn: '24h' });
    
    logger.info({ msg: 'login', role, email });
    
    return res.json({ token, role, email });
  });
}
