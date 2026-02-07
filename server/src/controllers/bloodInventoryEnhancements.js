import BloodInventory from '../models/BloodInventory.js';

// Batch update inventory items
export const batchUpdateInventory = async (req, res) => {
    try {
        const { bloodBankId } = req.user;
        const { items, updateData } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Items array is required'
            });
        }

        const results = {
            success: [],
            failed: []
        };

        for (const itemId of items) {
            try {
                const inventory = await BloodInventory.findOne({
                    _id: itemId,
                    bloodBankId,
                    isActive: true
                });

                if (inventory) {
                    Object.keys(updateData).forEach(key => {
                        if (key !== '_id' && key !== 'bloodBankId' && key !== 'createdBy') {
                            inventory[key] = updateData[key];
                        }
                    });

                    inventory.updatedBy = req.user._id;
                    inventory.addAuditTrail(
                        'Batch Updated',
                        req.user._id,
                        `${req.user.firstName} ${req.user.lastName}`,
                        'Batch update operation'
                    );

                    await inventory.save();
                    results.success.push(itemId);
                } else {
                    results.failed.push({ itemId, reason: 'Not found' });
                }
            } catch (error) {
                results.failed.push({ itemId, reason: error.message });
            }
        }

        res.json({
            success: true,
            message: `Batch update completed. ${results.success.length} succeeded, ${results.failed.length} failed`,
            data: results
        });
    } catch (error) {
        console.error('Error in batch update:', error);
        res.status(500).json({
            success: false,
            message: 'Batch update failed',
            error: error.message
        });
    }
};

// Batch delete inventory items
export const batchDeleteInventory = async (req, res) => {
    try {
        const { bloodBankId } = req.user;
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Items array is required'
            });
        }

        const result = await BloodInventory.updateMany(
            {
                _id: { $in: items },
                bloodBankId,
                isActive: true
            },
            {
                $set: {
                    isActive: false,
                    updatedBy: req.user._id
                }
            }
        );

        res.json({
            success: true,
            message: `${result.modifiedCount} items deleted successfully`,
            data: {
                deletedCount: result.modifiedCount
            }
        });
    } catch (error) {
        console.error('Error in batch delete:', error);
        res.status(500).json({
            success: false,
            message: 'Batch delete failed',
            error: error.message
        });
    }
};

// Get expiring inventory with advanced filtering
export const getExpiringInventory = async (req, res) => {
    try {
        const { bloodBankId } = req.user;
        const { days = 7, bloodType, componentType } = req.query;

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + parseInt(days));

        const query = {
            bloodBankId,
            isActive: true,
            status: 'Available',
            'expiry.expiryDate': { $lte: expiryDate, $gte: new Date() }
        };

        if (bloodType) query.bloodType = bloodType;
        if (componentType) query.componentType = componentType;

        const expiringItems = await BloodInventory.find(query)
            .sort({ 'expiry.expiryDate': 1 })
            .populate('donorId', 'donorId personalInfo.firstName personalInfo.lastName');

        res.json({
            success: true,
            data: expiringItems,
            count: expiringItems.length
        });
    } catch (error) {
        console.error('Error getting expiring inventory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch expiring inventory',
            error: error.message
        });
    }
};

// Get low stock items
export const getLowStockItems = async (req, res) => {
    try {
        const { bloodBankId } = req.user;
        const { threshold = 10 } = req.query;

        const lowStockItems = await BloodInventory.aggregate([
            {
                $match: {
                    bloodBankId,
                    isActive: true,
                    status: 'Available'
                }
            },
            {
                $group: {
                    _id: {
                        bloodType: '$bloodType',
                        componentType: '$componentType'
                    },
                    totalQuantity: { $sum: '$quantity' },
                    count: { $sum: 1 }
                }
            },
            {
                $match: {
                    totalQuantity: { $lt: parseInt(threshold) }
                }
            },
            {
                $project: {
                    bloodType: '$_id.bloodType',
                    componentType: '$_id.componentType',
                    totalQuantity: 1,
                    count: 1,
                    _id: 0
                }
            }
        ]);

        res.json({
            success: true,
            data: lowStockItems,
            count: lowStockItems.length
        });
    } catch (error) {
        console.error('Error getting low stock items:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch low stock items',
            error: error.message
        });
    }
};

// Transfer inventory between locations
export const transferInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const { bloodBankId } = req.user;
        const { newLocation, reason } = req.body;

        if (!newLocation) {
            return res.status(400).json({
                success: false,
                message: 'New location is required'
            });
        }

        const inventory = await BloodInventory.findOne({
            _id: id,
            bloodBankId,
            isActive: true
        });

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'Inventory item not found'
            });
        }

        const oldLocation = inventory.storageLocation;
        inventory.storageLocation = newLocation;
        inventory.updatedBy = req.user._id;

        inventory.addAuditTrail(
            'Location Transfer',
            req.user._id,
            `${req.user.firstName} ${req.user.lastName}`,
            `Transferred from ${JSON.stringify(oldLocation)} to ${JSON.stringify(newLocation)}. Reason: ${reason || 'N/A'}`
        );

        await inventory.save();

        res.json({
            success: true,
            message: 'Inventory transferred successfully',
            data: inventory
        });
    } catch (error) {
        console.error('Error transferring inventory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to transfer inventory',
            error: error.message
        });
    }
};

// Track wastage
export const trackWastage = async (req, res) => {
    try {
        const { id } = req.params;
        const { bloodBankId } = req.user;
        const { reason, quantity, notes } = req.body;

        const inventory = await BloodInventory.findOne({
            _id: id,
            bloodBankId,
            isActive: true
        });

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'Inventory item not found'
            });
        }

        inventory.status = 'Expired';
        inventory.wastage = {
            reason,
            quantity: quantity || inventory.quantity,
            date: new Date(),
            recordedBy: req.user._id,
            notes
        };

        inventory.addAuditTrail(
            'Wastage Recorded',
            req.user._id,
            `${req.user.firstName} ${req.user.lastName}`,
            `Wastage recorded. Reason: ${reason}, Quantity: ${quantity || inventory.quantity}`
        );

        await inventory.save();

        res.json({
            success: true,
            message: 'Wastage recorded successfully',
            data: inventory
        });
    } catch (error) {
        console.error('Error tracking wastage:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track wastage',
            error: error.message
        });
    }
};

// Check cross-matching compatibility
export const checkCompatibility = async (req, res) => {
    try {
        const { bloodBankId } = req.user;
        const { patientBloodType, componentType, quantity = 1 } = req.query;

        if (!patientBloodType) {
            return res.status(400).json({
                success: false,
                message: 'Patient blood type is required'
            });
        }

        // Blood type compatibility matrix
        const compatibilityMatrix = {
            'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
            'O+': ['O+', 'A+', 'B+', 'AB+'],
            'A-': ['A-', 'A+', 'AB-', 'AB+'],
            'A+': ['A+', 'AB+'],
            'B-': ['B-', 'B+', 'AB-', 'AB+'],
            'B+': ['B+', 'AB+'],
            'AB-': ['AB-', 'AB+'],
            'AB+': ['AB+']
        };

        const compatibleTypes = Object.keys(compatibilityMatrix).filter(type =>
            compatibilityMatrix[type].includes(patientBloodType)
        );

        const query = {
            bloodBankId,
            isActive: true,
            status: 'Available',
            bloodType: { $in: compatibleTypes }
        };

        if (componentType) query.componentType = componentType;

        const compatibleInventory = await BloodInventory.find(query)
            .sort({ 'expiry.expiryDate': 1 }) // FIFO - First In First Out
            .limit(parseInt(quantity) * 2); // Get extra for options

        res.json({
            success: true,
            data: {
                patientBloodType,
                compatibleBloodTypes: compatibleTypes,
                availableUnits: compatibleInventory,
                count: compatibleInventory.length
            }
        });
    } catch (error) {
        console.error('Error checking compatibility:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check compatibility',
            error: error.message
        });
    }
};

export default {
    batchUpdateInventory,
    batchDeleteInventory,
    getExpiringInventory,
    getLowStockItems,
    transferInventory,
    trackWastage,
    checkCompatibility
};
