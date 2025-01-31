import mongoose from 'mongoose';

const blockedIPSchema = new mongoose.Schema({
  ipAddress: { 
    type: String, 
    required: true,
    validate: {
      validator: v => /^(?:\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(v),
      message: props => `${props.value} is not a valid IPv4/IPv6 address!`
    }
  },
  reason: { 
    type: String,
    enum: ['MANUAL', 'AUTO_IDS', 'BRUTE_FORCE', 'OTHER'],
    default: 'MANUAL'
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: { expires: '365d' } // Auto-delete after 1 year
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 1 week block
  },
  incidents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Log'
  }]
});

// Indexes
blockedIPSchema.index({ ipAddress: 1 }, { unique: true });
blockedIPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const BlockedIP = mongoose.model('BlockedIP', blockedIPSchema);
export default BlockedIP;