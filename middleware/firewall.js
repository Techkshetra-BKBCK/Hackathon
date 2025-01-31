import BlockedIP from '../models/blockedIP.model.js';
import Log from '../models/log.model.js';
import net from 'net'; // ✅ Use Node.js built-in module (no need for validator)

export default async function firewallMiddleware(req, res, next) {
  try {
    // Extract Client IP Address
    const clientIP = (req.headers['x-forwarded-for'] || '')
      .split(',')[0]
      .trim() || req.socket.remoteAddress;

    // ✅ Validate IP Format using `net.isIP()`
    if (!net.isIP(clientIP)) {
      return res.status(400).json({ message: 'Invalid IP address format' });
    }

    // Check blocklist with caching
    const blocked = await BlockedIP.findOne({ ipAddress: clientIP });
    
    if (blocked) {
      // Log blocked access attempt
      await Log.create({
        ipAddress: clientIP,
        endpoint: req.originalUrl,
        method: req.method,
        eventType: 'FIREWALL_BLOCK',
        details: `Blocked by firewall: ${blocked.reason}`
      });
      
      return res.status(403).json({
        message: 'Forbidden: Your IP has been blocked',
        reason: blocked.reason,
        until: blocked.expiresAt || 'Permanent'
      });
    }
    
    next();
  } catch (error) {
    console.error('Firewall error:', error);
    return res.status(500).json({ message: 'Internal security system error' });
  }
}
