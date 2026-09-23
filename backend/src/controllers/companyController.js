import {
  findCompanyById,
} from '../repositories/companyRepository.js';

// @desc    Get current user's company information
// @route   GET /api/company/my-company
// @access  Private
export const getMyCompany = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(404).json({
        success: false,
        message: 'No company profile linked to this account.',
      });
    }

    const company = await findCompanyById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found.',
      });
    }

    return res.json({
      success: true,
      company,
    });
  } catch (error) {
    console.error('[Company Error]:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch company details. Please try again later.',
    });
  }
};

// @desc    Get company by ID
// @route   GET /api/company/:id
// @access  Private
export const getCompanyById = async (req, res) => {
  try {
    const company = await findCompanyById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    return res.json({
      success: true,
      company,
    });
  } catch (error) {
    console.error('[Company Error]:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch company details. Please try again later.',
    });
  }
};
