import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage.js";
import multer from "multer";
import path from "path";

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
      const doc = await storage.createDocument({
        ...req.body,
        fileUrl,
        uploadedBy: req.user!.id,
        status: "draft",
      });
      
      // Grant access to uploader
      await storage.setDocumentAccess({
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
      const docs = await storage.getDocumentsByUser(req.user!.id);
      res.json(docs);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get("/api/documents/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const doc = await storage.getDocument(parseInt(req.params.id));
      if (!doc) return res.status(404).send("Document not found");
      
      const access = await storage.getDocumentAccess(doc.id, req.user!.id);
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
      const doc = await storage.getDocument(parseInt(req.params.id));
      if (!doc) return res.status(404).send("Document not found");
      
      const access = await storage.getDocumentAccess(doc.id, req.user!.id);
      if (!access?.canEdit && doc.uploadedBy !== req.user!.id) {
        return res.status(403).send("Access denied");
      }
      
      const updated = await storage.updateDocumentStatus(doc.id, req.body.status);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
