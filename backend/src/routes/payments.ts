
import express from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-01-27.acacia', // Use latest API version
});

// Create Checkout Session
router.post('/create-checkout-session', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.userId;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: user.email,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'StudyOS Pro Subscription',
                            description: 'Unlock unlimited AI, analytics, and study tools.',
                        },
                        unit_amount: 499, // $4.99
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancel`,
            metadata: {
                userId: userId,
            },
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Stripe Error:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

// Webhook Handler (Must be raw body)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        if (!endpointSecret || !sig) throw new Error('Missing webhook secret or signature');
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.userId;

            if (userId) {
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        subscriptionStatus: 'PRO',
                        stripeCustomerId: session.customer as string,
                        subscriptionId: session.subscription as string,
                    },
                });
                console.log(`User ${userId} upgraded to PRO`);
            }
            break;

        case 'customer.subscription.deleted':
            const sub = event.data.object as Stripe.Subscription;
            // Find user by subscription ID and downgrade
            // In a real app, you'd verify the customer ID too
            // For simplicity, we assume one sub per user or search by stripeCustomerId
            const customerId = sub.customer as string;
            await prisma.user.updateMany({
                where: { stripeCustomerId: customerId },
                data: { subscriptionStatus: 'FREE' }
            });
            console.log(`Subscription deleted for customer ${customerId}`);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

export const paymentsRouter = router;
