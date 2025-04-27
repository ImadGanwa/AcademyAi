import { Newsletter } from '../models/Newsletter';

export const newsletterService = {
  async subscribe(email: string) {
    try {
      const existingSubscription = await Newsletter.findOne({ email: email.toLowerCase() });
      
      if (existingSubscription) {
        throw new Error('This email is already subscribed to the newsletter');
      }

      const subscription = new Newsletter({ email: email.toLowerCase() });
      await subscription.save();
      
      return { success: true };
    } catch (error: any) {
      if (error.code === 11000) { // MongoDB duplicate key error code
        throw new Error('This email is already subscribed to the newsletter');
      }
      throw error;
    }
  },

  async isSubscribed(email: string): Promise<boolean> {
    const subscription = await Newsletter.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    });
    return !!subscription;
  },

  async getAllSubscriptions() {
    return Newsletter.find({ isActive: true })
      .sort({ subscribedAt: -1 })
      .select('email subscribedAt');
  },

  async deleteSubscription(email: string) {
    const result = await Newsletter.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isActive: false },
      { new: true }
    );

    if (!result) {
      throw new Error('Subscription not found');
    }

    return { success: true };
  }
}; 