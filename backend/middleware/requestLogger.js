export function requestLogger(logger) {
  return (req, res, next) => {
    const redactedAuth = req.headers.authorization ? '[REDACTED]' : undefined;
    
    logger.info({
      msg: 'request',
      method: req.method,
      url: req.originalUrl,
      auth: redactedAuth,
      timestamp: new Date().toISOString()
    });
    
    next();
  };
}

export function responseTimer(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
}
