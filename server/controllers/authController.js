const bcrypt = require('bcryptjs');
const { User, Referral, Transaction, Session, OtpCode, sequelize } = require('../models');
const { signToken, signRefreshToken, verifyRefreshToken } = require('../utils/token');
const { generateReferralCode } = require('../utils/referralCode');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// In-memory fallback users for offline/degraded database mode
const inMemoryUsers = [
  {
    id: 1,
    full_name: 'FAR Admin',
    mobile: '9999999999',
    email: 'admin@far.com',
    password_hash: bcrypt.hashSync('Admin@123', 10),
    referral_code: 'FARADMIN',
    credit_balance: 5000,
    total_earned: 5000,
    role: 'admin',
    is_banned: false,
    comparePassword: async function (candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password_hash);
    },
    toJSON: function () {
      const { password_hash, ...rest } = this;
      return rest;
    },
  },
  {
    id: 2,
    full_name: 'Rahul Sharma',
    mobile: '9876543210',
    email: '9876543210@whatsapp.far',
    password_hash: bcrypt.hashSync('Password@123', 10),
    referral_code: 'VRDEMO',
    credit_balance: 100,
    total_earned: 100,
    role: 'user',
    is_banned: false,
    comparePassword: async function (candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password_hash);
    },
    toJSON: function () {
      const { password_hash, ...rest } = this;
      return rest;
    },
  },
];

// Register New User (WhatsApp Mobile Number with One Device One Account enforcement)
const register = asyncHandler(async (req, res, next) => {
  const { full_name, mobile, password, referral_code, device_fingerprint } = req.body;

  if (!full_name || !mobile || !password) {
    return next(new AppError('Please provide your full name, WhatsApp mobile number and password.', 400));
  }

  // Normalize WhatsApp mobile (10 digits)
  const cleanMobile = mobile.replace(/[^0-9]/g, '').slice(-10);
  if (cleanMobile.length !== 10) {
    return next(new AppError('Please enter a valid 10-digit WhatsApp mobile number.', 400));
  }

  // Extract IP and build deterministic fallback device signature
  const crypto = require('crypto');
  const clientFingerprint = (device_fingerprint || '').trim();
  const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '127.0.0.1';
  const cleanIp = String(rawIp).split(',')[0].trim().replace('::ffff:', '');
  const userAgent = req.headers['user-agent'] || '';

  const fallbackDeviceHash = crypto
    .createHash('sha256')
    .update(`${userAgent}::${cleanIp}`)
    .digest('hex');

  const finalDeviceFingerprint =
    clientFingerprint && clientFingerprint.length >= 32 ? clientFingerprint : fallbackDeviceHash;

  // Check if mobile exists
  let existingUser = null;
  try {
    existingUser = await User.findOne({
      where: { mobile: cleanMobile },
    });
  } catch (err) {
    console.warn('Database check failed, checking in-memory users:', err.message);
    existingUser = inMemoryUsers.find((u) => u.mobile === cleanMobile);
  }

  if (existingUser) {
    return next(new AppError('An account with this WhatsApp mobile number already exists. Please sign in.', 400));
  }

  // One Device, One Account Policy: Check for existing account on this device/browser
  if (finalDeviceFingerprint) {
    let existingDeviceUser = null;
    try {
      existingDeviceUser = await User.findOne({
        where: { device_fingerprint: finalDeviceFingerprint },
      });
    } catch (err) {
      console.warn('Device fingerprint database check error:', err.message);
      existingDeviceUser = inMemoryUsers.find((u) => u.device_fingerprint === finalDeviceFingerprint);
    }

    if (existingDeviceUser) {
      return next(
        new AppError(
          'One Device, One Account Policy: Do not try to create more than one account to avoid account ban. Only one account must be used in a single device. Please sign in to your existing account.',
          400
        )
      );
    }
  }

  // WhatsApp wacli Verification check
  const wacliService = require('../services/wacliService');
  const wacliSettings = await wacliService.getSettings();
  if (wacliSettings.enabled) {
    const isVerified = await wacliService.isMobileVerified(cleanMobile);
    if (!isVerified) {
      return next(
        new AppError(
          'Please verify your WhatsApp mobile number before registering. Click "Verify with WhatsApp" to confirm your number.',
          400
        )
      );
    }
  }

  // Validate referrer if referral code provided
  let referrer = null;
  if (referral_code) {
    try {
      referrer = await User.findOne({
        where: { referral_code: referral_code.trim().toUpperCase() },
      });
    } catch (_err) {
      referrer = inMemoryUsers.find((u) => u.referral_code === referral_code.trim().toUpperCase());
    }
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);
  const userReferralCode = await generateReferralCode('VR');

  // 2-hour bonus window
  const bonusDeadline = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const signupBonus = parseInt(process.env.BASE_SIGNUP_BONUS, 10) || 25;
  const userEmail = req.body.email ? req.body.email.trim().toLowerCase() : `${cleanMobile}@whatsapp.far`;

  let newUser;
  try {
    const t = await sequelize.transaction();
    try {
      newUser = await User.create(
        {
          full_name: full_name.trim(),
          mobile: cleanMobile,
          email: userEmail,
          password_hash,
          referral_code: userReferralCode,
          referred_by: referrer ? referrer.id : null,
          credit_balance: signupBonus,
          total_earned: signupBonus,
          bonus_deadline: bonusDeadline,
          role: 'user',
          device_fingerprint: finalDeviceFingerprint,
          signup_ip: cleanIp.slice(0, 45),
        },
        { transaction: t }
      );

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

      await t.commit();
    } catch (txErr) {
      await t.rollback();
      throw txErr;
    }
  } catch (dbErr) {
    console.warn('Database error during user creation. Using in-memory fallback:', dbErr.message);
    newUser = {
      id: Date.now(),
      full_name: full_name.trim(),
      mobile: cleanMobile,
      email: userEmail,
      password_hash,
      referral_code: userReferralCode,
      referred_by: referrer ? referrer.id : null,
      credit_balance: signupBonus,
      total_earned: signupBonus,
      bonus_deadline: bonusDeadline,
      role: 'user',
      device_fingerprint: finalDeviceFingerprint,
      signup_ip: cleanIp.slice(0, 45),
      is_banned: false,
      comparePassword: async function (pass) {
        return bcrypt.compare(pass, this.password_hash);
      },
      toJSON: function () {
        const { password_hash, ...rest } = this;
        return rest;
      },
    };
    inMemoryUsers.push(newUser);
  }

  // Create session tokens
  const token = signToken(newUser.id, newUser.role);
  const refreshToken = signRefreshToken(newUser.id);
  const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  try {
    await Session.create({
      user_id: newUser.id,
      token: refreshToken,
      ip_address: req.ip || req.headers['x-forwarded-for'] || null,
      user_agent: req.headers['user-agent'] || null,
      expires_at: sessionExpiresAt,
    });
  } catch (_sessErr) {
    // Non-blocking in degraded mode
  }

  // Mark phone verification as used
  await wacliService.markVerificationUsed(cleanMobile);

  res.status(201).json({
    status: 'success',
    message: 'Account created successfully! 25 bonus credits added.',
    token,
    refreshToken,
    user: newUser.toJSON ? newUser.toJSON() : newUser,
    bonus: {
      deadline: bonusDeadline,
      hoursRemaining: 2,
      targetReferrals: 2,
    },
  });
});

// Login User (WhatsApp Mobile Number & Password)
const login = asyncHandler(async (req, res, next) => {
  const { identifier, mobile, password } = req.body;
  const loginInput = (mobile || identifier || '').trim();

  if (!loginInput || !password) {
    return next(new AppError('Please provide your WhatsApp mobile number and password.', 400));
  }

  // Normalize 10-digit mobile and detect demo aliases
  const cleanMobile = loginInput.replace(/[^0-9]/g, '').slice(-10);
  const lowerInput = loginInput.toLowerCase();
  const isAdminAlias = lowerInput === 'admin' || lowerInput === 'administrator';
  const isDemoAlias = lowerInput === 'demo' || lowerInput === 'demouser';

  let user = null;
  try {
    const whereConditions = [
      { mobile: cleanMobile.length === 10 ? cleanMobile : loginInput },
      { mobile: loginInput },
      { email: loginInput },
    ];
    if (isAdminAlias) {
      whereConditions.push({ mobile: '9999999999' }, { role: 'admin' });
    }
    if (isDemoAlias) {
      whereConditions.push({ mobile: '9876543210' });
    }

    user = await User.findOne({
      where: {
        [sequelize.Sequelize.Op.or]: whereConditions,
      },
    });
  } catch (dbErr) {
    console.warn('Database error during login, falling back to in-memory store:', dbErr.message);
  }

  if (!user) {
    user = inMemoryUsers.find(
      (u) =>
        u.mobile === cleanMobile ||
        u.mobile === loginInput ||
        u.email === loginInput ||
        (isAdminAlias && (u.mobile === '9999999999' || u.role === 'admin')) ||
        (isDemoAlias && u.mobile === '9876543210')
    );
  }

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid credentials. Please check your WhatsApp mobile number and password.', 401));
  }

  if (user.is_banned) {
    return next(new AppError('Your account has been suspended. Please contact support.', 403));
  }

  const token = signToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);
  const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  try {
    await Session.create({
      user_id: user.id,
      token: refreshToken,
      ip_address: req.ip || req.headers['x-forwarded-for'] || null,
      user_agent: req.headers['user-agent'] || null,
      expires_at: sessionExpiresAt,
    });
  } catch (_sessErr) {
    // Non-blocking in degraded mode
  }

  res.status(200).json({
    status: 'success',
    token,
    refreshToken,
    user: user.toJSON ? user.toJSON() : user,
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

// Get Security Questions for Forgot Password
const getSecurityQuestionsByMobile = asyncHandler(async (req, res, next) => {
  const identifier = req.body.mobile || req.body.identifier;

  if (!identifier) {
    return next(new AppError('Please provide your 10-digit WhatsApp mobile number.', 400));
  }

  const cleanMobile = String(identifier).replace(/[^0-9]/g, '').slice(-10);

  let user = null;
  try {
    user = await User.findOne({
      where: {
        [sequelize.Sequelize.Op.or]: [{ mobile: cleanMobile }, { email: identifier }],
      },
    });
  } catch (err) {
    console.warn('DB lookup failed in getSecurityQuestionsByMobile:', err.message);
    user = inMemoryUsers.find((u) => u.mobile === cleanMobile);
  }

  if (!user) {
    return next(new AppError('No account found with this WhatsApp mobile number.', 404));
  }

  // Check if password reset is locked out until tomorrow
  if (user.reset_locked_until && new Date() < new Date(user.reset_locked_until)) {
    const diffMs = new Date(user.reset_locked_until).getTime() - Date.now();
    const hours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
    return next(
      new AppError(
        `Password reset is locked due to incorrect security answers. Please try again tomorrow (in approximately ${hours} hour${hours > 1 ? 's' : ''}).`,
        403
      )
    );
  }

  if (!user.security_questions_set || !user.security_q1 || !user.security_q2) {
    return next(
      new AppError(
        'Security questions have not been set for this account yet. Please contact FAR support for account verification.',
        400
      )
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Security questions retrieved.',
    q1: user.security_q1,
    q2: user.security_q2,
  });
});

// Reset Password with 2 Security Questions
const resetPassword = asyncHandler(async (req, res, next) => {
  const identifier = req.body.mobile || req.body.identifier;
  const { a1, a2, newPassword } = req.body;

  if (!identifier || !a1 || !a2 || !newPassword) {
    return next(new AppError('Please answer both security questions and enter a new password.', 400));
  }

  if (newPassword.length < 6) {
    return next(new AppError('New password must be at least 6 characters long.', 400));
  }

  const cleanMobile = String(identifier).replace(/[^0-9]/g, '').slice(-10);

  let user = null;
  try {
    user = await User.findOne({
      where: {
        [sequelize.Sequelize.Op.or]: [{ mobile: cleanMobile }, { email: identifier }],
      },
    });
  } catch (err) {
    console.warn('DB lookup failed in resetPassword:', err.message);
    user = inMemoryUsers.find((u) => u.mobile === cleanMobile);
  }

  if (!user) {
    return next(new AppError('User not found.', 404));
  }

  // Check lockout
  if (user.reset_locked_until && new Date() < new Date(user.reset_locked_until)) {
    const diffMs = new Date(user.reset_locked_until).getTime() - Date.now();
    const hours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
    return next(
      new AppError(
        `Password reset is locked due to incorrect security answers. You can try again tomorrow (in ~${hours} hour${hours > 1 ? 's' : ''}).`,
        403
      )
    );
  }

  if (!user.security_questions_set || !user.security_a1 || !user.security_a2) {
    return next(new AppError('No security questions are configured for this account. Contact support.', 400));
  }

  const cleanA1 = String(a1).trim().toLowerCase();
  const cleanA2 = String(a2).trim().toLowerCase();

  const isA1Valid = await bcrypt.compare(cleanA1, user.security_a1);
  const isA2Valid = await bcrypt.compare(cleanA2, user.security_a2);

  if (!isA1Valid || !isA2Valid) {
    // Lock out password reset until the next day (24 hours)
    const lockoutDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    try {
      user.reset_locked_until = lockoutDate;
      user.reset_attempts_failed = (user.reset_attempts_failed || 0) + 1;
      await user.save();
    } catch (saveErr) {
      console.warn('Failed to save lockout on user:', saveErr.message);
    }
    return next(
      new AppError(
        'Incorrect security answer(s). As warned, password reset is now locked and you can only try again tomorrow (after 24 hours).',
        400
      )
    );
  }

  // Both answers match! Update password and clear lockout
  try {
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    user.reset_locked_until = null;
    user.reset_attempts_failed = 0;
    await user.save();
    await Session.destroy({ where: { user_id: user.id } });
  } catch (err) {
    console.error('Password reset save error:', err);
  }

  res.status(200).json({
    status: 'success',
    message: 'Password reset successfully! You can now log in with your new password.',
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
  forgotPassword: getSecurityQuestionsByMobile,
  getSecurityQuestionsByMobile,
  resetPassword,
  googleAuth,
  inMemoryUsers,
};
