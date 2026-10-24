import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  actorName: { type: String, default: 'System' },
  actorRole: { type: String, default: 'admin' },
  action: { type: String, required: true },
  targetType: { 
    type: String, 
    enum: ['User', 'Farmer', 'Delivery', 'Product', 'Order', 'Settings'],
    required: true 
  },
  targetId: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now, index: true }
});

auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
