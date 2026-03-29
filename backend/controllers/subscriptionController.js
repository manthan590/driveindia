/**
 * Subscription Controller
 * Handles plan subscriptions with Razorpay
 */

const crypto = require('crypto');
const pool = require('../config/database');
const { getRazorpay } = require('../config/razorpay');

// Get all plans
const getPlans = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const [plans] = await connection.query('SELECT * FROM plans ORDER BY price ASC');
            connection.release();
            return res.json({ success: true, data: plans });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch plans' });
    }
};

// Create Razorpay order for subscription
const createSubscriptionOrder = async (req, res) => {
    try {
        const userId = req.userId;
        const { plan_id } = req.body;

        if (!plan_id) {
            return res.status(400).json({ success: false, message: 'Plan ID is required' });
        }

        const connection = await pool.getConnection();
        try {
            const [plans] = await connection.query('SELECT * FROM plans WHERE id = ?', [plan_id]);
            if (plans.length === 0) {
                connection.release();
                return res.status(404).json({ success: false, message: 'Plan not found' });
            }

            const plan = plans[0];

            // Check for existing active subscription
            const [existing] = await connection.query(
                "SELECT id FROM subscriptions WHERE user_id = ? AND status = 'active' AND end_date > NOW()",
                [userId]
            );
            if (existing.length > 0) {
                connection.release();
                return res.status(400).json({ success: false, message: 'You already have an active subscription. Cancel it first.' });
            }

            connection.release();

            // Free plan — activate directly
            if (plan.price === 0) {
                return await activateFreePlan(userId, plan, res);
            }

            // Create Razorpay order
            const order = await getRazorpay().orders.create({
                amount: Math.round(plan.price * 100),
                currency: 'INR',
                receipt: `sub_${plan_id}_${userId}`,
                notes: { plan_id: String(plan_id), user_id: String(userId), plan_name: plan.name }
            });

            return res.json({
                success: true,
                data: {
                    order_id: order.id,
                    amount: order.amount,
                    currency: order.currency,
                    key_id: process.env.RAZORPAY_KEY_ID,
                    plan_name: plan.name
                }
            });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Create subscription order error:', error);
        res.status(500).json({ success: false, message: 'Failed to create subscription order' });
    }
};

// Helper: activate free plan
async function activateFreePlan(userId, plan, res) {
    const connection = await pool.getConnection();
    try {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.duration_days);

        const [result] = await connection.query(
            `INSERT INTO subscriptions (user_id, plan_id, plan_name, amount, start_date, end_date, payment_method, transaction_id, status)
             VALUES (?, ?, ?, 0, ?, ?, 'Free', ?, 'active')`,
            [userId, plan.id, plan.name, startDate, endDate, 'FREE_' + Date.now()]
        );
        connection.release();

        return res.status(201).json({
            success: true,
            message: `Subscribed to ${plan.name} successfully!`,
            data: { id: result.insertId, plan_name: plan.name, amount: 0, start_date: startDate, end_date: endDate, status: 'active' }
        });
    } catch (error) {
        connection.release();
        throw error;
    }
}

// Verify Razorpay payment & activate subscription
const verifySubscription = async (req, res) => {
    try {
        const userId = req.userId;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_id } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan_id) {
            return res.status(400).json({ success: false, message: 'Missing payment verification data' });
        }

        // Verify signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Payment verification failed — invalid signature' });
        }

        const connection = await pool.getConnection();
        try {
            const [plans] = await connection.query('SELECT * FROM plans WHERE id = ?', [plan_id]);
            if (plans.length === 0) {
                connection.release();
                return res.status(404).json({ success: false, message: 'Plan not found' });
            }

            const plan = plans[0];
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + plan.duration_days);

            const [result] = await connection.query(
                `INSERT INTO subscriptions (user_id, plan_id, plan_name, amount, start_date, end_date, payment_method, transaction_id, status)
                 VALUES (?, ?, ?, ?, ?, ?, 'Razorpay', ?, 'active')`,
                [userId, plan.id, plan.name, plan.price, startDate, endDate, razorpay_payment_id]
            );

            connection.release();

            return res.status(201).json({
                success: true,
                message: `Subscribed to ${plan.name} successfully!`,
                data: {
                    id: result.insertId,
                    plan_name: plan.name,
                    amount: plan.price,
                    start_date: startDate,
                    end_date: endDate,
                    transaction_id: razorpay_payment_id,
                    status: 'active'
                }
            });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Verify subscription error:', error);
        res.status(500).json({ success: false, message: 'Subscription verification failed' });
    }
};

// Get user's subscription
const getMySubscription = async (req, res) => {
    try {
        const userId = req.userId;
        const connection = await pool.getConnection();
        try {
            const [subs] = await connection.query(
                `SELECT s.*, p.features, p.discount_percent, p.duration_type 
                 FROM subscriptions s JOIN plans p ON s.plan_id = p.id 
                 WHERE s.user_id = ? ORDER BY s.created_at DESC LIMIT 1`,
                [userId]
            );
            connection.release();

            if (subs.length === 0) {
                return res.json({ success: true, data: null });
            }

            return res.json({ success: true, data: subs[0] });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Get subscription error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch subscription' });
    }
};

// Cancel subscription
const cancelSubscription = async (req, res) => {
    try {
        const userId = req.userId;
        const connection = await pool.getConnection();
        try {
            const [result] = await connection.query(
                "UPDATE subscriptions SET status = 'cancelled' WHERE user_id = ? AND status = 'active'",
                [userId]
            );
            connection.release();

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'No active subscription found' });
            }

            return res.json({ success: true, message: 'Subscription cancelled' });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({ success: false, message: 'Failed to cancel subscription' });
    }
};

module.exports = { getPlans, createSubscriptionOrder, verifySubscription, getMySubscription, cancelSubscription };
