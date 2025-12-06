import { mockDataService } from '../services/index.js';

export function setupSnowRoutes(app, features, logger) {
  app.get('/api/snow/incidents', (req, res) => {
    if (!features.useMocks) return res.status(501).json({ error: 'Real ServiceNow API not implemented' });

    const requester = req.user || {};
    const role = requester.role || 'employee';
    const selfEmail = String(requester.email || '').toLowerCase();
    const queryEmail = String(req.query.email || '').toLowerCase();

    if (role !== 'ops' && queryEmail && queryEmail !== selfEmail) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const targetEmail = (role === 'ops' ? (queryEmail || selfEmail) : selfEmail) || '';
    if (!targetEmail) return res.status(400).json({ error: 'Target email required' });

    const incidents = mockDataService.getSnowIncidents(targetEmail) || [];
    if (!incidents || incidents.length === 0) {
      // Fallback: synthesize demo incidents if none present
      const now = new Date();
      const iso = (d) => new Date(d).toISOString();
      const items = [
        {
          number: 'INC-DEMO-' + Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0'),
          short_description: 'Demo: Access issue with corporate app',
          state: 'open',
          priority: '3 - Moderate',
          updatedAt: iso(now),
          assigned_to: targetEmail,
        },
      ];
      return res.json({ email: targetEmail, total: items.length, items });
    }

    const counts = incidents.reduce(
      (acc, it) => {
        const st = String(it.state || '').toLowerCase();
        if (st === 'open') acc.open += 1;
        else if (st === 'in_progress' || st === 'in progress') acc.in_progress += 1;
        else if (st === 'closed' || st === 'resolved') acc.closed += 1;
        acc.total += 1;
        return acc;
      },
      { total: 0, open: 0, in_progress: 0, closed: 0 }
    );

    return res.json({ email: targetEmail, ...counts, items: incidents });
  });

  app.post('/api/submit-snow-ticket', (req, res) => {
    // Simulate ticket creation
    const { email, short_description } = req.body || {};
    if (!email || !short_description) return res.status(400).json({ error: 'email and short_description required' });

    const now = new Date();
    const incidentNumber = `INC-` + Math.floor(Math.random() * 1_000_000);
    logger.info({ msg: 'snow_submit', email, incidentNumber, description: short_description });

    return res.json({ success: true, number: incidentNumber, createdAt: now.toISOString() });
  });
}
