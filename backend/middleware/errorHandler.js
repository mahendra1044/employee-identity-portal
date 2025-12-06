export function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  if (err.code === 'INVALID_SYSTEM') {
    return res.status(404).json({ error: err.message || 'System not found' });
  }
  
  if (err.code === 'FORBIDDEN') {
    return res.status(403).json({ error: err.message || 'Forbidden' });
  }
  
  if (err.code === 'VALIDATION_ERROR') {
    return res.status(400).json({ error: err.message });
  }
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
