const bcrypt = require('bcryptjs');
const { User, Referral, Transaction, Session, OtpCode, sequelize } = require('../models');
const { signToken, signRefreshToken, verifyRefreshToken } = require('../utils/token');
const { generateReferralCode } = require('../utils/referralCode');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Register New User
const register = asyncHandler(async (req, res, next) => {
  const { full_name, mobile, email, password, referral_code } = req.body;

  if (!full_name || !mobile || !email || !password) {
    return next(new AppError('Please provide full name, mobile number, email and password.', 400));
  }

  // Check if mobile or email exists
  const existingUser = await User.findOne({
    where: {
      [sequelize.Sequelize.Op.or]: [{ email }, { mobile }],
    },
  });

  if (existingUser) {
    if (existingUser.email === email) {
      return next(new AppError('An account with this email already exists.', 400));
    }
    return next(new AppError('An account with this mobile number already exists.', 400));
  }

  // Validate referrer if referral code provided
  let referrer = null;
  if (referral_code) {
    referrer = await User.findOne({
      where: { referral_code: referral_code.trim().toUpperCase() },
    });
  }

  const t = await sequelize.transaction();

  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const userReferralCode = await generateReferralCode('VR');

    // 2-hour bonus window
    const bonusDeadline = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const signupBonus = parseInt(process.env.BASE_SIGNUP_BONUS, 10) || 25;

    const newUser = await User.create(
      {
        full_name,
        mobile,
        email,
        password_hash,
        referral_code: userReferralCode,
        referred_by: referrer ? referrer.id : null,
        credit_balance: signupBonus,
        total_earned: signupBonus,
        bonus_deadline: bonusDeadline,
        role: 'user',
      },
      { transaction: t }
    );

    // If referred by someone, record referral
    if (referrer) {
      await Referral.create(
        {
          referrer_id: referrer.id,
          referred_user_id: newUser.id,
          status: 'active',
          credits_awarded: 0,
        },
        { transaction: t }
      );
    }

    // Record signup credit transaction
    await Transaction.create(
      {
        user_id: newUser.id,
        type: 'credit',
        category: 'signup_bonus',
        amount: signupBonus,
        balance_after: signupBonus,
        description:
          'Welcome bonus! Refer 2 friends within 2 hours to 4x this bonus to 100 credits.',
        reference_id: newUser.id,
      },
      { transaction: t }
    );

    // Create session
    const token = signToken(newUser.id, newUser.role);
    const refreshToken = signRefreshToken(newUser.id);
    const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await Session.create(
      {
        user_id: newUser.id,
        token: refreshToken,
        ip_address: req.ip || req.headers['x-forwarded-for'] || null,
        user_agent: req.headers['user-agent'] || null,
        expires_at: sessionExpiresAt,
      },
      { transaction: t }
    );

    await t.commit();

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully! 25 bonus credits added.',
      token,
      refreshToken,
      user: newUser.toJSON(),
      bonus: {
        deadline: bonusDeadline,
        hoursRemaining: 2,
        targetReferrals: 2,
      },
    });
  } catch (error) {
    await t.rollback();
    return next(error);
  }
});

// Login User
const login = asyncHandler(async (req, res, next) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return next(new AppError('Please provide your email or mobile and password.', 400));
  }

  const user = await User.findOne({
    where: {
      [sequelize.Sequelize.Op.or]: [{ email: identifier }, { mobile: identifier }],
    },
  });

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid credentials. Please check and try again.', 401));
  }

  if (user.is_banned) {
    return next(new AppError('Your account has been suspended. Please contact support.', 403));
  }

  const token = signToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);
  const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await Session.create({
    user_id: user.id,
    token: refreshToken,
    ip_address: req.ip || req.headers['x-forwarded-for'] || null,
    user_agent: req.headers['user-agent'] || null,
    expires_at: sessionExpiresAt,
  });

  res.status(200).json({
    status: 'success',
    token,
    refreshToken,
    user: user.toJSON(),
  });
});

// Send OTP
const sendOtp = asyncHandler(async (req, res, next) => {
  const { mobile, purpose = 'registration' } = req.body;

  if (!mobile) {
    return next(new AppError('Mobile number is required to send OTP.', 400));
  }

  // Generate 6 digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await OtpCode.create({
    mobile,
    code,
    purpose,
    expires_at: expiresAt,
  });

  res.status(200).json({
    status: 'success',
    message: `OTP sent successfully to ${mobile}`,
    // Return code in dev for rapid testing
    ...(process.env.NODE_ENV === 'development' && { demoOtp: code }),
  });
});

// Verify OTP
const verifyOtp = asyncHandler(async (req, res, next) => {
  const { mobile, code, purpose = 'registration' } = req.body;

  if (!mobile || !code) {
    return next(new AppError('Please provide both mobile number and OTP code.', 400));
  }

  const otpRecord = await OtpCode.findOne({
    where: {
      mobile,
      code,
      purpose,
      is_used: false,
      expires_at: {
        [sequelize.Sequelize.Op.gt]: new Date(),
      },
    },
    order: [['created_at', 'DESC']],
  });

  if (!otpRecord) {
    return next(new AppError('Invalid or expired OTP code.', 400));
  }

  otpRecord.is_used = true;
  await otpRecord.save();

  res.status(200).json({
    status: 'success',
    message: 'OTP verified successfully.',
  });
});

// Refresh Access Token
const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    return next(new AppError('Refresh token is required.', 400));
  }

  try {
    const decoded = verifyRefreshToken(token);
    const session = await Session.findOne({
      where: {
        user_id: decoded.id,
        token,
        expires_at: {
          [sequelize.Sequelize.Op.gt]: new Date(),
        },
      },
    });

    if (!session) {
      return next(new AppError('Invalid or expired refresh token session.', 401));
    }

    const user = await User.findByPk(decoded.id);
    if (!user || user.is_banned) {
      return next(new AppError('User not found or account suspended.', 401));
    }

    const newAccessToken = signToken(user.id, user.role);

    res.status(200).json({
      status: 'success',
      token: newAccessToken,
    });
  } catch {
    return next(new AppError('Invalid or expired refresh token.', 401));
  }
});

// Logout
const logout = asyncHandler(async (req, res, _next) => {
  const { refreshToken: token } = req.body;

  if (token) {
    await Session.destroy({ where: { token } });
  }

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully.',
  });
});

// Forgot Password Request
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { identifier } = req.body;

  if (!identifier) {
    return next(new AppError('Please provide your registered email or mobile number.', 400));
  }

  const user = await User.findOne({
    where: {
      [sequelize.Sequelize.Op.or]: [{ email: identifier }, { mobile: identifier }],
    },
  });

  if (!user) {
    // Return generic message for privacy
    return res.status(200).json({
      status: 'success',
      message: 'If the account exists, an OTP has been sent.',
    });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await OtpCode.create({
    user_id: user.id,
    mobile: user.mobile,
    code,
    purpose: 'password_reset',
    expires_at: expiresAt,
  });

  res.status(200).json({
    status: 'success',
    message: 'Password reset OTP has been sent.',
    ...(process.env.NODE_ENV === 'development' && { demoOtp: code }),
  });
});

// Reset Password
const resetPassword = asyncHandler(async (req, res, next) => {
  const { identifier, code, newPassword } = req.body;

  if (!identifier || !code || !newPassword) {
    return next(new AppError('Please provide identifier, OTP code, and new password.', 400));
  }

  const user = await User.findOne({
    where: {
      [sequelize.Sequelize.Op.or]: [{ email: identifier }, { mobile: identifier }],
    },
  });

  if (!user) {
    return next(new AppError('User not found.', 404));
  }

  const otpRecord = await OtpCode.findOne({
    where: {
      mobile: user.mobile,
      code,
      purpose: 'password_reset',
      is_used: false,
      expires_at: {
        [sequelize.Sequelize.Op.gt]: new Date(),
      },
    },
  });

  if (!otpRecord) {
    return next(new AppError('Invalid or expired OTP code.', 400));
  }

  otpRecord.is_used = true;
  await otpRecord.save();

  const salt = await bcrypt.genSalt(10);
  user.password_hash = await bcrypt.hash(newPassword, salt);
  await user.save();

  // Invalidate previous sessions
  await Session.destroy({ where: { user_id: user.id } });

  res.status(200).json({
    status: 'success',
    message: 'Password reset successfully. You can now login with your new password.',
  });
});

// Google OAuth Handler
const googleAuth = asyncHandler(async (req, res, next) => {
  const { email, name, googleId, referral_code } = req.body;

  if (!email || !name) {
    return next(new AppError('Google profile data is required.', 400));
  }

  let user = await User.findOne({ where: { email } });

  if (!user) {
    // New user via Google
    let referrer = null;
    if (referral_code) {
      referrer = await User.findOne({
        where: { referral_code: referral_code.trim().toUpperCase() },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const dummyPassword = await bcrypt.hash(googleId || 'Google_Auth_Secret_123', salt);
    const userReferralCode = await generateReferralCode('VR');
    const bonusDeadline = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const signupBonus = parseInt(process.env.BASE_SIGNUP_BONUS, 10) || 25;
    const placeholderMobile = `G_${Date.now().toString().slice(-10)}`;

    const t = await sequelize.transaction();
    try {
      user = await User.create(
        {
          full_name: name,
          mobile: placeholderMobile,
          email,
          password_hash: dummyPassword,
          referral_code: userReferralCode,
          referred_by: referrer ? referrer.id : null,
          credit_balance: signupBonus,
          total_earned: signupBonus,
          bonus_deadline: bonusDeadline,
          role: 'user',
        },
        { transaction: t }
      );

      if (referrer) {
        await Referral.create(
          {
            referrer_id: referrer.id,
            referred_user_id: user.id,
            status: 'active',
            credits_awarded: 0,
          },
          { transaction: t }
        );
      }

      await Transaction.create(
        {
          user_id: user.id,
          type: 'credit',
          category: 'signup_bonus',
          amount: signupBonus,
          balance_after: signupBonus,
          description: 'Welcome bonus (Google Sign In)',
          reference_id: user.id,
        },
        { transaction: t }
      );

      await t.commit();
    } catch (err) {
      await t.rollback();
      return next(err);
    }
  }

  if (user.is_banned) {
    return next(new AppError('Your account has been suspended.', 403));
  }

  const token = signToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);

  res.status(200).json({
    status: 'success',
    token,
    refreshToken,
    user: user.toJSON(),
  });
});

module.exports = {
  register,
  login,
  sendOtp,
  verifyOtp,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  googleAuth,
};
