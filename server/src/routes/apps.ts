import express from 'express';
import { AppService } from '../services/appService';
import { AuthenticatedRequest } from '../types/auth';
import { z } from 'zod';

const router = express.Router();
const appService = new AppService();

const updateAppSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  published: z.boolean().optional()
});

// Get all user apps
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const apps = await appService.getUserApps(userId);
    
    res.json({
      success: true,
      apps: apps.map((app: any) => ({
        id: app.id,
        name: app.name,
        description: app.description,
        status: app.status,
        features: app.features,
        url: app.url,
        published: app.published,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get apps error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch apps',
      message: 'Unable to retrieve your applications'
    });
  }
});

// Get specific app by ID
router.get('/:appId', async (req: AuthenticatedRequest, res) => {
  try {
    const { appId } = req.params;
    const userId = req.user!.userId;
    
    const app = await appService.getAppById(appId, userId);
    
    if (!app) {
      return res.status(404).json({ 
        error: 'App not found',
        message: 'The requested application could not be found'
      });
    }
    
    res.json({
      success: true,
      app
    });
  } catch (error) {
    console.error('Get app error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch app',
      message: 'Unable to retrieve the application'
    });
  }
});

// Update app
router.put('/:appId', async (req: AuthenticatedRequest, res) => {
  try {
    const { appId } = req.params;
    const userId = req.user!.userId;
    const updateData = updateAppSchema.parse(req.body);
    
    const updatedApp = await appService.updateApp(appId, userId, updateData);
    
    if (!updatedApp) {
      return res.status(404).json({ 
        error: 'App not found',
        message: 'The requested application could not be found'
      });
    }
    
    res.json({
      success: true,
      app: updatedApp,
      message: 'App updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors
      });
    }
    
    console.error('Update app error:', error);
    res.status(500).json({ 
      error: 'Failed to update app',
      message: 'Unable to update the application'
    });
  }
});

// Delete app
router.delete('/:appId', async (req: AuthenticatedRequest, res) => {
  try {
    const { appId } = req.params;
    const userId = req.user!.userId;
    
    const deleted = await appService.deleteApp(appId, userId);
    
    if (!deleted) {
      return res.status(404).json({ 
        error: 'App not found',
        message: 'The requested application could not be found'
      });
    }
    
    res.json({
      success: true,
      message: 'App deleted successfully'
    });
  } catch (error) {
    console.error('Delete app error:', error);
    res.status(500).json({ 
      error: 'Failed to delete app',
      message: 'Unable to delete the application'
    });
  }
});

// Publish/unpublish app
router.post('/:appId/publish', async (req: AuthenticatedRequest, res) => {
  try {
    const { appId } = req.params;
    const userId = req.user!.userId;
    
    const app = await appService.togglePublish(appId, userId);
    
    if (!app) {
      return res.status(404).json({ 
        error: 'App not found',
        message: 'The requested application could not be found'
      });
    }
    
    res.json({
      success: true,
      app,
      message: app.published ? 'App published successfully' : 'App unpublished successfully'
    });
  } catch (error) {
    console.error('Publish app error:', error);
    res.status(500).json({ 
      error: 'Failed to publish app',
      message: 'Unable to change publication status'
    });
  }
});

export { router as appRoutes };