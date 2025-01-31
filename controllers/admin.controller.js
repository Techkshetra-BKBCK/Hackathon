import BlockedIP from "../models/blockedIP.model.js";
import Log from '../models/log.model.js';
import { body, param } from 'express-validator';
import validator from 'validator';

export const getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, severity } = req.query;
    const query = severity ? { eventType: severity } : {};
    
    const logs = await Log.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .select('-requestDetails -_id -__v');

    return res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error',
      errorId: crypto.randomBytes(8).toString('hex')
    });
  }
};

export const blockIP = [
  body('ipAddress').custom(value => {
    if (!validator.isIP(value)) throw new Error('Invalid IP address');
    return true;
  }),
  body('reason').optional().isString(),
  body('duration').optional().isInt({ min: 1, max: 365 }),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { ipAddress, reason = 'MANUAL', duration = 7 } = req.body;

      const existing = await BlockedIP.findOne({ ipAddress });
      if (existing) {
        return res.status(409).json({ 
          success: false,
          message: 'IP already blocked',
          expiresAt: existing.expiresAt
        });
      }

      const blocked = await BlockedIP.create({
        ipAddress,
        reason,
        expiresAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
      });

      await Log.create({
        ipAddress: req.ip,
        endpoint: '/api/admin/block',
        method: 'POST',
        eventType: 'FIREWALL_BLOCK',
        details: `Admin manual block: ${reason}`
      });

      return res.status(201).json({
        success: true,
        message: 'IP blocked successfully',
        blocked: {
          ipAddress: blocked.ipAddress,
          reason: blocked.reason,
          expiresAt: blocked.expiresAt
        }
      });
    } catch (error) {
      console.error('Error blocking IP:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        errorId: crypto.randomBytes(8).toString('hex')
      });
    }
  }
];

export const unblockIP = [
  param('ip').custom(value => {
    if (!validator.isIP(value)) throw new Error('Invalid IP address');
    return true;
  }),

  async (req, res) => {
    try {
      const { ip } = req.params;

      // ✅ Check if IP exists in blocklist
      const blockedIP = await BlockedIP.findOne({ ipAddress: ip });

      if (!blockedIP) {
        return res.status(404).json({
          success: false,
          message: 'IP not found in blocklist'
        });
      }

      // ✅ Delete the Blocked IP
      await BlockedIP.deleteOne({ ipAddress: ip });

      // ✅ Log the Unblock Action
      await Log.create({
        ipAddress: req.ip,
        endpoint: `/api/admin/unblock/${ip}`,
        method: 'DELETE',
        eventType: 'FIREWALL_UNBLOCK',
        details: `Admin manually unblocked IP ${ip}`
      });

      return res.json({
        success: true,
        message: `IP ${ip} unblocked successfully`
      });
    } catch (error) {
      console.error('Error unblocking IP:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        errorId: randomBytes(8).toString('hex')
      });
    }
  }
];