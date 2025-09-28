import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../types/auth';

const router = Router();
const prisma = new PrismaClient();

// Get project collaborators
router.get('/:id/collaborators', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    // Check if user has access to project
    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [
          { userId },
          { collaborators: { some: { userId, status: 'accepted' } } }
        ]
      }
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const collaborators = await prisma.projectCollaborator.findMany({
      where: { projectId: id },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        inviter: { select: { id: true, name: true, email: true } }
      }
    });

    res.json({ success: true, data: collaborators });
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch collaborators' });
  }
});

// Invite collaborator to project
router.post('/:id/collaborators', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }
    const { email, role = 'viewer' } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    // Check if user owns the project
    const project = await prisma.project.findFirst({
      where: { id, userId }
    });

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found or access denied' 
      });
    }

    // Find user by email
    const collaboratorUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!collaboratorUser) {
      return res.status(404).json({ 
        success: false, 
        error: 'User with this email not found' 
      });
    }

    // Check if already a collaborator
    const existingCollaborator = await prisma.projectCollaborator.findUnique({
      where: { 
        projectId_userId: {
          projectId: id,
          userId: collaboratorUser.id
        }
      }
    });

    if (existingCollaborator) {
      return res.status(400).json({ 
        success: false, 
        error: 'User is already a collaborator' 
      });
    }

    // Create collaborator invitation
    const collaborator = await prisma.projectCollaborator.create({
      data: {
        projectId: id,
        userId: collaboratorUser.id,
        role,
        invitedBy: userId,
        status: 'pending'
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        inviter: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(201).json({ success: true, data: collaborator });
  } catch (error) {
    console.error('Error inviting collaborator:', error);
    res.status(500).json({ success: false, error: 'Failed to invite collaborator' });
  }
});

// Update collaborator status (accept/decline invitation)
router.put('/:id/collaborators/:collaboratorId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id, collaboratorId } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }
    const { status } = req.body;

    // Check if this is the invited user
    const collaborator = await prisma.projectCollaborator.findUnique({
      where: { id: collaboratorId }
    });

    if (!collaborator || collaborator.userId !== userId) {
      return res.status(404).json({ 
        success: false, 
        error: 'Collaborator not found or access denied' 
      });
    }

    // Check if project exists and user has access
    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [
          { userId },
          { collaborators: { some: { userId, status: 'accepted' } } }
        ]
      }
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const updatedCollaborator = await prisma.projectCollaborator.update({
      where: { id: collaboratorId },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        inviter: { select: { id: true, name: true, email: true } }
      }
    });

    res.json({ success: true, data: updatedCollaborator });
  } catch (error) {
    console.error('Error updating collaborator:', error);
    res.status(500).json({ success: false, error: 'Failed to update collaborator' });
  }
});

// Remove collaborator from project
router.delete('/:id/collaborators/:collaboratorId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id, collaboratorId } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    // Check if user owns the project
    const project = await prisma.project.findFirst({
      where: { id, userId }
    });

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found or access denied' 
      });
    }

    // Check if collaborator exists
    const collaborator = await prisma.projectCollaborator.findUnique({
      where: { id: collaboratorId }
    });

    if (!collaborator) {
      return res.status(404).json({ success: false, error: 'Collaborator not found' });
    }

    await prisma.projectCollaborator.delete({
      where: { id: collaboratorId }
    });

    res.json({ success: true, message: 'Collaborator removed successfully' });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    res.status(500).json({ success: false, error: 'Failed to remove collaborator' });
  }
});

// Fork (duplicate) a project
router.post('/:id/fork', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }
    const { name, description } = req.body;

    // Check if project exists and is public or user has access
    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [
          { isPublic: true },
          { userId },
          { collaborators: { some: { userId, status: 'accepted' } } }
        ]
      }
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Create forked project
    const forkedProject = await prisma.project.create({
      data: {
        name: name || `${project.name} (Fork)`,
        description: description || project.description,
        appData: project.appData,
        thumbnail: project.thumbnail,
        isPublic: false,
        userId,
        parentProjectId: project.id
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        parentProject: {
          select: { id: true, name: true, user: { select: { name: true } } }
        }
      }
    });

    // Increment fork count on original project
    await prisma.project.update({
      where: { id: project.id },
      data: { forkCount: { increment: 1 } }
    });

    // Create initial version for fork
    await prisma.projectVersion.create({
      data: {
        version: 1,
        name: 'Forked version',
        appData: project.appData,
        changes: 'Project forked',
        projectId: forkedProject.id,
        userId
      }
    });

    res.status(201).json({ success: true, data: forkedProject });
  } catch (error) {
    console.error('Error forking project:', error);
    res.status(500).json({ success: false, error: 'Failed to fork project' });
  }
});

// Export project data
router.post('/:id/export', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }
    const { type, options } = req.body;

    if (!type) {
      return res.status(400).json({ success: false, error: 'Export type is required' });
    }

    // Check if user has access to project
    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [
          { userId },
          { collaborators: { some: { userId, status: 'accepted' } } },
          { isPublic: true }
        ]
      }
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Create export record
    const exportRecord = await prisma.projectExport.create({
      data: {
        projectId: id,
        userId,
        exportType: type,
        exportData: JSON.stringify({
          type,
          options,
          exportedAt: new Date(),
          projectName: project.name
        })
      }
    });

    // Return export data
    res.json({ 
      success: true, 
      data: {
        exportId: exportRecord.id,
        type,
        projectData: JSON.parse(project.appData),
        projectName: project.name,
        exportedAt: exportRecord.createdAt
      }
    });
  } catch (error) {
    console.error('Error exporting project:', error);
    res.status(500).json({ success: false, error: 'Failed to export project' });
  }
});

export default router;