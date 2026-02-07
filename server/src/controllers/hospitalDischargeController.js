import HospitalDischarge from '../models/HospitalDischarge.js';

// Get all discharges for a hospital
export const getDischarges = async (req, res) => {
    try {
        // Add logging for debugging
        console.log('GET /api/hospital/discharges (hospitalDischargeController) - User:', req.user?._id, 'Role:', req.user?.role);
        
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        
        const hospitalId = req.user._id;
        const { status, department, search, limit = 100, page = 1 } = req.query;

        // Build query
        const query = { hospital: hospitalId };

        if (status && status !== 'all') {
            query.status = status;
        }

        if (department && department !== 'all') {
            query.department = department;
        }

        if (search) {
            query.$or = [
                { patientName: { $regex: search, $options: 'i' } },
                { patientId: { $regex: search, $options: 'i' } },
            ];
        }

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const discharges = await HospitalDischarge.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .lean();

        const total = await HospitalDischarge.countDocuments(query);

        // Calculate stats
        const stats = {
            total: discharges.length,
            pending: discharges.filter(d => d.status === 'pending').length,
            approved: discharges.filter(d => d.status === 'approved').length,
            discharged: discharges.filter(d => d.status === 'discharged').length,
            completed: discharges.filter(d => d.status === 'completed').length,
        };

        // Get today's discharges
        const today = new Date();
        const todayDischarges = discharges.filter(discharge => {
            if (!discharge.dischargeDate) return false;
            const dischargeDate = new Date(discharge.dischargeDate);
            return dischargeDate.toDateString() === today.toDateString();
        });

        res.json({
            success: true,
            discharges,
            stats,
            today: todayDischarges,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Get discharges error:', error);
        res.status(500).json({ message: 'Failed to fetch discharges', error: error.message });
    }
};

// Get single discharge by ID
export const getDischargeById = async (req, res) => {
    try {
        const { id } = req.params;
        const hospitalId = req.user._id;

        const discharge = await HospitalDischarge.findOne({
            _id: id,
            hospital: hospitalId,
        })
            .populate('createdBy', 'firstName lastName email')
            .populate('approvedBy', 'firstName lastName email')
            .populate('completedBy', 'firstName lastName email')
            .lean();

        if (!discharge) {
            return res.status(404).json({ message: 'Discharge not found' });
        }

        res.json({ discharge });
    } catch (error) {
        console.error('Get discharge by ID error:', error);
        res.status(500).json({ message: 'Failed to fetch discharge', error: error.message });
    }
};

// Create new discharge plan
export const createDischargePlan = async (req, res) => {
    try {
        const hospitalId = req.user._id;
        const userId = req.user._id;

        const dischargeData = {
            ...req.body,
            hospital: hospitalId,
            createdBy: userId,
            status: 'pending',
        };

        const discharge = await HospitalDischarge.create(dischargeData);

        res.status(201).json({
            success: true,
            message: 'Discharge plan created successfully',
            discharge,
        });
    } catch (error) {
        console.error('Create discharge plan error:', error);
        res.status(500).json({ message: 'Failed to create discharge plan', error: error.message });
    }
};

// Update discharge plan
export const updateDischargePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const hospitalId = req.user._id;

        const discharge = await HospitalDischarge.findOne({
            _id: id,
            hospital: hospitalId,
        });

        if (!discharge) {
            return res.status(404).json({ message: 'Discharge not found' });
        }

        // Only allow updates if status is pending or approved
        if (discharge.status === 'completed' || discharge.status === 'cancelled') {
            return res.status(400).json({
                message: `Cannot update discharge with status: ${discharge.status}`
            });
        }

        // Update fields
        Object.keys(req.body).forEach((key) => {
            if (key !== 'hospital' && key !== 'createdBy' && key !== 'status') {
                discharge[key] = req.body[key];
            }
        });

        await discharge.save();

        res.json({
            success: true,
            message: 'Discharge plan updated successfully',
            discharge,
        });
    } catch (error) {
        console.error('Update discharge plan error:', error);
        res.status(500).json({ message: 'Failed to update discharge plan', error: error.message });
    }
};

// Approve discharge
export const approveDischarge = async (req, res) => {
    try {
        const { id } = req.params;
        const hospitalId = req.user._id;
        const userId = req.user._id;

        const discharge = await HospitalDischarge.findOne({
            _id: id,
            hospital: hospitalId,
        });

        if (!discharge) {
            return res.status(404).json({ message: 'Discharge not found' });
        }

        if (discharge.status !== 'pending') {
            return res.status(400).json({
                message: `Cannot approve discharge with status: ${discharge.status}`
            });
        }

        discharge.status = 'approved';
        discharge.approvedBy = userId;
        discharge.approvedAt = new Date();

        await discharge.save();

        res.json({
            success: true,
            message: 'Discharge approved successfully',
            discharge,
        });
    } catch (error) {
        console.error('Approve discharge error:', error);
        res.status(500).json({ message: 'Failed to approve discharge', error: error.message });
    }
};

// Complete discharge (mark patient as discharged)
export const completeDischarge = async (req, res) => {
    try {
        const { id } = req.params;
        const hospitalId = req.user._id;
        const userId = req.user._id;

        const discharge = await HospitalDischarge.findOne({
            _id: id,
            hospital: hospitalId,
        });

        if (!discharge) {
            return res.status(404).json({ message: 'Discharge not found' });
        }

        if (discharge.status !== 'approved') {
            return res.status(400).json({
                message: `Cannot complete discharge with status: ${discharge.status}. Must be approved first.`
            });
        }

        discharge.status = 'completed';
        discharge.completedBy = userId;
        discharge.completedAt = new Date();

        await discharge.save();

        res.json({
            success: true,
            message: 'Discharge completed successfully',
            discharge,
        });
    } catch (error) {
        console.error('Complete discharge error:', error);
        res.status(500).json({ message: 'Failed to complete discharge', error: error.message });
    }
};

// Cancel discharge
export const cancelDischarge = async (req, res) => {
    try {
        const { id } = req.params;
        const hospitalId = req.user._id;
        const { reason } = req.body;

        const discharge = await HospitalDischarge.findOne({
            _id: id,
            hospital: hospitalId,
        });

        if (!discharge) {
            return res.status(404).json({ message: 'Discharge not found' });
        }

        if (discharge.status === 'completed') {
            return res.status(400).json({
                message: 'Cannot cancel a completed discharge'
            });
        }

        discharge.status = 'cancelled';
        if (reason) {
            discharge.notes = `${discharge.notes}\n\nCancellation Reason: ${reason}`;
        }

        await discharge.save();

        res.json({
            message: 'Discharge cancelled successfully',
            discharge,
        });
    } catch (error) {
        console.error('Cancel discharge error:', error);
        res.status(500).json({ message: 'Failed to cancel discharge', error: error.message });
    }
};

// Get discharge statistics
export const getDischargeStats = async (req, res) => {
    try {
        const hospitalId = req.user._id;
        const { startDate, endDate } = req.query;

        const query = { hospital: hospitalId };

        if (startDate || endDate) {
            query.dischargeDate = {};
            if (startDate) query.dischargeDate.$gte = new Date(startDate);
            if (endDate) query.dischargeDate.$lte = new Date(endDate);
        }

        const [
            totalDischarges,
            pendingDischarges,
            approvedDischarges,
            completedDischarges,
            cancelledDischarges,
            byDepartment,
            byType,
            byDestination,
        ] = await Promise.all([
            HospitalDischarge.countDocuments(query),
            HospitalDischarge.countDocuments({ ...query, status: 'pending' }),
            HospitalDischarge.countDocuments({ ...query, status: 'approved' }),
            HospitalDischarge.countDocuments({ ...query, status: 'completed' }),
            HospitalDischarge.countDocuments({ ...query, status: 'cancelled' }),
            HospitalDischarge.aggregate([
                { $match: query },
                { $group: { _id: '$department', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
            HospitalDischarge.aggregate([
                { $match: query },
                { $group: { _id: '$dischargeType', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
            HospitalDischarge.aggregate([
                { $match: query },
                { $group: { _id: '$dischargeDestination', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
        ]);

        res.json({
            stats: {
                total: totalDischarges,
                pending: pendingDischarges,
                approved: approvedDischarges,
                completed: completedDischarges,
                cancelled: cancelledDischarges,
                byDepartment,
                byType,
                byDestination,
            },
        });
    } catch (error) {
        console.error('Get discharge stats error:', error);
        res.status(500).json({ message: 'Failed to fetch discharge statistics', error: error.message });
    }
};
