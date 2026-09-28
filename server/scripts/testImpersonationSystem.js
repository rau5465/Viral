/**
 * testImpersonationSystem.js
 * Comprehensive automated verification script for Admin Impersonation (Login As User).
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { User, AdminLog, sequelize } = require('../models');
const { signToken, verifyToken } = require('../utils/token');

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting Admin Impersonation Verification Suite');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
    }
  }

  try {
    await sequelize.authenticate();
    console.log('📦 Database connection authenticated.\n');

    // 1. Locate Admin User
    const adminUser = await User.findOne({ where: { role: 'admin' } });
    assert(adminUser !== null, `Admin user exists (ID: ${adminUser?.id}, Name: ${adminUser?.full_name})`);

    // 2. Locate or create a Regular User
    let regularUser = await User.findOne({ where: { role: 'user' } });
    if (!regularUser) {
      regularUser = await User.create({
        full_name: 'Test Target User',
        mobile: '9888877777',
        email: 'testtarget@example.com',
        password_hash: 'hash123',
        referral_code: 'TESTTGT',
        credit_balance: 150,
        total_earned: 150,
        role: 'user',
      });
    }
    assert(regularUser !== null, `Regular target user exists (ID: ${regularUser?.id}, Name: ${regularUser?.full_name}, Credits: ${regularUser?.credit_balance})`);

    // 3. Test token generation with impersonation metadata
    const impersonatedToken = signToken(regularUser.id, regularUser.role, {
      is_impersonated: true,
      impersonated_by: adminUser.id,
      admin_name: adminUser.full_name,
    });
    assert(typeof impersonatedToken === 'string' && impersonatedToken.length > 20, 'Impersonation JWT successfully created');

    // 4. Verify decoded claims
    const decoded = verifyToken(impersonatedToken);
    assert(decoded.id === regularUser.id, `Decoded token user ID matches target user ID (${decoded.id})`);
    assert(decoded.role === regularUser.role, `Decoded token role matches target user role (${decoded.role})`);
    assert(decoded.is_impersonated === true, 'Decoded token contains is_impersonated === true flag');
    assert(decoded.impersonated_by === adminUser.id, `Decoded token contains impersonated_by === ${adminUser.id}`);

    // 5. Test Audit Log Entry
    const log = await AdminLog.create({
      admin_id: adminUser.id,
      action: 'IMPERSONATE_USER',
      target_type: 'user',
      target_id: regularUser.id,
      details: {
        admin_id: adminUser.id,
        admin_name: adminUser.full_name,
        target_user_id: regularUser.id,
        target_name: regularUser.full_name,
        target_mobile: regularUser.mobile,
      },
    });
    assert(log && log.action === 'IMPERSONATE_USER', 'AdminLog successfully recorded IMPERSONATE_USER audit entry');

    // 6. Test Admin Controller Impersonation Handler Logic
    const adminController = require('../controllers/adminController');
    assert(typeof adminController.impersonateUser === 'function', 'adminController.impersonateUser is defined and exported');

    // Mock Express req, res, next to test impersonateUser directly
    let responseData = null;
    let responseStatus = null;
    let nextError = null;

    const mockReq = {
      params: { id: String(regularUser.id) },
      user: adminUser,
    };
    const mockRes = {
      status: (code) => {
        responseStatus = code;
        return {
          json: (data) => {
            responseData = data;
          },
        };
      },
    };
    const mockNext = (err) => {
      nextError = err;
    };

    await adminController.impersonateUser(mockReq, mockRes, mockNext);

    if (nextError) {
      console.error('Captured nextError:', nextError);
    }

    assert(responseStatus === 200, `impersonateUser returned status 200 (Got: ${responseStatus})`);
    assert(responseData && responseData.status === 'success', 'impersonateUser returned status: "success"');
    assert(responseData && responseData.token, 'impersonateUser returned valid access token');
    assert(responseData && responseData.user && responseData.user.id === regularUser.id, 'impersonateUser returned target user payload');
    assert(!responseData.user.password_hash, 'Target user password hash is safely omitted from response');

    // 7. Test Security Guards: Prevent admin impersonating themselves
    let selfError = null;
    await adminController.impersonateUser(
      { params: { id: String(adminUser.id) }, user: adminUser },
      mockRes,
      (err) => { selfError = err; }
    );
    assert(selfError && selfError.statusCode === 400, 'Self-impersonation blocked with 400 Bad Request');

    // 8. Test Security Guards: Prevent admin impersonating another admin
    let anotherAdmin = await User.findOne({
      where: {
        role: 'admin',
        id: { [sequelize.Sequelize.Op.ne]: adminUser.id },
      },
    });

    if (!anotherAdmin) {
      anotherAdmin = await User.create({
        full_name: 'Secondary Admin',
        mobile: '9777766666',
        email: 'admin2@far.com',
        password_hash: 'hash123',
        referral_code: 'ADMIN2',
        credit_balance: 5000,
        total_earned: 5000,
        role: 'admin',
      });
    }

    let adminImpersonateError = null;
    await adminController.impersonateUser(
      { params: { id: String(anotherAdmin.id) }, user: adminUser },
      mockRes,
      (err) => { adminImpersonateError = err; }
    );
    assert(adminImpersonateError && adminImpersonateError.statusCode === 403, 'Impersonating another administrator blocked with 403 Forbidden');

    console.log('\n====================================================');
    console.log(`📊 Test Summary: ${passed} / ${total} tests passed (${Math.round((passed / total) * 100)}%)`);
    console.log('====================================================\n');

    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Fatal error during test run:', err);
    process.exit(1);
  }
}

runTests();
