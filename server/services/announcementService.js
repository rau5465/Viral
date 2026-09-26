const { Announcement, sequelize } = require('../models');

const getActiveAnnouncements = async () => {
  const now = new Date();
  return await Announcement.findAll({
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
};

module.exports = {
  getActiveAnnouncements,
};
