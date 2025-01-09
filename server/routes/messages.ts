import { Router } from "express";
import { db } from "@db";
import { messages, channels, workspaceMembers, messageReactions, messageMentions } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// Validation schemas
const createMessageSchema = z.object({
  content: z.object({
    blocks: z.array(z.object({
      type: z.string(),
      content: z.any(),
      metadata: z.any(),
    })),
    formattedText: z.string(),
    rawText: z.string(),
  }),
  parentId: z.number().optional(),
  mentions: z.array(z.object({
    userId: z.number(),
    offset: z.number(),
    length: z.number(),
  })).optional(),
});

const updateMessageSchema = z.object({
  content: z.object({
    blocks: z.array(z.object({
      type: z.string(),
      content: z.any(),
      metadata: z.any(),
    })),
    formattedText: z.string(),
    rawText: z.string(),
  }),
});

// Get messages for a channel
router.get("/api/channels/:channelId/messages", async (req, res) => {
  try {
    const channelId = parseInt(req.params.channelId);
    const userId = 1; // TODO: Replace with actual user ID from auth
    const before = req.query.before ? new Date(req.query.before as string) : new Date();
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    // Get channel to verify workspace access
    const channel = await db.query.channels.findFirst({
      where: eq(channels.id, channelId),
    });

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Verify user has access to the workspace
    const membership = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, channel.workspaceId),
        eq(workspaceMembers.userId, userId)
      ),
    });

    if (!membership) {
      return res.status(403).json({ message: 'Access denied to this channel' });
    }

    // Get messages with related data
    const messageList = await db.query.messages.findMany({
      where: eq(messages.channelId, channelId),
      limit,
      orderBy: desc(messages.createdAt),
      with: {
        author: true,
        mentions: {
          with: {
            user: true,
          },
        },
        reactions: true,
      },
    });

    res.json(messageList.map(msg => ({
      id: msg.id,
      content: msg.content,
      author: {
        id: msg.author.id,
        username: msg.author.username,
        avatar: msg.author.avatar,
      },
      mentions: msg.mentions.map(mention => ({
        user: {
          id: mention.user.id,
          username: mention.user.username,
        },
        offset: mention.mentionOffset,
        length: mention.mentionLength,
      })),
      reactions: msg.reactions,
      createdAt: msg.createdAt,
      isEdited: msg.isEdited,
      editedAt: msg.editedAt,
      parentId: msg.parentId,
      rootMessageId: msg.rootMessageId,
    })));
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Create a new message
router.post("/api/channels/:channelId/messages", async (req, res) => {
  try {
    const channelId = parseInt(req.params.channelId);
    const userId = 1; // TODO: Replace with actual user ID from auth
    const data = createMessageSchema.parse(req.body);

    // Verify channel exists and user has access
    const channel = await db.query.channels.findFirst({
      where: eq(channels.id, channelId),
    });

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Verify user has access to the workspace
    const membership = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, channel.workspaceId),
        eq(workspaceMembers.userId, userId)
      ),
    });

    if (!membership) {
      return res.status(403).json({ message: 'Access denied to this channel' });
    }

    // Create the message
    const [message] = await db.insert(messages)
      .values({
        channelId,
        userId,
        content: data.content,
        parentId: data.parentId,
        rootMessageId: data.parentId, // If it's a reply, use parent as root
      })
      .returning();

    // Add mentions if any
    if (data.mentions && data.mentions.length > 0) {
      await db.insert(messageMentions)
        .values(data.mentions.map(mention => ({
          messageId: message.id,
          userId: mention.userId,
          mentionOffset: mention.offset,
          mentionLength: mention.length,
        })));
    }

    res.status(201).json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid message data', errors: error.errors });
    }
    console.error('Error creating message:', error);
    res.status(500).json({ message: 'Failed to create message' });
  }
});

// Update a message
router.patch("/api/messages/:messageId", async (req, res) => {
  try {
    const messageId = parseInt(req.params.messageId);
    const userId = 1; // TODO: Replace with actual user ID from auth
    const data = updateMessageSchema.parse(req.body);

    // Get message and verify ownership
    const message = await db.query.messages.findFirst({
      where: eq(messages.id, messageId),
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.userId !== userId) {
      return res.status(403).json({ message: 'Can only edit your own messages' });
    }

    // Update the message
    const [updated] = await db.update(messages)
      .set({
        content: data.content,
        isEdited: true,
        editedAt: new Date(),
      })
      .where(eq(messages.id, messageId))
      .returning();

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid message data', errors: error.errors });
    }
    console.error('Error updating message:', error);
    res.status(500).json({ message: 'Failed to update message' });
  }
});

// Add reaction to a message
router.post("/api/messages/:messageId/reactions", async (req, res) => {
  try {
    const messageId = parseInt(req.params.messageId);
    const userId = 1; // TODO: Replace with actual user ID from auth
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ message: 'Emoji is required' });
    }

    // Get existing reaction or create new one
    const existingReaction = await db.query.messageReactions.findFirst({
      where: and(
        eq(messageReactions.messageId, messageId),
        eq(messageReactions.emoji, emoji)
      ),
    });

    if (existingReaction) {
      // Add user to existing reaction if not already reacted
      if (!existingReaction.userIds.includes(userId)) {
        const [updated] = await db.update(messageReactions)
          .set({
            userIds: [...existingReaction.userIds, userId],
          })
          .where(eq(messageReactions.id, existingReaction.id))
          .returning();
        return res.json(updated);
      }
      return res.json(existingReaction);
    }

    // Create new reaction
    const [reaction] = await db.insert(messageReactions)
      .values({
        messageId,
        emoji,
        userIds: [userId],
      })
      .returning();

    res.status(201).json(reaction);
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ message: 'Failed to add reaction' });
  }
});

// Remove reaction from a message
router.delete("/api/messages/:messageId/reactions/:emoji", async (req, res) => {
  try {
    const messageId = parseInt(req.params.messageId);
    const userId = 1; // TODO: Replace with actual user ID from auth
    const { emoji } = req.params;

    const reaction = await db.query.messageReactions.findFirst({
      where: and(
        eq(messageReactions.messageId, messageId),
        eq(messageReactions.emoji, emoji)
      ),
    });

    if (!reaction) {
      return res.status(404).json({ message: 'Reaction not found' });
    }

    if (reaction.userIds.includes(userId)) {
      const updatedUserIds = reaction.userIds.filter(id => id !== userId);
      
      if (updatedUserIds.length === 0) {
        // Delete the reaction if no users left
        await db.delete(messageReactions)
          .where(eq(messageReactions.id, reaction.id));
      } else {
        // Update the reaction with removed user
        await db.update(messageReactions)
          .set({
            userIds: updatedUserIds,
          })
          .where(eq(messageReactions.id, reaction.id));
      }
    }

    res.json({ message: 'Reaction removed successfully' });
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({ message: 'Failed to remove reaction' });
  }
});

export default router;
