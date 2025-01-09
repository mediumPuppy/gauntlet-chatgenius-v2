import { Router } from "express";
import { db } from "@db";
import { workspaces, workspaceMembers, users } from "@db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

// Get workspace members
router.get("/api/workspaces/:workspaceId/members", async (req, res) => {
  try {
    const workspaceId = parseInt(req.params.workspaceId);
    const currentUserId = 1; // TODO: Replace with actual user ID from auth

    // Verify user has access to workspace
    const membership = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, currentUserId)
      ),
    });

    if (!membership) {
      return res.status(403).json({ message: 'Access denied to this workspace' });
    }

    // Get all members with their user information, filtered by workspace
    const members = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        role: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(users.id, workspaceMembers.userId))
      .where(eq(workspaceMembers.workspaceId, workspaceId));

    console.log('Workspace members query result:', {
      workspaceId,
      memberCount: members.length,
      members: members.map(m => ({ id: m.id, username: m.username }))
    });

    // Format response with status
    const formattedMembers = members.map(member => ({
      id: member.id,
      username: member.username,
      displayName: member.displayName || member.username,
      role: member.role,
      status: {
        text: "Online", // TODO: Implement real status
        isOnline: true,
      },
    }));

    res.json(formattedMembers);
  } catch (error) {
    console.error('Error fetching workspace members:', error);
    res.status(500).json({ message: 'Failed to fetch workspace members' });
  }
});

export default router;