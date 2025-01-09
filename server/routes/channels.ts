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
        settings: data.settings || {},
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
        eq(channels.type, 'dm')
      ),
    });

    // Check if this is already a DM between these users
    if (existingDM?.metadata && 
        Array.isArray(existingDM.metadata.dmMembers) && 
        existingDM.metadata.dmMembers.includes(userId) && 
        existingDM.metadata.dmMembers.includes(targetUserId)) {
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
        name: targetUser.username,
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