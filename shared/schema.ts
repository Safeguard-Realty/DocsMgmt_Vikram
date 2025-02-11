import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "agent", "buyer", "seller", "legal", "notary"] }).notNull(),
  fullName: text("full_name").notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category", { enum: ["property", "kyc"] }).notNull(),
  type: text("type", { 
    enum: ["deed", "contract", "mortgage", "inspection", "aadhar", "passport"] 
  }).notNull(),
  status: text("status", { enum: ["draft", "pending", "approved", "rejected"] }).notNull(),
  uploadedBy: integer("uploaded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  metadata: jsonb("metadata").$type<{
    region?: string;
    template?: string;
    signatures?: string[];
    workflow?: string;
  }>(),
  fileUrl: text("file_url").notNull(),
});

export const documentAccess = pgTable("document_access", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  userId: integer("user_id").notNull(),
  canView: boolean("can_view").notNull(),
  canEdit: boolean("can_edit").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  fullName: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  title: true,
  description: true,
  type: true,
  status: true,
  metadata: true,
  fileUrl: true,
});

export const insertDocumentAccessSchema = createInsertSchema(documentAccess);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type DocumentAccess = typeof documentAccess.$inferSelect;
