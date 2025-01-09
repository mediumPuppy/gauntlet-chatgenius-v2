import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations, type InferModel } from "drizzle-orm";

// Users and Authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  auth0Id: text("auth0_id").unique(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  avatar: text("avatar_url"),
  status: jsonb("status").$type<{
    text: string;
    emoji: string;
    expiresAt: Date;
  }>(),
  isBot: boolean("is_bot").default(false),
  botOwnerId: integer("bot_owner_id").references(() => users.id, { onDelete: 'set null' }),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorMethod: text("two_factor_method"),
  lastActive: timestamp("last_active").defaultNow(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  version: integer("version").notNull().default(1),
});

// User Preferences
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  notifications: jsonb("notifications").$type<{
    desktop: {
      enabled: boolean;
      sound: boolean;
      mentions: boolean;
      messages: boolean;
      quietHours: {
        enabled: boolean;
        start: string;
        end: string;
        timezone: string;
      };
    };
    mobile: {
      enabled: boolean;
      sound: boolean;
      mentions: boolean;
      messages: boolean;
      quietHours: {
        enabled: boolean;
        start: string;
        end: string;
        timezone: string;
      };
    };
    email: {
      enabled: boolean;
      digest: string;
    };
  }>(),
  theme: jsonb("theme").$type<{
    mode: string;
    customColors: Record<string, string>;
    fontSize: string;
    compact: boolean;
  }>(),
  version: integer("version").notNull().default(1),
});

// Workspaces
export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ownerId: integer("owner_id").notNull().references(() => users.id, { onDelete: 'restrict' }),
  settings: jsonb("settings").$type<{
    defaultChannelPermissions: Record<string, boolean>;
    defaultMemberPermissions: Record<string, boolean>;
    fileRetention: {
      policy: string;
      duration: number;
    };
    messageRetention: {
      policy: string;
      duration: number | null;
    };
    allowedAuthMethods: string[];
    allowedIntegrations: string[];
  }>(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  version: integer("version").notNull().default(1),
});

// Workspace Members
export const workspaceMembers = pgTable("workspace_members", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text("role").notNull().default('member'),
  permissions: jsonb("permissions").$type<{
    canManageUsers: boolean;
    canManageBilling: boolean;
    canConfigureWorkspace: boolean;
  }>(),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  invitedBy: integer("invited_by").references(() => users.id, { onDelete: 'set null' }),
  metadata: jsonb("metadata"),
  version: integer("version").notNull().default(1),
});

// Channels
export const channels = pgTable("channels", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  type: text("type").notNull(),
  name: text("name").notNull(),
  topic: text("topic"),
  createdBy: integer("created_by").references(() => users.id, { onDelete: 'set null' }),
  settings: jsonb("settings").$type<{
    retention: {
      type: string;
      days: number | null;
    };
    defaultNotifications: string;
    allowThreads: boolean;
    allowUploads: boolean;
    allowIntegrations: boolean;
    allowBots: boolean;
  }>(),
  isPrivate: boolean("is_private").default(false),
  isDm: boolean("is_dm").default(false),
  archivedAt: timestamp("archived_at"),
  archivedBy: integer("archived_by").references(() => users.id, { onDelete: 'set null' }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  version: integer("version").notNull().default(1),
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  channelId: integer("channel_id").notNull().references(() => channels.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  rootMessageId: integer("root_message_id").references(() => messages.id, { onDelete: 'cascade' }),
  parentId: integer("parent_id").references(() => messages.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  deletedAt: timestamp("deleted_at"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  version: integer("version").notNull().default(1),
});

// Update message relations to include thread relationships
export const messageRelations = relations(messages, ({ one, many }) => ({
  channel: one(channels, {
    fields: [messages.channelId],
    references: [channels.id],
  }),
  author: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
  parent: one(messages, {
    fields: [messages.parentId],
    references: [messages.id],
  }),
  root: one(messages, {
    fields: [messages.rootMessageId],
    references: [messages.id],
  }),
  replies: many(messages, { relationName: "threadReplies" }),
}));

// Define relationships
export const userRelations = relations(users, ({ one, many }) => ({
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
  ownedWorkspaces: many(workspaces),
  workspaceMemberships: many(workspaceMembers),
  messages: many(messages),
}));

export const workspaceRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, {
    fields: [workspaces.ownerId],
    references: [users.id],
  }),
  members: many(workspaceMembers),
  channels: many(channels),
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
}));

export const channelRelations = relations(channels, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [channels.workspaceId],
    references: [workspaces.id],
  }),
  messages: many(messages),
}));


// Files
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  uploaderId: integer("uploader_id").references(() => users.id, { onDelete: 'set null' }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  altText: text("alt_text"),
  previewStatus: text("preview_status"),
  previewUrls: jsonb("preview_urls").$type<{
    small: string;
    medium: string;
    large: string;
  }>(),
  retentionPolicy: text("retention_policy"),
  retentionExpiresAt: timestamp("retention_expires_at"),
  s3Details: jsonb("s3_details").$type<{
    bucket: string;
    key: string;
    versionId: string;
    storageClass: string;
    presignedUrl: {
      url: string;
      expiresAt: Date;
    };
  }>(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  version: integer("version").notNull().default(1),
});

// Message mentions, files, reactions, and saved by
export const messageMentions = pgTable("message_mentions", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull().references(() => messages.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  mentionOffset: integer("mention_offset").notNull(),
  mentionLength: integer("mention_length").notNull(),
});

export const messageFiles = pgTable("message_files", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull().references(() => messages.id, { onDelete: 'cascade' }),
  fileId: integer("file_id").references(() => files.id, { onDelete: 'set null' }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
});

export const messageReactions = pgTable("message_reactions", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull().references(() => messages.id, { onDelete: 'cascade' }),
  emoji: text("emoji").notNull(),
  userIds: integer("user_ids").array(),
});

export const messageSavedBy = pgTable("message_saved_by", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull().references(() => messages.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  savedAt: timestamp("saved_at").notNull().defaultNow(),
});

// Audit logs
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  actionType: text("action_type").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'set null' }),
  workspaceId: integer("workspace_id").references(() => workspaces.id, { onDelete: 'cascade' }),
  details: jsonb("details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  version: integer("version").notNull().default(1),
});

// Saved items
export const savedItems = pgTable("saved_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text("type").notNull(),
  itemId: text("item_id").notNull(),
  workspaceId: integer("workspace_id").references(() => workspaces.id, { onDelete: 'cascade' }),
  channelId: integer("channel_id").references(() => channels.id, { onDelete: 'cascade' }),
  savedAt: timestamp("saved_at").notNull().defaultNow(),
  notes: text("notes"),
  tags: text("tags").array(),
  version: integer("version").notNull().default(1),
});

// Sessions
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  lastActive: timestamp("last_active").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  isCurrent: boolean("is_current").default(true),
  version: integer("version").notNull().default(1),
});

// Create Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertWorkspaceSchema = createInsertSchema(workspaces);
export const selectWorkspaceSchema = createSelectSchema(workspaces);
export const insertChannelSchema = createInsertSchema(channels);
export const selectChannelSchema = createSelectSchema(channels);
export const insertMessageSchema = createInsertSchema(messages);
export const selectMessageSchema = createSelectSchema(messages);
export const insertFileSchema = createInsertSchema(files);
export const selectFileSchema = createSelectSchema(files);

// Export types
export type User = InferModel<typeof users>;
export type NewUser = typeof users.$inferInsert;
export type Workspace = InferModel<typeof workspaces>;
export type NewWorkspace = typeof workspaces.$inferInsert;
export type Channel = InferModel<typeof channels>;
export type NewChannel = typeof channels.$inferInsert;
export type Message = InferModel<typeof messages>;
export type NewMessage = typeof messages.$inferInsert;
export type File = InferModel<typeof files>;
export type NewFile = typeof files.$inferInsert;