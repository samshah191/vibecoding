import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../types/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all projects for a user
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }
    const { 
      page = 1, 
      limit = 10, 
      search, 
      isPublic, 
      sortBy = 'updatedAt', 
      sortOrder = 'desc' 
    } = req.query as any;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {
      OR: [
        { userId },
        { collaborators: { some: { userId, status: 'accepted' } } },
        ...(isPublic !== false ? [{ isPublic: true }] : [])
      ]
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        parentProject: {
          select: { id: true, name: true, user: { select: { name: true } } }
        },
        _count: {
          select: {
            versions: true,
            collaborators: true,
            forks: true,
            exports: true
          }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take
    });

    const total = await prisma.project.count({ where });

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch projects' });
  }
});

// Get a specific project
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [
          { userId },
          { collaborators: { some: { userId, status: 'accepted' } } },
          { isPublic: true }
        ]
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        parentProject: {
          select: { id: true, name: true, user: { select: { name: true } } }
        },
        versions: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          },
          orderBy: { version: 'desc' }
        },
        collaborators: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
            inviter: { select: { id: true, name: true, email: true } }
          }
        },
        _count: {
          select: { forks: true, exports: true }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Increment view count if not the owner
    if (project.userId !== userId) {
      await prisma.project.update({
        where: { id },
        data: { viewCount: { increment: 1 } }
      });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch project' });
  }
});

// Create a new project
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }
    const { name, description, appData, thumbnail, isPublic = false } = req.body;

    if (!name || !appData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name and app data are required' 
      });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        appData: JSON.stringify(appData),
        thumbnail,
        isPublic,
        userId
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    });

    // Create initial version
    await prisma.projectVersion.create({
      data: {
        version: 1,
        name: 'Initial version',
        appData: JSON.stringify(appData),
        changes: 'Project created',
        projectId: project.id,
        userId
      }
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, error: 'Failed to create project' });
  }
});

// Update a project
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }
    const { name, description, appData, thumbnail, isPublic } = req.body;

    // Check if user owns the project
    const existingProject = await prisma.project.findFirst({
      where: { id, userId }
    });

    if (!existingProject) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found or access denied' 
      });
    }

    const updateData: any = { updatedAt: new Date() };
    let createNewVersion = false;

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    
    if (appData !== undefined) {
      updateData.appData = JSON.stringify(appData);
      createNewVersion = true;
    }

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    });

    // Create new version if app data changed
    if (createNewVersion) {
      const latestVersion = await prisma.projectVersion.findFirst({
        where: { projectId: id },
        orderBy: { version: 'desc' }
      });

      await prisma.projectVersion.create({
        data: {
          version: (latestVersion?.version || 0) + 1,
          name: `Version ${(latestVersion?.version || 0) + 1}`,
          appData: JSON.stringify(appData),
          changes: 'Project updated',
          projectId: id,
          userId
        }
      });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ success: false, error: 'Failed to update project' });
  }
});

// Delete a project
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const project = await prisma.project.findFirst({
      where: { id, userId }
    });

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found or access denied' 
      });
    }

    await prisma.project.delete({ where: { id } });

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ success: false, error: 'Failed to delete project' });
  }
});

// Get project versions
router.get('/:id/versions', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    // Check access to project
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

    const versions = await prisma.projectVersion.findMany({
      where: { projectId: id },
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { version: 'desc' }
    });

    res.json({ success: true, data: versions });
  } catch (error) {
    console.error('Error fetching project versions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch versions' });
  }
});

// Create a new version
router.post('/:id/versions', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }
    const { name, description, appData, changes } = req.body;

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

    if (!appData) {
      return res.status(400).json({ 
        success: false, 
        error: 'App data is required' 
      });
    }

    const latestVersion = await prisma.projectVersion.findFirst({
      where: { projectId: id },
      orderBy: { version: 'desc' }
    });

    const newVersionNumber = (latestVersion?.version || 0) + 1;

    const version = await prisma.projectVersion.create({
      data: {
        version: newVersionNumber,
        name: name || `Version ${newVersionNumber}`,
        description,
        appData: JSON.stringify(appData),
        changes,
        projectId: id,
        userId
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    // Update project with latest app data
    await prisma.project.update({
      where: { id },
      data: { 
        appData: JSON.stringify(appData),
        updatedAt: new Date()
      }
    });

    res.status(201).json({ success: true, data: version });
  } catch (error) {
    console.error('Error creating version:', error);
    res.status(500).json({ success: false, error: 'Failed to create version' });
  }
});

// Restore to a specific version
router.post('/:id/versions/:versionId/restore', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id, versionId } = req.params;
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

    const version = await prisma.projectVersion.findFirst({
      where: { id: versionId, projectId: id }
    });

    if (!version) {
      return res.status(404).json({ success: false, error: 'Version not found' });
    }

    // Update project with version data
    await prisma.project.update({
      where: { id },
      data: { 
        appData: version.appData,
        updatedAt: new Date()
      }
    });

    // Create a new version indicating restoration
    const latestVersion = await prisma.projectVersion.findFirst({
      where: { projectId: id },
      orderBy: { version: 'desc' }
    });

    const newVersionNumber = (latestVersion?.version || 0) + 1;

    const restoredVersion = await prisma.projectVersion.create({
      data: {
        version: newVersionNumber,
        name: `Restored to v${version.version}`,
        appData: version.appData,
        changes: `Restored to version ${version.version}`,
        projectId: id,
        userId
      }
    });

    res.json({ success: true, data: restoredVersion });
  } catch (error) {
    console.error('Error restoring version:', error);
    res.status(500).json({ success: false, error: 'Failed to restore version' });
  }
});

export default router;