import { Router } from "express";
import { db } from "@db";
import { channels, messages, workspaceMembers, users } from "@db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// Validation schemas
const createChannelSchema = z.object({
  name: z.string().min(1, "Channel name is required"),
  type: z.string(),
  topic: z.string().optional(),
  isPrivate: z.boolean().default(false),
  settings: z.record(z.unknown()).optional(),
});

const updateChannelSchema = z.object({
  name: z.string().min(1, "Channel name is required").optional(),
  topic: z.string().optional(),
  settings: z.record(z.unknown()).optional(),
});

// Get channels for a workspace
router.get("/api/workspaces/:workspaceId/channels", async (req, res) => {
  try {
    const workspaceId = parseInt(req.params.workspaceId);
    const userId = 1; // TODO: Replace with actual user ID from auth

    // Verify user is a workspace member
    const membership = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId)
      ),
    });

    if (!membership) {
      return res.status(403).json({ message: 'Access denied to this workspace' });
    }

    // Get all channels in the workspace
    const channelList = await db.query.channels.findMany({
      where: eq(channels.workspaceId, workspaceId),
      with: {
        messages: {
          limit: 1,
          orderBy: desc(messages.createdAt),
        },
      },
    });

    res.json(channelList.map(channel => ({
      id: channel.id,
      name: channel.name,
      type: channel.type,
      topic: channel.topic,
      isPrivate: channel.isPrivate,
      isDm: channel.isDm,
      settings: channel.settings,
      lastMessage: channel.messages[0] || null,
      createdAt: channel.createdAt,
    })));
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ message: 'Failed to fetch channels' });
  }
});

// Create a new channel
router.post("/api/workspaces/:workspaceId/channels", async (req, res) => {
  try {
    const workspaceId = parseInt(req.params.workspaceId);
    const userId = 1; // TODO: Replace with actual user ID from auth
    const data = createChannelSchema.parse(req.body);

    // Verify user has permission to create channels
    const membership = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId)
      ),
    });

    if (!membership) {
      return res.status(403).json({ message: 'Access denied to this workspace' });
    }

    // Create the channel
    const [channel] = await db.insert(channels)
      .values({
        workspaceId,
        name: data.name,
        type: data.type,
        topic: data.topic,
        isPrivate: data.isPrivate,
        settings: data.settings || channels.settings.default,
        createdBy: userId,
      })
      .returning();

    res.status(201).json(channel);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid channel data', errors: error.errors });
    }
    console.error('Error creating channel:', error);
    res.status(500).json({ message: 'Failed to create channel' });
  }
});

// Get channel details
router.get("/api/channels/:channelId", async (req, res) => {
  try {
    const channelId = parseInt(req.params.channelId);
    const userId = 1; // TODO: Replace with actual user ID from auth

    const channel = await db.query.channels.findFirst({
      where: eq(channels.id, channelId),
      with: {
        messages: {
          limit: 50,
          orderBy: desc(messages.createdAt),
          with: {
            author: true,
          },
        },
      },
    });

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Verify user has access to the channel's workspace
    const membership = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, channel.workspaceId),
        eq(workspaceMembers.userId, userId)
      ),
    });

    if (!membership) {
      return res.status(403).json({ message: 'Access denied to this channel' });
    }

    res.json({
      ...channel,
      messages: channel.messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        author: {
          id: msg.author.id,
          username: msg.author.username,
          avatar: msg.author.avatar,
        },
        createdAt: msg.createdAt,
        isEdited: msg.isEdited,
        editedAt: msg.editedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching channel:', error);
    res.status(500).json({ message: 'Failed to fetch channel details' });
  }
});

// Update channel
router.patch("/api/channels/:channelId", async (req, res) => {
  try {
    const channelId = parseInt(req.params.channelId);
    const userId = 1; // TODO: Replace with actual user ID from auth
    const data = updateChannelSchema.parse(req.body);

    // Verify channel exists and get workspace info
    const channel = await db.query.channels.findFirst({
      where: eq(channels.id, channelId),
    });

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Verify user has permission to update channels
    const membership = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, channel.workspaceId),
        eq(workspaceMembers.userId, userId)
      ),
    });

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Update the channel
    const [updated] = await db.update(channels)
      .set({
        name: data.name,
        topic: data.topic,
        settings: data.settings,
      })
      .where(eq(channels.id, channelId))
      .returning();

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid channel data', errors: error.errors });
    }
    console.error('Error updating channel:', error);
    res.status(500).json({ message: 'Failed to update channel' });
  }
});

// Archive channel
router.post("/api/channels/:channelId/archive", async (req, res) => {
  try {
    const channelId = parseInt(req.params.channelId);
    const userId = 1; // TODO: Replace with actual user ID from auth

    // Verify channel exists and get workspace info
    const channel = await db.query.channels.findFirst({
      where: eq(channels.id, channelId),
    });

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Verify user has permission to archive channels
    const membership = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, channel.workspaceId),
        eq(workspaceMembers.userId, userId)
      ),
    });

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Archive the channel
    const [archived] = await db.update(channels)
      .set({
        archivedAt: new Date(),
        archivedBy: userId,
      })
      .where(eq(channels.id, channelId))
      .returning();

    res.json({
      message: 'Channel archived successfully',
      channel: archived,
    });
  } catch (error) {
    console.error('Error archiving channel:', error);
    res.status(500).json({ message: 'Failed to archive channel' });
  }
});

// Create a direct message channel
router.post("/api/workspaces/:workspaceId/dms", async (req, res) => {
  try {
    const workspaceId = parseInt(req.params.workspaceId);
    const userId = 1; // TODO: Replace with actual user ID from auth
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ message: 'Target user ID is required' });
    }

    // Verify both users are workspace members
    const memberships = await db.query.workspaceMembers.findMany({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        inArray(workspaceMembers.userId, [userId, targetUserId])
      ),
    });

    if (memberships.length !== 2) {
      return res.status(403).json({ message: 'One or both users are not workspace members' });
    }

    // Check if DM channel already exists between these users
    const existingDM = await db.query.channels.findFirst({
      where: and(
        eq(channels.workspaceId, workspaceId),
        eq(channels.isDm, true),
        eq(channels.type, 'dm'),
        inArray(channels.metadata?.dmMembers, [userId, targetUserId]) //Check for existing DM between users
      ),
    });

    if (existingDM) {
      return res.json(existingDM);
    }

    // Get target user info for channel name
    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, targetUserId),
    });

    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    // Create the DM channel
    const [channel] = await db.insert(channels)
      .values({
        workspaceId,
        name: targetUser.username, // Use target user's name for the channel
        type: 'dm',
        isDm: true,
        isPrivate: true,
        settings: {
          retention: {
            type: 'inherit',
            days: null
          },
          defaultNotifications: 'all_messages',
          allowThreads: true,
          allowUploads: true,
          allowIntegrations: false,
          allowBots: false
        },
        createdBy: userId,
        metadata: {
          dmMembers: [userId, targetUserId]
        }
      })
      .returning();

    res.status(201).json(channel);
  } catch (error) {
    console.error('Error creating DM channel:', error);
    res.status(500).json({ message: 'Failed to create DM channel' });
  }
});

export default router;