import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  ipAddress: { 
    type: String, 
    required: true,
    index: true
  },
  endpoint: {
    type: String,
    required: true
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    required: true
  },
  eventType: {
    type: String,
    enum: ['IDS_ALERT', 'FIREWALL_BLOCK', 'AUTH_FAILURE', 'REQUEST'],
    required: true
  },
  detectedPatterns: [String],
  requestDetails: {
    headers: String,
    query: String,
    body: String,
    params: String
  },
  userAgent: String,
  country: String,
  createdAt: {
    type: Date, 
    default: Date.now,
    index: { expires: '30d' } // Auto-delete logs after 30 days
  }
});

const Log = mongoose.model('Log', logSchema);
export default Log;