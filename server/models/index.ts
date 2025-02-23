import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true,
    enum: ['admin', 'agent', 'buyer', 'seller', 'legal', 'notary']
  },
  fullName: { type: String, required: true }
});
const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { 
    type: String, 
    required: true, 
    enum: ['property', 'kyc'] // ✅ Added category with enum validation
  },
  type: { 
    type: String, 
    required: true,
    enum: ['deed', 'contract', 'mortgage', 'inspection', 'aadhar', 'passport'] // ✅ Ensure type aligns with category
  },
  status: { 
    type: String, 
    required: true,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  createdAt: { type: Date, default: Date.now },
  metadata: {
    region: String,
    template: String,
    signatures: [String],
    workflow: String
  },
  fileUrl: { type: String, required: true }
});

const documentAccessSchema = new mongoose.Schema({
  documentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Document',
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  canView: { type: Boolean, required: true },
  canEdit: { type: Boolean, required: true }
});

export const User = mongoose.model('User', userSchema);
export const Document = mongoose.model('Document', documentSchema);
export const DocumentAccess = mongoose.model('DocumentAccess', documentAccessSchema);
