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

export const insertWorkspaceSchema = createInsertSchema(workspaces);
export const selectWorkspaceSchema = createSelectSchema(workspaces);
export const insertWorkspaceMemberSchema = createInsertSchema(workspaceMembers);
export const selectWorkspaceMemberSchema = createSelectSchema(workspaceMembers);

export type InsertWorkspace = typeof workspaces.$inferInsert;
export type SelectWorkspace = typeof workspaces.$inferSelect;
export type InsertWorkspaceMember = typeof workspaceMembers.$inferInsert;
export type SelectWorkspaceMember = typeof workspaceMembers.$inferSelect;


export const channels = pgTable("channels", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  type: text("type").notNull().default('text'),
  name: text("name").notNull(),
  topic: text("topic"),
  isPrivate: boolean("is_private").notNull().default(false),
  isDm: boolean("is_dm").notNull().default(false),
  createdBy: integer("created_by").references(() => users.id, { onDelete: 'set null' }),
  settings: jsonb("settings").notNull().default({
    retention: {
      type: "inherit",
      days: null
    },
    defaultNotifications: "all",
    allowThreads: true,
    allowUploads: true,
    allowIntegrations: true,
    allowBots: true
  }),
  archivedAt: timestamp("archived_at"),
  archivedBy: integer("archived_by").references(() => users.id, { onDelete: 'set null' }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  version: integer("version").notNull().default(1),
});

export const channelMembers = pgTable("channel_members", {
  id: serial("id").primaryKey(),
  channelId: integer("channel_id").notNull().references(() => channels.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text("role").notNull().default('member'),
  addedBy: integer("added_by").references(() => users.id, { onDelete: 'set null' }),
  addedAt: timestamp("added_at").notNull().defaultNow(),
});

export const channelReadStates = pgTable("channel_read_states", {
  channelId: integer("channel_id").notNull().references(() => channels.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  lastReadMessageId: integer("last_read_message_id"),
  lastReadAt: timestamp("last_read_at").notNull().defaultNow(),
  mentionCount: integer("mention_count").notNull().default(0),
  hasUnread: boolean("has_unread").notNull().default(false),
  version: integer("version").notNull().default(1),
});

export const channelRelations = relations(channels, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [channels.workspaceId],
    references: [workspaces.id],
  }),
  creator: one(users, {
    fields: [channels.createdBy],
    references: [users.id],
  }),
  archiver: one(users, {
    fields: [channels.archivedBy],
    references: [users.id],
  }),
  members: many(channelMembers),
  readStates: many(channelReadStates),
}));

export const channelMemberRelations = relations(channelMembers, ({ one }) => ({
  channel: one(channels, {
    fields: [channelMembers.channelId],
    references: [channels.id],
  }),
  user: one(users, {
    fields: [channelMembers.userId],
    references: [users.id],
  }),
  addedByUser: one(users, {
    fields: [channelMembers.addedBy],
    references: [users.id],
  }),
}));

export const channelReadStateRelations = relations(channelReadStates, ({ one }) => ({
  channel: one(channels, {
    fields: [channelReadStates.channelId],
    references: [channels.id],
  }),
  user: one(users, {
    fields: [channelReadStates.userId],
    references: [users.id],
  }),
}));

export const insertChannelSchema = createInsertSchema(channels);
export const selectChannelSchema = createSelectSchema(channels);
export const insertChannelMemberSchema = createInsertSchema(channelMembers);
export const selectChannelMemberSchema = createSelectSchema(channelMembers);
export const insertChannelReadStateSchema = createInsertSchema(channelReadStates);
export const selectChannelReadStateSchema = createSelectSchema(channelReadStates);

export type InsertChannel = typeof channels.$inferInsert;
export type SelectChannel = typeof channels.$inferSelect;
export type InsertChannelMember = typeof channelMembers.$inferInsert;
export type SelectChannelMember = typeof channelMembers.$inferSelect;
export type InsertChannelReadState = typeof channelReadStates.$inferInsert;
export type SelectChannelReadState = typeof channelReadStates.$inferSelect;