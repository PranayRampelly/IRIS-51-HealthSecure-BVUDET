import ProofTemplate from '../models/ProofTemplate.js';
import logger from '../utils/logger.js';

// Create new proof template
export const createProofTemplate = async (req, res) => {
  try {
    const {
      name,
      description,
      proofType,
      defaultUrgency,
      defaultReason,
      category,
      defaultPriority,
      defaultDueDays,
      isDefault,
      tags
    } = req.body;

    // Check if template with same name exists
    const existingTemplate = await ProofTemplate.findOne({ 
      name, 
      createdBy: req.user.id,
      isActive: true 
    });

    if (existingTemplate) {
      return res.status(400).json({ error: 'Template with this name already exists' });
    }

    const template = new ProofTemplate({
      name,
      description,
      proofType,
      defaultUrgency: defaultUrgency || 'medium',
      defaultReason,
      category,
      defaultPriority: defaultPriority || 3,
      defaultDueDays: defaultDueDays || 7,
      isDefault: isDefault || false,
      tags: tags || [],
      createdBy: req.user.id
    });

    await template.save();

    res.status(201).json({
      success: true,
      message: 'Proof template created successfully',
      data: template
    });
  } catch (error) {
    logger.error('Error creating proof template:', error);
    res.status(500).json({ error: 'Failed to create proof template' });
  }
};

// Get all proof templates
export const getProofTemplates = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      proofType,
      category,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { isActive: true };

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Proof type filter
    if (proofType && proofType !== 'all') {
      filter.proofType = proofType;
    }

    // Category filter
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Active filter
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [templates, total] = await Promise.all([
      ProofTemplate.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'name email'),
      ProofTemplate.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: templates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    logger.error('Error fetching proof templates:', error);
    res.status(500).json({ error: 'Failed to fetch proof templates' });
  }
};

// Get single proof template by ID
export const getProofTemplateById = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await ProofTemplate.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!template) {
      return res.status(404).json({ error: 'Proof template not found' });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    logger.error('Error fetching proof template:', error);
    res.status(500).json({ error: 'Failed to fetch proof template' });
  }
};

// Update proof template
export const updateProofTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const template = await ProofTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ error: 'Proof template not found' });
    }

    // Check if template name already exists (excluding current template)
    if (updateData.name && updateData.name !== template.name) {
      const existingTemplate = await ProofTemplate.findOne({
        name: updateData.name,
        createdBy: req.user.id,
        isActive: true,
        _id: { $ne: id }
      });

      if (existingTemplate) {
        return res.status(400).json({ error: 'Template with this name already exists' });
      }
    }

    updateData.updatedBy = req.user.id;
    updateData.updatedAt = new Date();

    const updatedTemplate = await ProofTemplate.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('updatedBy', 'name email');

    res.json({
      success: true,
      message: 'Proof template updated successfully',
      data: updatedTemplate
    });
  } catch (error) {
    logger.error('Error updating proof template:', error);
    res.status(500).json({ error: 'Failed to update proof template' });
  }
};

// Delete proof template (soft delete)
export const deleteProofTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await ProofTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ error: 'Proof template not found' });
    }

    // Soft delete by setting isActive to false
    template.isActive = false;
    template.updatedBy = req.user.id;
    await template.save();

    res.json({
      success: true,
      message: 'Proof template deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting proof template:', error);
    res.status(500).json({ error: 'Failed to delete proof template' });
  }
};

// Set template as default
export const setDefaultTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await ProofTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ error: 'Proof template not found' });
    }

    // Remove default from other templates of same proof type
    await ProofTemplate.updateMany(
      { 
        proofType: template.proofType,
        _id: { $ne: id },
        isActive: true
      },
      { isDefault: false }
    );

    // Set current template as default
    template.isDefault = true;
    template.updatedBy = req.user.id;
    await template.save();

    res.json({
      success: true,
      message: 'Template set as default successfully',
      data: template
    });
  } catch (error) {
    logger.error('Error setting default template:', error);
    res.status(500).json({ error: 'Failed to set default template' });
  }
};

// Get templates by proof type
export const getTemplatesByProofType = async (req, res) => {
  try {
    const { proofType } = req.params;

    const templates = await ProofTemplate.find({
      proofType,
      isActive: true
    })
    .sort({ isDefault: -1, usageCount: -1, name: 1 })
    .populate('createdBy', 'name email');

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    logger.error('Error fetching templates by proof type:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

// Get default templates
export const getDefaultTemplates = async (req, res) => {
  try {
    const templates = await ProofTemplate.find({
      isDefault: true,
      isActive: true
    })
    .sort({ proofType: 1, name: 1 })
    .populate('createdBy', 'name email');

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    logger.error('Error fetching default templates:', error);
    res.status(500).json({ error: 'Failed to fetch default templates' });
  }
};

// Get template usage statistics
export const getTemplateUsageStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = { isActive: true };
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const [
      totalTemplates,
      activeTemplates,
      defaultTemplates,
      mostUsedTemplates,
      templatesByType,
      templatesByCategory
    ] = await Promise.all([
      ProofTemplate.countDocuments(filter),
      ProofTemplate.countDocuments({ ...filter, usageCount: { $gt: 0 } }),
      ProofTemplate.countDocuments({ ...filter, isDefault: true }),
      ProofTemplate.find(filter)
        .sort({ usageCount: -1 })
        .limit(10)
        .populate('createdBy', 'name email'),
      ProofTemplate.aggregate([
        { $match: filter },
        { $group: { _id: '$proofType', count: { $sum: 1 } } }
      ]),
      ProofTemplate.aggregate([
        { $match: filter },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        total: totalTemplates,
        active: activeTemplates,
        default: defaultTemplates,
        mostUsed: mostUsedTemplates,
        byType: templatesByType,
        byCategory: templatesByCategory
      }
    });
  } catch (error) {
    logger.error('Error fetching template usage stats:', error);
    res.status(500).json({ error: 'Failed to fetch template usage stats' });
  }
};

// Duplicate template
export const duplicateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const originalTemplate = await ProofTemplate.findById(id);
    if (!originalTemplate) {
      return res.status(404).json({ error: 'Proof template not found' });
    }

    const newTemplate = new ProofTemplate({
      name: name || `${originalTemplate.name} (Copy)`,
      description: description || originalTemplate.description,
      proofType: originalTemplate.proofType,
      defaultUrgency: originalTemplate.defaultUrgency,
      defaultReason: originalTemplate.defaultReason,
      category: originalTemplate.category,
      defaultPriority: originalTemplate.defaultPriority,
      defaultDueDays: originalTemplate.defaultDueDays,
      isDefault: false, // Duplicate is never default
      tags: originalTemplate.tags,
      createdBy: req.user.id
    });

    await newTemplate.save();

    res.status(201).json({
      success: true,
      message: 'Template duplicated successfully',
      data: newTemplate
    });
  } catch (error) {
    logger.error('Error duplicating template:', error);
    res.status(500).json({ error: 'Failed to duplicate template' });
  }
};

// Export templates
export const exportTemplates = async (req, res) => {
  try {
    const { format = 'json' } = req.query;

    const templates = await ProofTemplate.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = templates.map(template => ({
        name: template.name,
        description: template.description,
        proofType: template.proofType,
        defaultUrgency: template.defaultUrgency,
        category: template.category,
        usageCount: template.usageCount,
        isDefault: template.isDefault,
        createdBy: template.createdBy?.name || '',
        createdAt: template.createdAt
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=templates.csv');
      
      // Convert to CSV string
      const csvString = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      res.send(csvString);
    } else {
      res.json({
        success: true,
        data: templates
      });
    }
  } catch (error) {
    logger.error('Error exporting templates:', error);
    res.status(500).json({ error: 'Failed to export templates' });
  }
}; 