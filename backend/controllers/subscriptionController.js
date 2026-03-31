/**
 * Subscription Controller
 * Handles plan subscriptions with UPI QR payment
 */

const pool = require('../config/database');

const UPI_ID = 'mparab046@oksbi';
const UPI_NAME = 'Manthan Parab';

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

// Create order for subscription — return UPI details
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

            // Return UPI payment details
            const refId = 'DISUB' + Date.now() + Math.floor(Math.random() * 1000);

            return res.json({
                success: true,
                data: {
                    upi_id: UPI_ID,
                    upi_name: UPI_NAME,
                    amount: plan.price,
                    ref_id: refId,
                    plan_id: plan.id,
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

// Confirm UPI payment & activate subscription
const verifySubscription = async (req, res) => {
    try {
        const userId = req.userId;
        const { transaction_id, plan_id } = req.body;

        if (!transaction_id || !plan_id) {
            return res.status(400).json({ success: false, message: 'Transaction ID and Plan ID are required' });
        }

        // Validate transaction ID format (12-digit UTR or alphanumeric 8-22 chars)
        const txnId = transaction_id.trim();
        if (!/^[A-Za-z0-9]{8,22}$/.test(txnId)) {
            return res.status(400).json({ success: false, message: 'Invalid Transaction ID. Enter a valid 8-22 character alphanumeric UTR/Transaction ID.' });
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
                 VALUES (?, ?, ?, ?, ?, ?, 'UPI', ?, 'active')`,
                [userId, plan.id, plan.name, plan.price, startDate, endDate, transaction_id]
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
                    transaction_id: transaction_id,
                    status: 'active'
                }
            });
        } catch (error) {
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Verify subscription error:', error);
        res.status(500).json({ success: false, message: 'Subscription confirmation failed' });
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
