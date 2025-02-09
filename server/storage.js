import { User, Document, DocumentAccess } from './models/index.js';
import createMemoryStore from 'memorystore';
import session from 'express-session';
import mongoose from 'mongoose';

const MemoryStore = createMemoryStore(session);

export class MongoStorage {
  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000
    });
  }

  async connect() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/realestate-dms');
  }

  // User methods
  async getUser(id) {
    return await User.findById(id);
  }

  async getUserByUsername(username) {
    return await User.findOne({ username });
  }

  async createUser(userData) {
    const user = new User(userData);
    return await user.save();
  }

  // Document methods
  async createDocument(docData) {
    const doc = new Document(docData);
    return await doc.save();
  }

  async getDocument(id) {
    return await Document.findById(id);
  }

  async getDocumentsByUser(userId) {
    const userAccess = await DocumentAccess.find({ userId });
    const accessibleDocIds = userAccess.map(access => access.documentId);
    
    return await Document.find({
      $or: [
        { uploadedBy: userId },
        { _id: { $in: accessibleDocIds } }
      ]
    });
  }

  async updateDocumentStatus(id, status) {
    return await Document.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  }

  // Document Access methods
  async setDocumentAccess(access) {
    const docAccess = new DocumentAccess(access);
    return await docAccess.save();
  }

  async getDocumentAccess(documentId, userId) {
    return await DocumentAccess.findOne({ documentId, userId });
  }
}

export const storage = new MongoStorage();
