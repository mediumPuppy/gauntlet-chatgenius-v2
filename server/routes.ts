import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { workspaces, workspaceMembers, users } from "@db/schema";
import { eq, and } from "drizzle-orm";

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

  // Switch active workspace
  app.post("/api/workspaces/switch", async (req, res) => {
    try {
      const { workspaceId } = req.body;
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

      // Store active workspace in session
      if (req.session) {
        req.session.activeWorkspaceId = workspaceId;
      }

      res.json({ 
        message: 'Successfully switched workspace',
        workspace: {
          id: membership.workspace.id,
          name: membership.workspace.name,
          role: membership.role,
        }
      });
    } catch (error) {
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

  const httpServer = createServer(app);
  return httpServer;
}