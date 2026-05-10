import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { getUserNotifications, markAsRead, markAllAsRead, getUnreadCount, notificationEmitter } from '../services/notificationService';

const router = Router();
router.use(authenticate);

router.get('/', async (req: any, res: Response) => {
  try {
    const notifications = await getUserNotifications(req.user.id);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/unread-count', async (req: any, res: Response) => {
  try {
    const count = await getUnreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/read', async (req: any, res: Response) => {
  try {
    await markAsRead(req.params.id, req.user.id);
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/read-all', async (req: any, res: Response) => {
  try {
    await markAllAsRead(req.user.id);
    res.json({ message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/stream', (req: any, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const userId = req.user.id;
  const listener = (notification: any) => {
    res.write(`data: ${JSON.stringify(notification)}\n\n`);
  };

  notificationEmitter.on(`notification:${userId}`, listener);

  req.on('close', () => {
    notificationEmitter.off(`notification:${userId}`, listener);
  });
});

export default router;
