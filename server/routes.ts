import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { workspaces, workspaceMembers, users, channels, channelMembers, channelReadStates } from "@db/schema";
import { eq, and, desc, isNull } from "drizzle-orm";
import { z } from "zod";

// Validation schemas
const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required"),
  metadata: z.record(z.unknown()).optional(),
  settings: z.record(z.unknown()).optional(),
});

const updateWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").optional(),
  metadata: z.record(z.unknown()).optional(),
  settings: z.record(z.unknown()).optional(),
});

const switchWorkspaceSchema = z.object({
  workspaceId: z.number(),
});

// Channel schemas
const createChannelSchema = z.object({
  name: z.string().min(1, "Channel name is required").max(80),
  topic: z.string().optional(),
  isPrivate: z.boolean().default(false),
  type: z.enum(["text", "announcement"]).default("text"),
  members: z.array(z.number()).optional(),
});

const updateChannelSchema = z.object({
  name: z.string().min(1, "Channel name is required").max(80).optional(),
  topic: z.string().optional(),
  isPrivate: z.boolean().optional(),
  settings: z.record(z.unknown()).optional(),
});

const addChannelMembersSchema = z.object({
  userIds: z.array(z.number()).min(1, "At least one user ID is required"),
});

export function registerRoutes(app: Express): Server {
  // Get all workspaces for the current user
  app.get("/api/workspaces", async (req, res) => {
    try {
      // TODO: Replace with actual user ID from auth
      const userId = 1; // Temporary until auth is implemented

      // Get all workspaces where user is a member
      const result = await db.query.workspaceMembers.findMany({
        where: eq(workspaceMembers.userId, userId),
        with: {
          workspace: {
            with: {
              owner: true,
              members: true,
            },
          },
        },
      });

      // Transform the data to match the frontend requirements
      const workspaceList = result.map((membership) => ({
        id: membership.workspace.id,
        name: membership.workspace.name,
        role: membership.role,
        memberCount: membership.workspace.members.length,
        isAdmin: membership.role === 'owner' || membership.role === 'admin',
        settings: membership.workspace.settings,
        owner: {
          id: membership.workspace.owner.id,
          username: membership.workspace.owner.username,
        },
      }));

      res.json(workspaceList);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      res.status(500).json({ message: 'Failed to fetch workspaces' });
    }
  });

  // Create new workspace
  app.post("/api/workspaces", async (req, res) => {
    try {
      const userId = 1; // TODO: Replace with actual user ID from auth
      const data = createWorkspaceSchema.parse(req.body);

      // Create the workspace
      const [workspace] = await db.insert(workspaces).values({
        name: data.name,
        ownerId: userId,
        settings: data.settings || workspaces.settings.default,
        metadata: data.metadata || {},
      }).returning();

      // Add the creator as an owner
      await db.insert(workspaceMembers).values({
        workspaceId: workspace.id,
        userId: userId,
        role: 'owner',
        permissions: {
          canManageUsers: true,
          canManageBilling: true,
          canConfigureWorkspace: true,
        },
      });

      res.status(201).json({
        id: workspace.id,
        name: workspace.name,
        role: 'owner',
        memberCount: 1,
        isAdmin: true,
        settings: workspace.settings,
        owner: {
          id: userId,
          username: 'currentuser',
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid workspace data', errors: error.errors });
      }
      console.error('Error creating workspace:', error);
      res.status(500).json({ message: 'Failed to create workspace' });
    }
  });

  // Switch active workspace
  app.post("/api/workspaces/switch", async (req, res) => {
    try {
      const { workspaceId } = switchWorkspaceSchema.parse(req.body);
      const userId = 1; // TODO: Replace with actual user ID from auth

      // Verify workspace exists and user is a member
      const membership = await db.query.workspaceMembers.findFirst({
        where: and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId)
        ),
        with: {
          workspace: true,
        },
      });

      if (!membership) {
        return res.status(403).json({ message: 'Access denied to this workspace' });
      }

      // Initialize session if it doesn't exist
      if (!req.session) {
        return res.status(500).json({ message: 'Session not initialized' });
      }

      // Store active workspace in session
      req.session.activeWorkspaceId = workspaceId;

      res.json({ 
        message: 'Successfully switched workspace',
        workspace: {
          id: membership.workspace.id,
          name: membership.workspace.name,
          role: membership.role,
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid workspace ID', errors: error.errors });
      }
      console.error('Error switching workspace:', error);
      res.status(500).json({ message: 'Failed to switch workspace' });
    }
  });

  // Get workspace overview data
  app.get("/api/workspaces/:id", async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.id);
      const userId = 1; // TODO: Replace with actual user ID from auth

      // Get workspace data with related information
      const workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.id, workspaceId),
        with: {
          owner: true,
          members: {
            with: {
              user: true,
            },
          },
        },
      });

      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }

      // Verify user is a member
      const isMember = workspace.members.some(member => member.userId === userId);
      if (!isMember) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Transform data for response
      const response = {
        id: workspace.id,
        name: workspace.name,
        stats: {
          members: workspace.members.length,
          // Note: These will be implemented when we add channels and announcements
          channels: 0,
          announcements: 0,
        },
        owner: {
          id: workspace.owner.id,
          username: workspace.owner.username,
        },
        settings: workspace.settings,
        members: workspace.members.map(member => ({
          id: member.user.id,
          username: member.user.username,
          role: member.role,
          joinedAt: member.joinedAt,
        })),
        metadata: workspace.metadata,
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching workspace:', error);
      res.status(500).json({ message: 'Failed to fetch workspace details' });
    }
  });

  // Update workspace
  app.patch("/api/workspaces/:id", async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.id);
      const userId = 1; // TODO: Replace with actual user ID from auth
      const data = updateWorkspaceSchema.parse(req.body);

      // Check if user has permission to update
      const membership = await db.query.workspaceMembers.findFirst({
        where: and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId)
        ),
      });

      if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
        return res.status(403).json({ message: 'Permission denied' });
      }

      // Update workspace
      const [updated] = await db.update(workspaces)
        .set({
          name: data.name,
          settings: data.settings,
          metadata: data.metadata,
        })
        .where(eq(workspaces.id, workspaceId))
        .returning();

      if (!updated) {
        return res.status(404).json({ message: 'Workspace not found' });
      }

      res.json({
        id: updated.id,
        name: updated.name,
        settings: updated.settings,
        metadata: updated.metadata,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid workspace data', errors: error.errors });
      }
      console.error('Error updating workspace:', error);
      res.status(500).json({ message: 'Failed to update workspace' });
    }
  });

  // Delete workspace
  app.delete("/api/workspaces/:id", async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.id);
      const userId = 1; // TODO: Replace with actual user ID from auth

      // Verify user is the workspace owner
      const membership = await db.query.workspaceMembers.findFirst({
        where: and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId)
        ),
      });

      if (!membership || membership.role !== 'owner') {
        return res.status(403).json({ message: 'Only workspace owners can delete workspaces' });
      }

      // Delete workspace (this will cascade to members due to foreign key constraint)
      const [deleted] = await db.delete(workspaces)
        .where(eq(workspaces.id, workspaceId))
        .returning();

      if (!deleted) {
        return res.status(404).json({ message: 'Workspace not found' });
      }

      res.json({ message: 'Workspace deleted successfully' });
    } catch (error) {
      console.error('Error deleting workspace:', error);
      res.status(500).json({ message: 'Failed to delete workspace' });
    }
  });

  // Channel Routes
  app.get("/api/channels", async (req, res) => {
    try {
      const userId = 1; // TODO: Replace with actual user ID from auth
      if (!req.session?.activeWorkspaceId) {
        return res.status(400).json({ message: "No active workspace selected" });
      }

      const workspaceId = req.session.activeWorkspaceId;

      // Get channels where user is a member
      const result = await db.query.channels.findMany({
        where: and(
          eq(channels.workspaceId, workspaceId),
          eq(channels.archivedAt, null)
        ),
        with: {
          members: {
            where: eq(channelMembers.userId, userId),
          },
          readStates: {
            where: eq(channelReadStates.userId, userId),
          },
        },
      });

      // Transform the data for frontend
      const channelList = result.map(channel => ({
        id: channel.id,
        name: channel.name,
        topic: channel.topic,
        type: channel.type,
        isPrivate: channel.isPrivate,
        isDm: channel.isDm,
        unreadCount: channel.readStates[0]?.mentionCount || 0,
        hasUnread: channel.readStates[0]?.hasUnread || false,
        isMember: channel.members.length > 0,
      }));

      res.json(channelList);
    } catch (error) {
      console.error('Error fetching channels:', error);
      res.status(500).json({ message: 'Failed to fetch channels' });
    }
  });

  app.post("/api/channels", async (req, res) => {
    try {
      const userId = 1; // TODO: Replace with actual user ID from auth
      if (!req.session?.activeWorkspaceId) {
        return res.status(400).json({ message: "No active workspace selected" });
      }

      const data = createChannelSchema.parse(req.body);
      const workspaceId = req.session.activeWorkspaceId;

      // Create the channel
      const [channel] = await db.insert(channels).values({
        workspaceId,
        name: data.name,
        topic: data.topic,
        type: data.type,
        isPrivate: data.isPrivate,
        createdBy: userId,
      }).returning();

      // Add creator as member
      await db.insert(channelMembers).values({
        channelId: channel.id,
        userId,
        role: 'owner',
        addedBy: userId,
      });

      // Add additional members if provided
      if (data.members?.length) {
        const memberValues = data.members.map(memberId => ({
          channelId: channel.id,
          userId: memberId,
          role: 'member',
          addedBy: userId,
        }));
        await db.insert(channelMembers).values(memberValues);
      }

      res.status(201).json({
        id: channel.id,
        name: channel.name,
        topic: channel.topic,
        type: channel.type,
        isPrivate: channel.isPrivate,
        isDm: channel.isDm,
        unreadCount: 0,
        hasUnread: false,
        isMember: true,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid channel data', errors: error.errors });
      }
      console.error('Error creating channel:', error);
      res.status(500).json({ message: 'Failed to create channel' });
    }
  });

  app.get("/api/channels/:id", async (req, res) => {
    try {
      const userId = 1; // TODO: Replace with actual user ID from auth
      const channelId = parseInt(req.params.id);

      const channel = await db.query.channels.findFirst({
        where: eq(channels.id, channelId),
        with: {
          members: {
            with: {
              user: true,
            },
          },
          creator: true,
          readStates: {
            where: eq(channelReadStates.userId, userId),
          },
        },
      });

      if (!channel) {
        return res.status(404).json({ message: 'Channel not found' });
      }

      // Check if user is a member
      const isMember = channel.members.some(member => member.userId === userId);
      if (!isMember && channel.isPrivate) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json({
        id: channel.id,
        name: channel.name,
        topic: channel.topic,
        type: channel.type,
        isPrivate: channel.isPrivate,
        isDm: channel.isDm,
        settings: channel.settings,
        members: channel.members.map(member => ({
          id: member.user.id,
          username: member.user.username,
          role: member.role,
          joinedAt: member.addedAt,
        })),
        unreadCount: channel.readStates[0]?.mentionCount || 0,
        hasUnread: channel.readStates[0]?.hasUnread || false,
        isMember,
      });
    } catch (error) {
      console.error('Error fetching channel:', error);
      res.status(500).json({ message: 'Failed to fetch channel details' });
    }
  });

  app.patch("/api/channels/:id", async (req, res) => {
    try {
      const userId = 1; // TODO: Replace with actual user ID from auth
      const channelId = parseInt(req.params.id);
      const data = updateChannelSchema.parse(req.body);

      // Check if user has permission to update
      const membership = await db.query.channelMembers.findFirst({
        where: and(
          eq(channelMembers.channelId, channelId),
          eq(channelMembers.userId, userId),
        ),
      });

      if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
        return res.status(403).json({ message: 'Permission denied' });
      }

      // Update channel
      const [updated] = await db.update(channels)
        .set({
          name: data.name,
          topic: data.topic,
          isPrivate: data.isPrivate,
          settings: data.settings,
        })
        .where(eq(channels.id, channelId))
        .returning();

      if (!updated) {
        return res.status(404).json({ message: 'Channel not found' });
      }

      res.json({
        id: updated.id,
        name: updated.name,
        topic: updated.topic,
        isPrivate: updated.isPrivate,
        settings: updated.settings,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid channel data', errors: error.errors });
      }
      console.error('Error updating channel:', error);
      res.status(500).json({ message: 'Failed to update channel' });
    }
  });

  app.post("/api/channels/:id/members", async (req, res) => {
    try {
      const userId = 1; // TODO: Replace with actual user ID from auth
      const channelId = parseInt(req.params.id);
      const data = addChannelMembersSchema.parse(req.body);

      // Check if user has permission to add members
      const membership = await db.query.channelMembers.findFirst({
        where: and(
          eq(channelMembers.channelId, channelId),
          eq(channelMembers.userId, userId),
        ),
      });

      if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
        return res.status(403).json({ message: 'Permission denied' });
      }

      // Add new members
      const memberValues = data.userIds.map(memberId => ({
        channelId,
        userId: memberId,
        role: 'member',
        addedBy: userId,
      }));

      await db.insert(channelMembers)
        .values(memberValues)
        .onConflictDoNothing();

      res.json({ message: 'Members added successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid member data', errors: error.errors });
      }
      console.error('Error adding channel members:', error);
      res.status(500).json({ message: 'Failed to add channel members' });
    }
  });

  app.delete("/api/channels/:id", async (req, res) => {
    try {
      const channelId = parseInt(req.params.id);
      const userId = 1; // TODO: Replace with actual user ID from auth

      const membership = await db.query.channelMembers.findFirst({
        where: and(
          eq(channelMembers.channelId, channelId),
          eq(channelMembers.userId, userId),
        ),
      });

      if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
        return res.status(403).json({ message: 'Permission denied' });
      }

      await db.update(channels).set({ archivedAt: new Date() }).where(eq(channels.id, channelId));

      res.json({ message: 'Channel archived successfully' });
    } catch (error) {
      console.error("Error archiving channel:", error);
      res.status(500).json({ message: "Failed to archive channel" });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}