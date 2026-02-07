import Patient from '../models/Patient.js';
import User from '../models/User.js';
import HospitalDepartment from '../models/HospitalDepartment.js';
import Appointment from '../models/Appointment.js';
import { logAccess } from '../utils/logger.js';

// @desc    Get comprehensive hospital analytics
// @route   GET /api/hospital/analytics
// @access  Private (Hospital)
export const getHospitalAnalytics = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { period = '30' } = req.query;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Patient Statistics
    const patientStats = await Patient.aggregate([
      { $match: { hospital: hospitalId } },
      {
        $group: {
          _id: null,
          totalPatients: { $sum: 1 },
          activePatients: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          criticalPatients: {
            $sum: { $cond: [{ $eq: ['$status', 'critical'] }, 1, 0] }
          },
          dischargedPatients: {
            $sum: { $cond: [{ $eq: ['$status', 'discharged'] }, 1, 0] }
          },
          pendingPatients: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      }
    ]);

    // Department Distribution
    const departmentStats = await Patient.aggregate([
      { $match: { hospital: hospitalId } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          criticalCount: {
            $sum: { $cond: [{ $eq: ['$status', 'critical'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Admissions Over Time
    const admissionsOverTime = await Patient.aggregate([
      {
        $match: {
          hospital: hospitalId,
          admissionDate: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$admissionDate" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Discharges Over Time
    const dischargesOverTime = await Patient.aggregate([
      {
        $match: {
          hospital: hospitalId,
          actualDischargeDate: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$actualDischargeDate" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Average Length of Stay
    const avgLengthOfStay = await Patient.aggregate([
      {
        $match: {
          hospital: hospitalId,
          actualDischargeDate: { $exists: true }
        }
      },
      {
        $addFields: {
          lengthOfStay: {
            $ceil: {
              $divide: [
                { $subtract: ["$actualDischargeDate", "$admissionDate"] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          avgLengthOfStay: { $avg: "$lengthOfStay" },
          minLengthOfStay: { $min: "$lengthOfStay" },
          maxLengthOfStay: { $max: "$lengthOfStay" }
        }
      }
    ]);

    // Priority Distribution
    const priorityStats = await Patient.aggregate([
      { $match: { hospital: hospitalId } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Doctor Performance
    const doctorPerformance = await Patient.aggregate([
      { $match: { hospital: hospitalId } },
      {
        $group: {
          _id: '$admittingDoctor',
          patientCount: { $sum: 1 },
          activePatients: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          dischargedPatients: {
            $sum: { $cond: [{ $eq: ['$status', 'discharged'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      {
        $unwind: '$doctor'
      },
      {
        $project: {
          doctorName: { $concat: ['$doctor.firstName', ' ', '$doctor.lastName'] },
          specialization: '$doctor.specialization',
          patientCount: 1,
          activePatients: 1,
          dischargedPatients: 1
        }
      },
      { $sort: { patientCount: -1 } }
    ]);

    // Bed Utilization
    const bedUtilization = await Patient.aggregate([
      { $match: { hospital: hospitalId, status: { $in: ['active', 'critical'] } } },
      {
        $group: {
          _id: '$department',
          occupiedBeds: { $sum: 1 }
        }
      }
    ]);

    // Revenue Analytics
    const revenueStats = await Patient.aggregate([
      { $match: { hospital: hospitalId } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$billing.totalCharges' },
          avgRevenuePerPatient: { $avg: '$billing.totalCharges' },
          totalInsuranceCoverage: { $sum: '$billing.insuranceCoverage' },
          totalPatientResponsibility: { $sum: '$billing.patientResponsibility' }
        }
      }
    ]);

    // Monthly Trends
    const monthlyTrends = await Patient.aggregate([
      { $match: { hospital: hospitalId } },
      {
        $group: {
          _id: {
            year: { $year: '$admissionDate' },
            month: { $month: '$admissionDate' }
          },
          admissions: { $sum: 1 },
          discharges: {
            $sum: { $cond: [{ $ne: ['$actualDischargeDate', null] }, 1, 0] }
          },
          revenue: { $sum: '$billing.totalCharges' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        patientStats: patientStats[0] || {
          totalPatients: 0,
          activePatients: 0,
          criticalPatients: 0,
          dischargedPatients: 0,
          pendingPatients: 0
        },
        departmentStats,
        admissionsOverTime,
        dischargesOverTime,
        avgLengthOfStay: avgLengthOfStay[0] || {
          avgLengthOfStay: 0,
          minLengthOfStay: 0,
          maxLengthOfStay: 0
        },
        priorityStats,
        doctorPerformance,
        bedUtilization,
        revenueStats: revenueStats[0] || {
          totalRevenue: 0,
          avgRevenuePerPatient: 0,
          totalInsuranceCoverage: 0,
          totalPatientResponsibility: 0
        },
        monthlyTrends
      }
    });
  } catch (error) {
    console.error('Error getting hospital analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get department-specific analytics
// @route   GET /api/hospital/analytics/departments/:departmentId
// @access  Private (Hospital)
export const getDepartmentAnalytics = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { departmentId } = req.params;
    const { period = '30' } = req.query;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Get department name
    const department = await HospitalDepartment.findOne({
      _id: departmentId,
      hospital: hospitalId
    });

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Patient statistics for department
    const patientStats = await Patient.aggregate([
      {
        $match: {
          hospital: hospitalId,
          department: department.name
        }
      },
      {
        $group: {
          _id: null,
          totalPatients: { $sum: 1 },
          activePatients: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          criticalPatients: {
            $sum: { $cond: [{ $eq: ['$status', 'critical'] }, 1, 0] }
          },
          dischargedPatients: {
            $sum: { $cond: [{ $eq: ['$status', 'discharged'] }, 1, 0] }
          }
        }
      }
    ]);

    // Admissions over time for department
    const admissionsOverTime = await Patient.aggregate([
      {
        $match: {
          hospital: hospitalId,
          department: department.name,
          admissionDate: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$admissionDate" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Doctor performance in department
    const doctorPerformance = await Patient.aggregate([
      {
        $match: {
          hospital: hospitalId,
          department: department.name
        }
      },
      {
        $group: {
          _id: '$admittingDoctor',
          patientCount: { $sum: 1 },
          activePatients: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      {
        $unwind: '$doctor'
      },
      {
        $project: {
          doctorName: { $concat: ['$doctor.firstName', ' ', '$doctor.lastName'] },
          specialization: '$doctor.specialization',
          patientCount: 1,
          activePatients: 1
        }
      },
      { $sort: { patientCount: -1 } }
    ]);

    // Average length of stay for department
    const avgLengthOfStay = await Patient.aggregate([
      {
        $match: {
          hospital: hospitalId,
          department: department.name,
          actualDischargeDate: { $exists: true }
        }
      },
      {
        $addFields: {
          lengthOfStay: {
            $ceil: {
              $divide: [
                { $subtract: ["$actualDischargeDate", "$admissionDate"] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          avgLengthOfStay: { $avg: "$lengthOfStay" }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        department: {
          name: department.name,
          description: department.description
        },
        patientStats: patientStats[0] || {
          totalPatients: 0,
          activePatients: 0,
          criticalPatients: 0,
          dischargedPatients: 0
        },
        admissionsOverTime,
        doctorPerformance,
        avgLengthOfStay: avgLengthOfStay[0]?.avgLengthOfStay || 0
      }
    });
  } catch (error) {
    console.error('Error getting department analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get doctor performance analytics
// @route   GET /api/hospital/analytics/doctors/:doctorId
// @access  Private (Hospital)
export const getDoctorAnalytics = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { doctorId } = req.params;
    const { period = '30' } = req.query;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Get doctor details
    const doctor = await User.findOne({
      _id: doctorId,
      hospital: hospitalId,
      role: 'doctor'
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Patient statistics for doctor
    const patientStats = await Patient.aggregate([
      {
        $match: {
          hospital: hospitalId,
          admittingDoctor: doctorId
        }
      },
      {
        $group: {
          _id: null,
          totalPatients: { $sum: 1 },
          activePatients: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          criticalPatients: {
            $sum: { $cond: [{ $eq: ['$status', 'critical'] }, 1, 0] }
          },
          dischargedPatients: {
            $sum: { $cond: [{ $eq: ['$status', 'discharged'] }, 1, 0] }
          }
        }
      }
    ]);

    // Admissions over time for doctor
    const admissionsOverTime = await Patient.aggregate([
      {
        $match: {
          hospital: hospitalId,
          admittingDoctor: doctorId,
          admissionDate: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$admissionDate" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Department distribution for doctor
    const departmentDistribution = await Patient.aggregate([
      {
        $match: {
          hospital: hospitalId,
          admittingDoctor: doctorId
        }
      },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Average length of stay for doctor's patients
    const avgLengthOfStay = await Patient.aggregate([
      {
        $match: {
          hospital: hospitalId,
          admittingDoctor: doctorId,
          actualDischargeDate: { $exists: true }
        }
      },
      {
        $addFields: {
          lengthOfStay: {
            $ceil: {
              $divide: [
                { $subtract: ["$actualDischargeDate", "$admissionDate"] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          avgLengthOfStay: { $avg: "$lengthOfStay" }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        doctor: {
          name: `${doctor.firstName} ${doctor.lastName}`,
          specialization: doctor.specialization,
          department: doctor.department
        },
        patientStats: patientStats[0] || {
          totalPatients: 0,
          activePatients: 0,
          criticalPatients: 0,
          dischargedPatients: 0
        },
        admissionsOverTime,
        departmentDistribution,
        avgLengthOfStay: avgLengthOfStay[0]?.avgLengthOfStay || 0
      }
    });
  } catch (error) {
    console.error('Error getting doctor analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get revenue analytics
// @route   GET /api/hospital/analytics/revenue
// @access  Private (Hospital)
export const getRevenueAnalytics = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { period = '30' } = req.query;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Revenue by department
    const revenueByDepartment = await Patient.aggregate([
      { $match: { hospital: hospitalId } },
      {
        $group: {
          _id: '$department',
          totalRevenue: { $sum: '$billing.totalCharges' },
          avgRevenuePerPatient: { $avg: '$billing.totalCharges' },
          patientCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Revenue over time
    const revenueOverTime = await Patient.aggregate([
      {
        $match: {
          hospital: hospitalId,
          admissionDate: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$admissionDate" }
          },
          revenue: { $sum: '$billing.totalCharges' },
          patientCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Payment status distribution
    const paymentStatusDistribution = await Patient.aggregate([
      { $match: { hospital: hospitalId } },
      {
        $group: {
          _id: '$billing.paymentStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$billing.patientResponsibility' }
        }
      }
    ]);

    // Insurance vs self-pay breakdown
    const insuranceBreakdown = await Patient.aggregate([
      { $match: { hospital: hospitalId } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$billing.totalCharges' },
          totalInsuranceCoverage: { $sum: '$billing.insuranceCoverage' },
          totalPatientResponsibility: { $sum: '$billing.patientResponsibility' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        revenueByDepartment,
        revenueOverTime,
        paymentStatusDistribution,
        insuranceBreakdown: insuranceBreakdown[0] || {
          totalRevenue: 0,
          totalInsuranceCoverage: 0,
          totalPatientResponsibility: 0
        }
      }
    });
  } catch (error) {
    console.error('Error getting revenue analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 