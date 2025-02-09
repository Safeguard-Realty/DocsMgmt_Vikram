import { users, documents, documentAccess } from "@shared/schema";
import type { User, InsertUser, Document, DocumentAccess } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createDocument(doc: Omit<Document, "id" | "createdAt">): Promise<Document>;
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByUser(userId: number): Promise<Document[]>;
  updateDocumentStatus(id: number, status: string): Promise<Document>;
  
  setDocumentAccess(access: Omit<DocumentAccess, "id">): Promise<DocumentAccess>;
  getDocumentAccess(documentId: number, userId: number): Promise<DocumentAccess | undefined>;
  
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private documentAccess: Map<number, DocumentAccess>;
  private currentUserId: number;
  private currentDocId: number;
  private currentAccessId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.documentAccess = new Map();
    this.currentUserId = 1;
    this.currentDocId = 1;
    this.currentAccessId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createDocument(doc: Omit<Document, "id" | "createdAt">): Promise<Document> {
    const id = this.currentDocId++;
    const document: Document = {
      ...doc,
      id,
      createdAt: new Date(),
    };
    this.documents.set(id, document);
    return document;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentsByUser(userId: number): Promise<Document[]> {
    const accessEntries = Array.from(this.documentAccess.values()).filter(
      (access) => access.userId === userId
    );
    const documentIds = new Set(accessEntries.map((access) => access.documentId));
    return Array.from(this.documents.values()).filter(
      (doc) => documentIds.has(doc.id) || doc.uploadedBy === userId
    );
  }

  async updateDocumentStatus(id: number, status: string): Promise<Document> {
    const doc = await this.getDocument(id);
    if (!doc) throw new Error("Document not found");
    const updated = { ...doc, status };
    this.documents.set(id, updated);
    return updated;
  }

  async setDocumentAccess(access: Omit<DocumentAccess, "id">): Promise<DocumentAccess> {
    const id = this.currentAccessId++;
    const newAccess: DocumentAccess = { ...access, id };
    this.documentAccess.set(id, newAccess);
    return newAccess;
  }

  async getDocumentAccess(documentId: number, userId: number): Promise<DocumentAccess | undefined> {
    return Array.from(this.documentAccess.values()).find(
      (access) => access.documentId === documentId && access.userId === userId
    );
  }
}

export const storage = new MemStorage();
