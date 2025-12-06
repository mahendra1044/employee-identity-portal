import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class MockDataService {
  constructor() {
    this.cache = {};
  }
  
  loadMock(filename) {
    if (this.cache[filename]) {
      return this.cache[filename];
    }
    
    try {
      const filepath = path.join(__dirname, '../mocks', filename);
      const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
      this.cache[filename] = data;
      return data;
    } catch (e) {
      console.error(`Failed to load mock file ${filename}:`, e);
      return null;
    }
  }
  
  getAllUsers() {
    return this.loadMock('all-users.json') || [];
  }
  
  getSystemData(system) {
    return this.loadMock(`${system}-initial.json`);
  }
  
  getSystemDetails(system, userId) {
    const data = this.loadMock(`${system}-details.json`);
    return data ? data[userId] : null;
  }
  
  searchEmployees(query) {
    const pd = this.loadMock('ping-directory-search.json') || [];
    const mfa = this.loadMock('ping-mfa-search.json') || [];
    
    const filter = (arr) =>
      (arr || []).filter((u) => {
        const hay = `${u.name || ''} ${u.email || ''} ${u.userId || ''}`.toLowerCase();
        return hay.includes(query.toLowerCase());
      });
    
    return {
      'ping-directory': filter(pd).map((u) => ({ name: u.name, email: u.email, userId: u.userId })),
      'ping-mfa': filter(mfa).map((u) => ({ userId: u.userId, status: u.status, lastEvent: u.lastEvent })),
    };
  }
  
  getSnowIncidents(email) {
    const incidents = this.loadMock('snow-incidents.json') || [];
    return incidents.filter((i) => i.assigned_to === email);
  }
}

export const mockDataService = new MockDataService();
