import mongoose from 'mongoose';
import DashboardStats from './src/models/DashboardStats.js';
import AuditLog from './src/models/AuditLog.js';
import ActivityLog from './src/models/ActivityLog.js';
import AccessLog from './src/models/AccessLog.js';
import User from './src/models/User.js';

async function testAnalyticsDashboard() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthsecure');
    console.log('Connected to MongoDB');

    console.log('📊 Testing Analytics & Dashboard System...\n');

    // Test 1: Create dashboard stats
    console.log('1. Creating dashboard stats...');
    const newDashboardStats = new DashboardStats({
      statsId: 'STATS-' + Date.now(),
      date: new Date(),
      period: 'daily',
      metrics: {
        users: {
          total: 1250,
          active: 890,
          new: 45,
          verified: 1100
        },
        appointments: {
          total: 320,
          scheduled: 280,
          completed: 240,
          cancelled: 40
        },
        bloodInventory: {
          totalUnits: 1500,
          available: 1200,
          reserved: 200,
          expired: 100
        },
        insurance: {
          policies: 850,
          claims: 120,
          approved: 95,
          pending: 25
        },
        revenue: {
          total: 2500000,
          appointments: 800000,
          insurance: 1200000,
          other: 500000
        }
      },
      trends: {
        userGrowth: 12.5,
        appointmentGrowth: 8.3,
        revenueGrowth: 15.2
      },
      alerts: [
        {
          type: 'low_stock',
          message: 'Blood type O- is running low',
          severity: 'medium',
          timestamp: new Date()
        },
        {
          type: 'high_demand',
          message: 'High appointment demand in cardiology',
          severity: 'low',
          timestamp: new Date()
        }
      ],
      isActive: true
    });

    await newDashboardStats.save();
    console.log('✅ Dashboard stats created successfully');
    console.log('   - Stats ID:', newDashboardStats._id);
    console.log('   - Date:', newDashboardStats.date);
    console.log('   - Period:', newDashboardStats.period);
    console.log('   - Total Users:', newDashboardStats.metrics.users.total);

    // Test 2: Create audit log
    console.log('\n2. Creating audit log...');
    const newAuditLog = new AuditLog({
      auditId: 'AUDIT-' + Date.now(),
      userId: new mongoose.Types.ObjectId(),
      userRole: 'doctor',
      action: 'patient_record_accessed',
      resource: 'patient_data',
      resourceId: new mongoose.Types.ObjectId(),
      timestamp: new Date(),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: {
        patientId: 'PAT-123456',
        accessType: 'view',
        duration: 300, // seconds
        dataAccessed: ['medical_history', 'prescriptions']
      },
      outcome: 'success',
      isActive: true
    });

    await newAuditLog.save();
    console.log('✅ Audit log created successfully');
    console.log('   - Audit ID:', newAuditLog._id);
    console.log('   - Action:', newAuditLog.action);
    console.log('   - Resource:', newAuditLog.resource);
    console.log('   - Outcome:', newAuditLog.outcome);

    // Test 3: Create activity log
    console.log('\n3. Creating activity log...');
    const newActivityLog = new ActivityLog({
      activityId: 'ACT-' + Date.now(),
      userId: new mongoose.Types.ObjectId(),
      userRole: 'patient',
      activityType: 'appointment_booking',
      description: 'Booked appointment with Dr. Smith',
      timestamp: new Date(),
      metadata: {
        doctorId: 'DOC-789012',
        appointmentDate: new Date('2024-02-15'),
        appointmentType: 'consultation',
        duration: 30
      },
      ipAddress: '192.168.1.101',
      sessionId: 'SESS-' + Date.now(),
      isActive: true
    });

    await newActivityLog.save();
    console.log('✅ Activity log created successfully');
    console.log('   - Activity ID:', newActivityLog._id);
    console.log('   - Type:', newActivityLog.activityType);
    console.log('   - Description:', newActivityLog.description);

    // Test 4: Create access log
    console.log('\n4. Creating access log...');
    const newAccessLog = new AccessLog({
      userId: new mongoose.Types.ObjectId(),
      timestamp: new Date(),
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      endpoint: '/api/patient/dashboard',
      method: 'GET',
      statusCode: 200,
      responseTime: 150, // milliseconds
      sessionId: 'SESS-' + Date.now()
    });

    await newAccessLog.save();
    console.log('✅ Access log created successfully');
    console.log('   - Access ID:', newAccessLog._id);
    console.log('   - Endpoint:', newAccessLog.endpoint);
    console.log('   - Status Code:', newAccessLog.statusCode);
    console.log('   - Response Time:', newAccessLog.responseTime, 'ms');

    // Test 5: Create multiple activity logs for analysis
    console.log('\n5. Creating multiple activity logs for analysis...');
    const activityTypes = [
      { type: 'login', description: 'User logged in', count: 15 },
      { type: 'appointment_booking', description: 'Appointment booked', count: 8 },
      { type: 'file_upload', description: 'File uploaded', count: 12 },
      { type: 'profile_update', description: 'Profile updated', count: 5 },
      { type: 'payment_made', description: 'Payment processed', count: 20 }
    ];

    const createdActivities = [];
    for (const activity of activityTypes) {
      for (let i = 0; i < activity.count; i++) {
        const log = new ActivityLog({
          activityId: 'ACT-' + Date.now() + Math.random(),
          userId: new mongoose.Types.ObjectId(),
          userRole: ['patient', 'doctor', 'admin'][Math.floor(Math.random() * 3)],
          activityType: activity.type,
          description: activity.description,
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random time in last 24 hours
          metadata: {
            sessionId: 'SESS-' + Date.now(),
            deviceType: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)]
          },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          sessionId: 'SESS-' + Date.now(),
          isActive: true
        });
        await log.save();
        createdActivities.push(log);
      }
    }
    console.log('✅ Created multiple activity logs for analysis');

    // Test 6: Test dashboard stats queries
    console.log('\n6. Testing dashboard stats queries...');
    const todayStats = await DashboardStats.findOne({
      date: { $gte: new Date().setHours(0, 0, 0, 0) }
    });
    console.log('✅ Today\'s stats found:', !!todayStats);

    const weeklyStats = await DashboardStats.find({
      date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    console.log(`✅ Found ${weeklyStats.length} stats records for last 7 days`);

    // Test 7: Test audit log queries
    console.log('\n7. Testing audit log queries...');
    const recentAudits = await AuditLog.find({
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    console.log(`✅ Found ${recentAudits.length} audit logs in last 24 hours`);

    const successfulAudits = await AuditLog.find({ outcome: 'success' });
    console.log(`✅ Found ${successfulAudits.length} successful audit logs`);

    const failedAudits = await AuditLog.find({ outcome: 'failed' });
    console.log(`✅ Found ${failedAudits.length} failed audit logs`);

    // Test 8: Test activity log queries
    console.log('\n8. Testing activity log queries...');
    const loginActivities = await ActivityLog.find({ activityType: 'login' });
    console.log(`✅ Found ${loginActivities.length} login activities`);

    const appointmentActivities = await ActivityLog.find({ activityType: 'appointment_booking' });
    console.log(`✅ Found ${appointmentActivities.length} appointment booking activities`);

    const userActivities = await ActivityLog.find({
      userId: new mongoose.Types.ObjectId()
    });
    console.log(`✅ Found ${userActivities.length} activities for specific user`);

    // Test 9: Test access log queries
    console.log('\n9. Testing access log queries...');
    const successfulAccess = await AccessLog.find({ statusCode: 200 });
    console.log(`✅ Found ${successfulAccess.length} successful access logs`);

    const slowResponses = await AccessLog.find({ responseTime: { $gt: 1000 } });
    console.log(`✅ Found ${slowResponses.length} slow response logs (> 1s)`);

    const apiAccess = await AccessLog.find({ endpoint: { $regex: '/api/' } });
    console.log(`✅ Found ${apiAccess.length} API access logs`);

    // Test 10: Test analytics aggregation
    console.log('\n10. Testing analytics aggregation...');
    const activityStats = await ActivityLog.aggregate([
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          activityType: '$_id',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      }
    ]);
    console.log('✅ Activity statistics:', activityStats);

    // Test 11: Test user engagement metrics
    console.log('\n11. Testing user engagement metrics...');
    const userEngagement = await ActivityLog.aggregate([
      {
        $group: {
          _id: '$userId',
          activityCount: { $sum: 1 },
          lastActivity: { $max: '$timestamp' },
          activityTypes: { $addToSet: '$activityType' }
        }
      },
      {
        $project: {
          userId: '$_id',
          activityCount: 1,
          lastActivity: 1,
          uniqueActivityTypes: { $size: '$activityTypes' }
        }
      },
      {
        $sort: { activityCount: -1 }
      },
      {
        $limit: 10
      }
    ]);
    console.log('✅ Top 10 most active users:', userEngagement.length);

    // Test 12: Test performance metrics
    console.log('\n12. Testing performance metrics...');
    const performanceStats = await AccessLog.aggregate([
      {
        $group: {
          _id: '$endpoint',
          avgResponseTime: { $avg: '$responseTime' },
          maxResponseTime: { $max: '$responseTime' },
          minResponseTime: { $min: '$responseTime' },
          requestCount: { $sum: 1 },
          errorCount: {
            $sum: {
              $cond: [{ $gte: ['$statusCode', 400] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          endpoint: '$_id',
          avgResponseTime: { $round: ['$avgResponseTime', 2] },
          maxResponseTime: 1,
          minResponseTime: 1,
          requestCount: 1,
          errorRate: {
            $round: [
              { $multiply: [{ $divide: ['$errorCount', '$requestCount'] }, 100] },
              2
            ]
          }
        }
      }
    ]);
    console.log('✅ Performance statistics:', performanceStats);

    // Test 13: Test security analytics
    console.log('\n13. Testing security analytics...');
    const securityStats = await AuditLog.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ['$outcome', 'success'] }, 1, 0] }
          },
          failureCount: {
            $sum: { $cond: [{ $eq: ['$outcome', 'failed'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          action: '$_id',
          totalCount: 1,
          successCount: 1,
          failureCount: 1,
          successRate: {
            $round: [
              { $multiply: [{ $divide: ['$successCount', '$count'] }, 100] },
              2
            ]
          }
        }
      }
    ]);
    console.log('✅ Security statistics:', securityStats);

    // Test 14: Test time-based analytics
    console.log('\n14. Testing time-based analytics...');
    const hourlyActivity = await ActivityLog.aggregate([
      {
        $group: {
          _id: { $hour: '$timestamp' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);
    console.log('✅ Hourly activity distribution:', hourlyActivity.length, 'hours');

    const dailyActivity = await ActivityLog.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': -1 }
      },
      {
        $limit: 7
      }
    ]);
    console.log('✅ Daily activity for last 7 days:', dailyActivity.length, 'days');

    // Test 15: Test dashboard alerts
    console.log('\n15. Testing dashboard alerts...');
    const activeAlerts = await DashboardStats.aggregate([
      { $unwind: '$alerts' },
      {
        $match: {
          'alerts.severity': { $in: ['high', 'medium'] }
        }
      },
      {
        $group: {
          _id: '$alerts.type',
          count: { $sum: 1 },
          latestAlert: { $max: '$alerts.timestamp' }
        }
      }
    ]);
    console.log('✅ Active high/medium priority alerts:', activeAlerts);

    // Test 16: Test revenue analytics
    console.log('\n16. Testing revenue analytics...');
    const revenueStats = await DashboardStats.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$metrics.revenue.total' },
          avgRevenue: { $avg: '$metrics.revenue.total' },
          maxRevenue: { $max: '$metrics.revenue.total' },
          minRevenue: { $min: '$metrics.revenue.total' }
        }
      }
    ]);
    console.log('✅ Revenue statistics:', revenueStats);

    // Test 17: Test user growth analytics
    console.log('\n17. Testing user growth analytics...');
    const userGrowth = await DashboardStats.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          totalUsers: { $avg: '$metrics.users.total' },
          newUsers: { $avg: '$metrics.users.new' },
          activeUsers: { $avg: '$metrics.users.active' }
        }
      },
      {
        $sort: { '_id': -1 }
      },
      {
        $limit: 6
      }
    ]);
    console.log('✅ User growth by month:', userGrowth.length, 'months');

    // Cleanup
    console.log('\n18. Cleaning up test data...');
    await DashboardStats.findByIdAndDelete(newDashboardStats._id);
    await AuditLog.findByIdAndDelete(newAuditLog._id);
    await ActivityLog.findByIdAndDelete(newActivityLog._id);
    await AccessLog.findByIdAndDelete(newAccessLog._id);
    
    for (const activity of createdActivities) {
      await ActivityLog.findByIdAndDelete(activity._id);
    }
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testAnalyticsDashboard();
