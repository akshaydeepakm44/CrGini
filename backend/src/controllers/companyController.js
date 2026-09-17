import Company from '../models/Company.js';

// @desc    Get current user's company information (including pre-researched leads & key people)
// @route   GET /api/company/my-company
// @access  Private (USER or other roles with companyId)
export const getMyCompany = async (req, res) => {
  try {
    if (!req.user.companyId) {
      return res.status(404).json({
        success: false,
        message: 'No company profile linked to this account.'
      });
    }

    const company = await Company.findById(req.user.companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found.'
      });
    }

    return res.json({
      success: true,
      company
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch company details',
      error: error.message
    });
  }
};

// @desc    Get company by ID (Admin & internal teams)
// @route   GET /api/company/:id
// @access  Private (ADMIN, COMPANY_LEAD, COMPANY_BOOST, LANDING_PAGE)
export const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    return res.json({
      success: true,
      company
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
