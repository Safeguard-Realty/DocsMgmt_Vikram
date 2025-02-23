import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { Pool } from "pg"; 

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Document routes
  app.post("/api/documents", upload.single("file"), async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.file) return res.status(400).send("No file uploaded");

    const fileUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    
    try {
      const doc = await storage.mongo.createDocument({
        ...req.body,
        fileUrl,
        uploadedBy: req.user!.id,
        status: "draft",
      });
      
      // Grant access to uploader
      await storage.mongo.setDocumentAccess({
        documentId: doc.id,
        userId: req.user!.id,
        canView: true,
        canEdit: true,
      });

      res.status(201).json(doc);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get("/api/documents", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const docs = await storage.mongo.getDocumentsByUser(req.user!.id);
      res.json(docs);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get("/api/documents/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const doc = await storage.mongo.getDocument(parseInt(req.params.id));
      if (!doc) return res.status(404).send("Document not found");
      
      const access = await storage.mongo.getDocumentAccess(doc.id, req.user!.id);
      if (!access?.canView && doc.uploadedBy !== req.user!.id) {
        return res.status(403).send("Access denied");
      }
      
      res.json(doc);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.patch("/api/documents/:id/status", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const doc = await storage.mongo.getDocument(parseInt(req.params.id));
      if (!doc) return res.status(404).send("Document not found");
      
      const access = await storage.mongo.getDocumentAccess(doc.id, req.user!.id);
      if (!access?.canEdit && doc.uploadedBy !== req.user!.id) {
        return res.status(403).send("Access denied");
      }
      
      const updated = await storage.mongo.updateDocumentStatus(doc.id, req.body.status);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get('/api/upload-docs/categories', async (req, res) => {
    try {
      const categories = await storage.postgres.getCategories();
      // console.log('Categories fetched from DB:', categories);
  
      if (!categories || categories.length === 0) {
        return res.status(404).json({ error: 'No categories found' });
      }
  
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });
  
  
  // Get document types (subcategories) based on category
  app.get('/api/upload-docs/types/:category', async (req, res) => {
    const { category } = req.params;
    try {
      const types = await storage.postgres.getTypesByCategory(category);
      // console.log(`Types fetched for category ${category}:`, types);
  
      if (!types || types.length === 0) {
        return res.status(404).json({ error: 'No document types found' });
      }
  
      res.json(types);
    } catch (error) {
      console.error('Error fetching document types:', error);
      res.status(500).json({ error: 'Failed to fetch document types' });
    }
  });
  

  const httpServer = createServer(app);
  return httpServer;
}
