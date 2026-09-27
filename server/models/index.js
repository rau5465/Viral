const { sequelize } = require('../config/db');
const User = require('./User');
const Referral = require('./Referral');
const Task = require('./Task');
const TaskCompletion = require('./TaskCompletion');
const Transaction = require('./Transaction');
const Recharge = require('./Recharge');
const Announcement = require('./Announcement');
const OtpCode = require('./OtpCode');
const Session = require('./Session');
const AdminLog = require('./AdminLog');
const PartnerChannel = require('./PartnerChannel');
const UserYouTubeAccount = require('./UserYouTubeAccount');
const UserYouTubeSubscription = require('./UserYouTubeSubscription');
const ContactMessage = require('./ContactMessage');
const GameRoll = require('./GameRoll');

// 1. User <-> Referral
User.hasMany(Referral, { foreignKey: 'referrer_id', as: 'referredUsers' });
User.hasMany(Referral, { foreignKey: 'referred_user_id', as: 'referredByRecords' });
Referral.belongsTo(User, { foreignKey: 'referrer_id', as: 'referrer' });
Referral.belongsTo(User, { foreignKey: 'referred_user_id', as: 'referredUser' });

// 2. User <-> Task (creator)
User.hasMany(Task, { foreignKey: 'created_by', as: 'createdTasks' });
Task.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// 3. User <-> TaskCompletion <-> Task
User.hasMany(TaskCompletion, { foreignKey: 'user_id', as: 'taskCompletions' });
TaskCompletion.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Task.hasMany(TaskCompletion, { foreignKey: 'task_id', as: 'completions' });
TaskCompletion.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });

// 4. User <-> Transaction
User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 5. User <-> Recharge
User.hasMany(Recharge, { foreignKey: 'user_id', as: 'recharges' });
Recharge.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 6. User <-> Announcement (creator)
User.hasMany(Announcement, { foreignKey: 'created_by', as: 'createdAnnouncements' });
Announcement.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// 7. User <-> Session
User.hasMany(Session, { foreignKey: 'user_id', as: 'sessions' });
Session.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 8. User <-> AdminLog
User.hasMany(AdminLog, { foreignKey: 'admin_id', as: 'adminLogs' });
AdminLog.belongsTo(User, { foreignKey: 'admin_id', as: 'admin' });

// 9. User self-referral link
User.belongsTo(User, { foreignKey: 'referred_by', as: 'upline' });

// 10. User <-> UserYouTubeAccount (1-to-1)
User.hasOne(UserYouTubeAccount, { foreignKey: 'user_id', as: 'youtubeAccount' });
UserYouTubeAccount.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 11. User <-> PartnerChannel (Partner can manage multiple channels)
User.hasMany(PartnerChannel, { foreignKey: 'partner_id', as: 'partnerChannels' });
PartnerChannel.belongsTo(User, { foreignKey: 'partner_id', as: 'partner' });

// 12. Task <-> PartnerChannel (Optional linkage to tasks)
Task.hasOne(PartnerChannel, { foreignKey: 'task_id', as: 'partnerChannel' });
PartnerChannel.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });

// 13. User <-> UserYouTubeSubscription
User.hasMany(UserYouTubeSubscription, { foreignKey: 'user_id', as: 'youtubeSubscriptions' });
UserYouTubeSubscription.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 14. PartnerChannel <-> UserYouTubeSubscription
PartnerChannel.hasMany(UserYouTubeSubscription, { foreignKey: 'partner_channel_id', as: 'userSubscriptions' });
UserYouTubeSubscription.belongsTo(PartnerChannel, { foreignKey: 'partner_channel_id', as: 'partnerChannel' });

// 12. User <-> GameRoll (Multiply Credits HI-LO Game)
User.hasMany(GameRoll, { foreignKey: 'user_id', as: 'gameRolls' });
GameRoll.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Referral,
  Task,
  TaskCompletion,
  Transaction,
  Recharge,
  Announcement,
  OtpCode,
  Session,
  AdminLog,
  PartnerChannel,
  UserYouTubeAccount,
  UserYouTubeSubscription,
  ContactMessage,
  GameRoll,
};
