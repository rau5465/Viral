const cron = require('node-cron');
const { User, Task, Recharge, sequelize } = require('../models');
const { checkAndApplyBonusMultiplier } = require('../services/bonusService');

// 5.2 Bonus Expiry & Final Check (Every 1 min)
const bonusExpiryJob = async () => {
  try {
    const usersToCheck = await User.findAll({
      where: {
        signup_bonus_multiplied: false,
        bonus_deadline: {
          [sequelize.Sequelize.Op.lte]: new Date(),
        },
      },
      limit: 50,
    });

    for (const user of usersToCheck) {
      // Check one last time before window closed
      await checkAndApplyBonusMultiplier(user.id);
    }
  } catch (err) {
    console.error('Error in bonusExpiryJob:', err.message);
  }
};

// 5.3 Task Expiry (Every 5 mins)
const taskExpiryJob = async () => {
  try {
    const expiredCount = await Task.update(
      { is_active: false },
      {
        where: {
          is_active: true,
          expires_at: {
            [sequelize.Sequelize.Op.ne]: null,
            [sequelize.Sequelize.Op.lte]: new Date(),
          },
        },
      }
    );
    if (expiredCount[0] > 0) {
      console.log(`[Job] Deactivated ${expiredCount[0]} expired tasks.`);
    }
  } catch (err) {
    console.error('Error in taskExpiryJob:', err.message);
  }
};

// 5.4 Recharge Queue Processor (Every 2 mins)
const rechargeQueueProcessor = async () => {
  try {
    const pendingRecharges = await Recharge.findAll({
      where: { status: 'pending' },
      limit: 10,
    });

    for (const recharge of pendingRecharges) {
      recharge.status = 'completed';
      recharge.processed_at = new Date();
      recharge.api_response = {
        operatorRef: `AUTO_OP_${Date.now()}`,
        status: 'SUCCESS',
        note: 'Processed via automated queue worker',
      };
      await recharge.save();
    }
  } catch (err) {
    console.error('Error in rechargeQueueProcessor:', err.message);
  }
};

// 5.5 Fraud Detection Scanner (Every 15 mins)
const fraudDetectionScanner = async () => {
  try {
    // Find IPs with excessive sessions
    const [suspiciousIps] = await sequelize.query(`
      SELECT ip_address, COUNT(DISTINCT user_id) as account_count
      FROM sessions
      WHERE ip_address IS NOT NULL AND created_at >= NOW() - INTERVAL 1 DAY
      GROUP BY ip_address
      HAVING account_count >= 10
    `);

    if (suspiciousIps.length > 0) {
      console.warn(`[AntiFraud] Detected ${suspiciousIps.length} suspicious IP addresses with high registration counts:`, suspiciousIps);
    }
  } catch (err) {
    console.error('Error in fraudDetectionScanner:', err.message);
  }
};

const initCronJobs = () => {
  console.log('⏰ Initializing background cron jobs...');

  // Run bonus check every minute
  cron.schedule('* * * * *', bonusExpiryJob);

  // Run task expiry every 5 minutes
  cron.schedule('*/5 * * * *', taskExpiryJob);

  // Process recharge queue every 2 minutes
  cron.schedule('*/2 * * * *', rechargeQueueProcessor);

  // Run fraud scanner every 15 minutes
  cron.schedule('*/15 * * * *', fraudDetectionScanner);

  console.log('✅ Background cron jobs scheduled successfully.');
};

module.exports = {
  initCronJobs,
  bonusExpiryJob,
  taskExpiryJob,
  rechargeQueueProcessor,
  fraudDetectionScanner,
};
