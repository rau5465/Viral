const crypto = require('crypto');
const { User } = require('../models');

const generateReferralCode = async (prefix = 'VR') => {
  let isUnique = false;
  let code = '';

  while (!isUnique) {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    code = `${prefix}${randomHex}`;
    try {
      const existing = await User.findOne({ where: { referral_code: code } });
      if (!existing) {
        isUnique = true;
      }
    } catch (_err) {
      isUnique = true;
    }
  }

  return code;
};

module.exports = {
  generateReferralCode,
};
