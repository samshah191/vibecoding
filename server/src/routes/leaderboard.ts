import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get creator leaderboard
router.get('/creators', async (req, res) => {
  try {
    const period = req.query.period as string || 'all-time';
    const limit = parseInt(req.query.limit as string) || 50;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        apps: {
          where: { published: true },
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    const leaderboard = users
      .map(user => ({
        user,
        appCount: user.apps.length,
        rank: 0,
        score: user.apps.length
      }))
      .sort((a, b) => b.appCount - a.appCount)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

    res.json({
      success: true,
      leaderboard,
      period
    });
  } catch (error) {
    console.error('Get creator leaderboard error:', error);
    res.status(500).json({
      error: 'Failed to fetch leaderboard',
      message: 'Unable to retrieve creator leaderboard'
    });
  }
});

// Get app leaderboard
router.get('/apps', async (req, res) => {
  try {
    const period = req.query.period as string || 'all-time';
    const limit = parseInt(req.query.limit as string) || 50;

    const apps = await prisma.app.findMany({
      where: { published: true },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    const leaderboard = apps.map((app, index) => ({
      app,
      rank: index + 1,
      score: apps.length - index
    }));

    res.json({
      success: true,
      leaderboard,
      period
    });
  } catch (error) {
    console.error('Get app leaderboard error:', error);
    res.status(500).json({
      error: 'Failed to fetch app leaderboard',
      message: 'Unable to retrieve app leaderboard'
    });
  }
});

// Get discovery feed
router.get('/discovery', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy as string || 'recent';

    const apps = await prisma.app.findMany({
      where: { published: true },
      select: {
        id: true,
        name: true,
        description: true,
        features: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.app.count({
      where: { published: true }
    });

    res.json({
      success: true,
      apps,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      sortBy
    });
  } catch (error) {
    console.error('Get discovery feed error:', error);
    res.status(500).json({
      error: 'Failed to fetch discovery feed',
      message: 'Unable to retrieve discovery feed'
    });
  }
});

// Get badges
router.get('/badges', async (req, res) => {
  try {
    const badges = [
      {
        id: 'first-app',
        name: 'First Steps',
        description: 'Created your first app',
        icon: '🎯',
        color: '#10B981',
        type: 'milestone'
      },
      {
        id: 'prolific-creator',
        name: 'Prolific Creator',
        description: 'Created 10 apps',
        icon: '🚀',
        color: '#3B82F6',
        type: 'achievement'
      },
      {
        id: 'app-master',
        name: 'App Master',
        description: 'Created 50 apps',
        icon: '👑',
        color: '#F59E0B',
        type: 'achievement'
      }
    ];

    res.json({
      success: true,
      badges
    });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({
      error: 'Failed to fetch badges',
      message: 'Unable to retrieve badge information'
    });
  }
});

// Get user statistics
router.get('/users/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        apps: {
          where: { published: true },
          select: { id: true, createdAt: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found'
      });
    }

    const usersBeforeThis = await prisma.user.count({
      where: {
        createdAt: { lt: user.createdAt }
      }
    });

    const stats = {
      userId: user.id,
      name: user.name,
      memberSince: user.createdAt,
      totalApps: user.apps.length,
      totalLikes: 0,
      totalFollowers: 0,
      totalFollowing: 0,
      joinRank: usersBeforeThis + 1,
      achievements: {
        firstApp: user.apps.length >= 1,
        prolificCreator: user.apps.length >= 10,
        appMaster: user.apps.length >= 50,
        earlyAdopter: (usersBeforeThis + 1) <= 100
      }
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch user statistics',
      message: 'Unable to retrieve user statistics'
    });
  }
});

export { router as leaderboardRoutes };