  import Log from '../models/log.model.js';
  import net from 'net';  // ✅ Use built-in Node.js module (no need for validator)
  import { randomBytes } from 'crypto';

  // Enhanced detection patterns
  const THREAT_SIGNATURES = {
    SQL_INJECTION: /(\b(SELECT|UNION|INSERT|DELETE|DROP|ALTER|CREATE|EXEC)\b)|(\/\*.*\*\/)|('|--|;|@@version)/gi,
    XSS: /(<script|alert\(|onerror=|onload=|eval\(|document\.cookie|javascript:)/gi,
    PATH_TRAVERSAL: /(\.\.\/|\.\.\\|etc\/passwd|boot\.ini)/gi,
    COMMON_EXPLOITS: /(phpinfo|wp-login|\.env|\.git|adminer)/gi
  };

  export default async function idsMiddleware(req, res, next) {
    try {
      const clientIP = (req.headers['x-forwarded-for'] || '')
        .split(',')[0]
        .trim() || req.socket.remoteAddress;

      // ✅ Use `net.isIP()` instead of `validator.isIP()`
      if (!net.isIP(clientIP)) {
        return res.status(400).json({ message: 'Invalid IP address format' });
      }

      const requestData = {
        headers: JSON.stringify(req.headers),
        query: JSON.stringify(req.query),
        body: JSON.stringify(req.body),
        params: JSON.stringify(req.params)
      };

      let detectedThreats = [];
      
      // Check all threat categories
      Object.entries(THREAT_SIGNATURES).forEach(([threatType, pattern]) => {
        if (pattern.test(requestData.headers + requestData.query + requestData.body)) {
          detectedThreats.push(threatType);
        }
      });

      // Check suspicious paths
      const SUSPICIOUS_PATHS = ['/admin', '/wp-login.php', '/console'];
      if (SUSPICIOUS_PATHS.some(path => req.originalUrl.includes(path))) {
        detectedThreats.push('SUSPICIOUS_PATH');
      }

      if (detectedThreats.length > 0) {
        await Log.create({
          ipAddress: clientIP,
          endpoint: req.originalUrl,
          method: req.method,
          eventType: 'IDS_ALERT',
          detectedPatterns: detectedThreats,
          requestDetails: requestData
        });

        return res.status(403).json({
          message: 'Request blocked by security system',
          detectedThreats,
          incidentId: randomBytes(8).toString('hex')
        });
      }

      next();
    } catch (error) {
      console.error('IDS error:', error);
      return res.status(500).json({ message: 'Security system error' });
    }
  }
