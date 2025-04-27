import { Router } from 'express';
import { newsletterService } from '../services/newsletterService';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    await newsletterService.subscribe(email);
    
    res.status(200).json({ 
      success: true,
      message: 'Successfully subscribed to the newsletter'
    });
  } catch (error: any) {
    if (error.message === 'This email is already subscribed to the newsletter') {
      return res.status(409).json({ error: error.message });
    }
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ error: 'Failed to subscribe to newsletter' });
  }
});

// New route to get all subscriptions (admin only)
router.get('/subscriptions', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const subscriptions = await newsletterService.getAllSubscriptions();
    res.status(200).json(subscriptions);
  } catch (error) {
    console.error('Error fetching newsletter subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch newsletter subscriptions' });
  }
});

// Delete subscription route (admin only)
router.delete('/subscriptions/:email', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { email } = req.params;
    await newsletterService.deleteSubscription(email);
    res.status(200).json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Error deleting newsletter subscription:', error);
    res.status(500).json({ error: 'Failed to delete newsletter subscription' });
  }
});

export const newsletterRoutes = router; 