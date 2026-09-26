const { Announcement, sequelize } = require('../models');
const { getOrSet, del } = require('../config/redis');

const ANNOUNCEMENTS_CACHE_KEY = 'cache:announcements:active';

const invalidateAnnouncementsCache = async () => {
  try {
    await del(ANNOUNCEMENTS_CACHE_KEY);
  } catch (err) {
    console.warn('[invalidateAnnouncementsCache error]', err.message);
  }
};

const getActiveAnnouncements = async () => {
  return await getOrSet(
    ANNOUNCEMENTS_CACHE_KEY,
    async () => {
      const now = new Date();
      const items = await Announcement.findAll({
        where: {
          is_active: true,
          [sequelize.Sequelize.Op.or]: [
            { expires_at: null },
            { expires_at: { [sequelize.Sequelize.Op.gt]: now } },
          ],
        },
        order: [['created_at', 'DESC']],
        limit: 5,
      });
      return items.map((a) => a.toJSON());
    },
    120 // 2 minutes TTL
  );
};

module.exports = {
  getActiveAnnouncements,
  invalidateAnnouncementsCache,
};
