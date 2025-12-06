import { mockDataService } from '../services/index.js';

export function setupSearchRoutes(app, features, logger) {
  app.get('/api/search-employee/:query', (req, res) => {
    const { query } = req.params;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Query too short' });
    }
    
    const results = mockDataService.searchEmployees(query);
    logger.info({ msg: 'search_employee', query });
    
    res.json(results);
  });
  
  app.get('/api/all-users', (req, res) => {
    const role = (req.user && req.user.role) || 'employee';
    
    if (role !== 'ops') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const allUsers = mockDataService.getAllUsers();
    const paginated = allUsers.slice(offset, offset + limit);
    
    res.json({
      total: allUsers.length,
      limit,
      offset,
      users: paginated,
    });
  });
}
