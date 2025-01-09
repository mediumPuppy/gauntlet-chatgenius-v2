import type { Express } from "express";
import { createServer, type Server } from "http";
import channelRoutes from "./routes/channels";
import messageRoutes from "./routes/messages";
import workspaceRoutes from "./routes/workspaces";
import { db } from "@db";
import { workspaces, workspaceMembers, users } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// Keep existing workspace validation schemas
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

export function registerRoutes(app: Express): Server {
  // Register the route handlers
  app.use(channelRoutes);
  app.use(messageRoutes);
  app.use(workspaceRoutes);

  // Get all workspaces for the current user
  app.get("/api/workspaces", async (req, res) => {
    try {
      const userId = 1; // TODO: Replace with actual user ID from auth

      const workspaceList = await db
        .select({
          workspace: {
            id: workspaces.id,
            name: workspaces.name,
            settings: workspaces.settings,
          },
          membership: {
            role: workspaceMembers.role,
          },
          owner: {
            id: users.id,
            username: users.username,
          },
        })
        .from(workspaceMembers)
        .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
        .innerJoin(users, eq(users.id, workspaces.ownerId))
        .where(eq(workspaceMembers.userId, userId));

      const response = workspaceList.map((item) => ({
        id: item.workspace.id,
        name: item.workspace.name,
        role: item.membership.role,
        memberCount: 0, // TODO: Add count query
        isAdmin: item.membership.role === 'owner' || item.membership.role === 'admin',
        settings: item.workspace.settings,
        owner: {
          id: item.owner.id,
          username: item.owner.username,
        },
      }));

      res.json(response);
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
        settings: data.settings || {},
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
          username: 'currentuser', // TODO: Get actual username
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

  // Get workspace details
  app.get("/api/workspaces/:id", async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.id);
      const userId = 1; // TODO: Replace with actual user ID from auth

      // Get workspace data with owner
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

      res.json({
        id: workspace.id,
        name: workspace.name,
        stats: {
          members: workspace.members.length,
          channels: 0, // TODO: Add channel count
          announcements: 0, // TODO: Add announcements count
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
      });
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

  const httpServer = createServer(app);
  return httpServer;
}