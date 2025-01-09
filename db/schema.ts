import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

// Workspace table
export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ownerId: integer("owner_id").notNull().references(() => users.id, { onDelete: 'restrict' }),
  settings: jsonb("settings").notNull().default({
    defaultChannelPermissions: {
      canInvite: true,
      canPost: true,
      canUploadFiles: true
    },
    defaultMemberPermissions: {
      canCreateChannels: true,
      canManageIntegrations: false
    },
    fileRetention: {
      policy: "delete",
      duration: 90
    },
    messageRetention: {
      policy: "keep",
      duration: null
    },
    allowedAuthMethods: ["password"],
    allowedIntegrations: []
  }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  version: integer("version").notNull().default(1),
});

// WorkspaceMember table
export const workspaceMembers = pgTable("workspace_members", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text("role").notNull().default('member'),
  permissions: jsonb("permissions").notNull().default({
    canManageUsers: false,
    canManageBilling: false,
    canConfigureWorkspace: false
  }),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  invitedBy: integer("invited_by").references(() => users.id, { onDelete: 'set null' }),
  metadata: jsonb("metadata"),
  version: integer("version").notNull().default(1),
});

// Define relationships
export const workspaceRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, {
    fields: [workspaces.ownerId],
    references: [users.id],
  }),
  members: many(workspaceMembers),
}));

export const workspaceMemberRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceMembers.workspaceId],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [workspaceMembers.userId],
    references: [users.id],
  }),
  inviter: one(users, {
    fields: [workspaceMembers.invitedBy],
    references: [users.id],
  }),
}));

// Create Zod schemas for validation
export const insertWorkspaceSchema = createInsertSchema(workspaces);
export const selectWorkspaceSchema = createSelectSchema(workspaces);
export const insertWorkspaceMemberSchema = createInsertSchema(workspaceMembers);
export const selectWorkspaceMemberSchema = createSelectSchema(workspaceMembers);

// Export types
export type InsertWorkspace = typeof workspaces.$inferInsert;
export type SelectWorkspace = typeof workspaces.$inferSelect;
export type InsertWorkspaceMember = typeof workspaceMembers.$inferInsert;
export type SelectWorkspaceMember = typeof workspaceMembers.$inferSelect;