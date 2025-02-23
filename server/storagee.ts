// import { User, Document, DocumentAccess } from './models/index.js';
// import createMemoryStore from 'memorystore';
// import session from 'express-session';
// import mongoose from 'mongoose';

// const MemoryStore = createMemoryStore(session);

// export class MongoStorage {
//   constructor() {
//     this.sessionStore = new MemoryStore({
//       checkPeriod: 86400000
//     });
//   }

//   async connect() {
//     try {
//       const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/realestate-dms';
//       console.log('Connecting to MongoDB...');
//       await mongoose.connect(uri, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//       });
//       console.log('MongoDB connected successfully');
//     } catch (error) {
//       console.error('MongoDB connection error:', error);
//       throw error;
//     }
//   }

//   // User methods
//   async getUser(id) {
//     return await User.findById(id);
//   }

//   async getUserByUsername(username) {
//     return await User.findOne({ username });
//   }

//   async createUser(userData) {
//     try {
//       const user = new User(userData);
//       return await user.save();
//     } catch (error) {
//       console.error('Error creating user:', error);
//       throw error;
//     }
//   }

//   // Document methods
//   async createDocument(docData) {
//     try {
//       const doc = new Document(docData);
//       return await doc.save();
//     } catch (error) {
//       console.error('Error creating document:', error);
//       throw error;
//     }
//   }

//   async getDocument(id) {
//     return await Document.findById(id);
//   }

//   async getDocumentsByUser(userId) {
//     try {
//       const userAccess = await DocumentAccess.find({ userId });
//       const accessibleDocIds = userAccess.map(access => access.documentId);

//       return await Document.find({
//         $or: [
//           { uploadedBy: userId },
//           { _id: { $in: accessibleDocIds } }
//         ]
//       });
//     } catch (error) {
//       console.error('Error fetching documents:', error);
//       throw error;
//     }
//   }

//   async updateDocumentStatus(id, status) {
//     try {
//       return await Document.findByIdAndUpdate(
//         id,
//         { status },
//         { new: true }
//       );
//     } catch (error) {
//       console.error('Error updating document status:', error);
//       throw error;
//     }
//   }

//   // Document Access methods
//   async setDocumentAccess(access) {
//     try {
//       const docAccess = new DocumentAccess(access);
//       return await docAccess.save();
//     } catch (error) {
//       console.error('Error setting document access:', error);
//       throw error;
//     }
//   }

//   async getDocumentAccess(documentId, userId) {
//     return await DocumentAccess.findOne({ documentId, userId });
//   }
// }

// export const storage = new MongoStorage();