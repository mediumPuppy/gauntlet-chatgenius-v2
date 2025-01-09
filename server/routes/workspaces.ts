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

    // Get all members
    const members = await db.query.workspaceMembers.findMany({
      where: eq(workspaceMembers.workspaceId, workspaceId),
      with: {
        user: true,
      },
    });

    // Format response
    const formattedMembers = members.map(member => ({
      id: member.user.id,
      username: member.user.username,
      email: member.user.email,
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
