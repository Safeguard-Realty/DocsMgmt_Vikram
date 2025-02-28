import { User, Document, DocumentAccess } from './models/index';
import createMemoryStore from 'memorystore';
import session from 'express-session';
import mongoose, { Document as MongooseDocument } from 'mongoose';
import pg from 'pg';
const { Pool } = pg;

// MongoDB Interfaces
interface IUser extends MongooseDocument {
  username: string;
  password: string;
}

interface IDocument extends MongooseDocument {
  name?: string;
  status: string;
  uploadedBy: mongoose.Types.ObjectId;
}

interface IDocumentAccess extends MongooseDocument {
  userId: mongoose.Types.ObjectId;
  documentId: mongoose.Types.ObjectId;
}

const MemoryStore = createMemoryStore(session);

export class MongoStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async connect(): Promise<void> {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/realestate-dms';
      console.log('Connecting to MongoDB...');
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as mongoose.ConnectOptions);
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  // User and Document methods (Same as before)
  async getUser(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    return await User.findOne({ username });
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  async createDocument(docData: Partial<IDocument>): Promise<IDocument> {
    if (!docData.title) throw new Error('Document name/title is required.');
    const doc = new Document(docData);
    return await doc.save();
  }

  async getDocument(id: string): Promise<IDocument | null> {
    return await Document.findById(id);
  }

  async getDocumentsByUser(userId: string): Promise<IDocument[]> {
    const userAccess: IDocumentAccess[] = await DocumentAccess.find({ userId });
    const accessibleDocIds = userAccess.map((access) => access.documentId);

    return await Document.find({
      $or: [{ uploadedBy: userId }, { _id: { $in: accessibleDocIds } }],
    });
  }

  async updateDocumentStatus(id: string, status: string): Promise<IDocument | null> {
    return await Document.findByIdAndUpdate(id, { status }, { new: true });
  }

  async setDocumentAccess(access: Partial<IDocumentAccess>): Promise<IDocumentAccess> {
    const docAccess = new DocumentAccess(access);
    return await docAccess.save();
  }

  async getDocumentAccess(documentId: string, userId: string): Promise<IDocumentAccess | null> {
    return await DocumentAccess.findOne({ documentId, userId });
  }
}

// PostgreSQL Storage Class
export class PostgresStorage {
  pool: pg.Pool;

  constructor() {
    this.pool = new Pool({
      user: process.env.PG_USER || 'postgres',
      host: process.env.PG_HOST || 'localhost',
      database: process.env.PG_DATABASE || 'DocsRuleEngine',
      password: process.env.PG_PASSWORD || 'pgadmin',
      port: Number(process.env.PG_PORT) || 5432,
    });
  }

  async connect(): Promise<void> {
    try {
      await this.pool.connect();
      console.log('Connected to PostgreSQL');
    } catch (error) {
      console.error('PostgreSQL connection error:', error);
      throw error;
    }
  }

  // Fetch distinct categories from document_rules
  async getCategories(): Promise<string[]> {
    const result = await this.pool.query(
      'SELECT DISTINCT category FROM document_rules'
    );
    return result.rows.map((row) => row.category);
  }

  // Fetch subcategories based on category
  async getTypesByCategory(category: string): Promise<string[]> {
    const result = await this.pool.query(
      'SELECT subcategory FROM document_rules WHERE category = $1',
      [category]
    );
    return result.rows.map((row) => row.subcategory);
  }


  async insertMetadata(key: string, value: string): Promise<void> {
    await this.pool.query('INSERT INTO metadata (key, value) VALUES ($1, $2)', [key, value]);
  }

  async getMetadata(): Promise<any[]> {
    const result = await this.pool.query('SELECT * FROM metadata');
    return result.rows;
  }
}

// Export both storage instances
export const storage = {
  mongo: new MongoStorage(),
  postgres: new PostgresStorage(),
};
