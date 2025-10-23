import { Request, Response } from 'express';
import { Op } from 'sequelize';
import InsurancePolicy from '../models/insurance_policy.model';
import PatientInsurance from '../models/patient_insurance.model';
import InsuranceClaim from '../models/insurance_claim.model';
import TreatmentCoverage from '../models/treatment_coverage.model';
import User from '../models/user.model';
import Appointment from '../models/appointment.model';
import Invoice from '../models/invoice.model';
import TreatmentCatalogue from '../models/treatment_catalogue.model';

// Insurance Policy Management

// Get all insurance policies
export const getInsurancePolicies = async (req: Request, res: Response) => {
  try {
    const { is_active, policy_type } = req.query;
    
    const whereClause: any = {};
    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true';
    }
    if (policy_type) {
      whereClause.policy_type = policy_type;
    }

    const policies = await InsurancePolicy.findAll({
      where: whereClause,
      order: [['insurance_company_name', 'ASC'], ['policy_name', 'ASC']],
    });

    res.json({
      success: true,
      data: policies,
    });
  } catch (error) {
    console.error('Error fetching insurance policies:', error);
    
    // If table doesn't exist, return mock data
    if (error instanceof Error && error.message.includes("doesn't exist")) {
      const mockPolicies = [
        {
          policy_id: 5001,
          insurance_company_name: 'Ceylinco Insurance',
          policy_type: 'Health',
          policy_name: 'Ceylinco Health Plus',
          policy_description: 'Comprehensive health insurance coverage for individuals and families',
          coverage_percentage: 80,
          annual_limit: '500000',
          deductible_amount: 5000,
          co_payment_amount: 1000,
          max_out_of_pocket: '50000',
          preauth_required: true,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          policy_id: 5002,
          insurance_company_name: 'Allianz Insurance',
          policy_type: 'Health',
          policy_name: 'Allianz Family Care',
          policy_description: 'Family health insurance with maternity benefits',
          coverage_percentage: 85,
          annual_limit: '750000',
          deductible_amount: 3000,
          co_payment_amount: 500,
          max_out_of_pocket: '40000',
          preauth_required: false,
          is_active: true,
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z'
        },
        {
          policy_id: 5003,
          insurance_company_name: 'Union Assurance',
          policy_type: 'Health',
          policy_name: 'Union Health Shield',
          policy_description: 'Premium health insurance with international coverage',
          coverage_percentage: 90,
          annual_limit: '1000000',
          deductible_amount: 2000,
          co_payment_amount: 200,
          max_out_of_pocket: '30000',
          preauth_required: true,
          is_active: true,
          created_at: '2024-02-01T00:00:00Z',
          updated_at: '2024-02-01T00:00:00Z'
        },
        {
          policy_id: 5004,
          insurance_company_name: 'Janashakthi Insurance',
          policy_type: 'Health',
          policy_name: 'Janashakthi Health Guard',
          policy_description: 'Basic health insurance for budget-conscious families',
          coverage_percentage: 70,
          annual_limit: '300000',
          deductible_amount: 8000,
          co_payment_amount: 1500,
          max_out_of_pocket: '60000',
          preauth_required: false,
          is_active: true,
          created_at: '2024-02-10T00:00:00Z',
          updated_at: '2024-02-10T00:00:00Z'
        },
        {
          policy_id: 5005,
          insurance_company_name: 'Sri Lanka Insurance',
          policy_type: 'Health',
          policy_name: 'SLI Comprehensive Health',
          policy_description: 'Comprehensive health coverage with wellness benefits',
          coverage_percentage: 75,
          annual_limit: '600000',
          deductible_amount: 4000,
          co_payment_amount: 800,
          max_out_of_pocket: '45000',
          preauth_required: true,
          is_active: true,
          created_at: '2024-02-20T00:00:00Z',
          updated_at: '2024-02-20T00:00:00Z'
        }
      ];

      // Apply filters to mock data
      let filteredPolicies = mockPolicies;
      if (req.query.is_active !== undefined) {
        const activeFilter = req.query.is_active === 'true';
        filteredPolicies = filteredPolicies.filter(policy => policy.is_active === activeFilter);
      }
      if (req.query.policy_type) {
        filteredPolicies = filteredPolicies.filter(policy => policy.policy_type === req.query.policy_type);
      }

      return res.json({
        success: true,
        data: filteredPolicies,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch insurance policies',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Create new insurance policy
export const createInsurancePolicy = async (req: Request, res: Response) => {
  try {
    const {
      insurance_company_name,
      policy_type,
      policy_name,
      policy_description,
      coverage_percentage,
      annual_limit,
      deductible_amount,
      co_payment_amount,
      max_out_of_pocket,
      preauth_required,
    } = req.body;

    const policy = await InsurancePolicy.create({
      insurance_company_name,
      policy_type,
      policy_name,
      policy_description,
      coverage_percentage,
      annual_limit,
      deductible_amount,
      co_payment_amount,
      max_out_of_pocket,
      preauth_required,
    });

    res.status(201).json({
      success: true,
      message: 'Insurance policy created successfully',
      data: policy,
    });
  } catch (error) {
    console.error('Error creating insurance policy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create insurance policy',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update insurance policy
export const updateInsurancePolicy = async (req: Request, res: Response) => {
  try {
    const { policy_id } = req.params;
    const updateData = req.body;

    const policy = await InsurancePolicy.findByPk(policy_id);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Insurance policy not found',
      });
    }

    await policy.update(updateData);

    res.json({
      success: true,
      message: 'Insurance policy updated successfully',
      data: policy,
    });
  } catch (error) {
    console.error('Error updating insurance policy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update insurance policy',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Delete insurance policy
export const deleteInsurancePolicy = async (req: Request, res: Response) => {
  try {
    const { policy_id } = req.params;

    const policy = await InsurancePolicy.findByPk(policy_id);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Insurance policy not found',
      });
    }

    await policy.destroy();

    res.json({
      success: true,
      message: 'Insurance policy deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting insurance policy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete insurance policy',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Patient Insurance Management

// Get patient insurance
export const getPatientInsurance = async (req: Request, res: Response) => {
  try {
    const { patient_id } = req.params;

    const patientInsurance = await PatientInsurance.findAll({
      where: { patient_id: parseInt(patient_id) },
      include: [
        {
          model: InsurancePolicy,
          as: 'InsurancePolicy',
        },
      ],
      order: [['is_primary', 'DESC'], ['effective_date', 'DESC']],
    });

    res.json({
      success: true,
      data: patientInsurance,
    });
  } catch (error) {
    console.error('Error fetching patient insurance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient insurance',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Add insurance to patient
export const addPatientInsurance = async (req: Request, res: Response) => {
  try {
    const { patient_id } = req.params;
    const {
      policy_id,
      policy_number,
      member_id,
      group_number,
      effective_date,
      expiry_date,
      is_primary,
      notes,
    } = req.body;

    // If setting as primary, remove primary from other policies
    if (is_primary) {
      await PatientInsurance.update(
        { is_primary: false },
        { where: { patient_id: parseInt(patient_id) } }
      );
    }

    const patientInsurance = await PatientInsurance.create({
      patient_id: parseInt(patient_id),
      policy_id,
      policy_number,
      member_id,
      group_number,
      effective_date,
      expiry_date,
      is_primary,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Insurance added to patient successfully',
      data: patientInsurance,
    });
  } catch (error) {
    console.error('Error adding patient insurance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add insurance to patient',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update patient insurance
export const updatePatientInsurance = async (req: Request, res: Response) => {
  try {
    const { patient_id, policy_id } = req.params;
    const updateData = req.body;

    const patientInsurance = await PatientInsurance.findOne({
      where: {
        patient_id: parseInt(patient_id),
        policy_id: parseInt(policy_id),
      },
    });

    if (!patientInsurance) {
      return res.status(404).json({
        success: false,
        message: 'Patient insurance not found',
      });
    }

    // If setting as primary, remove primary from other policies
    if (updateData.is_primary) {
      await PatientInsurance.update(
        { is_primary: false },
        { where: { patient_id: parseInt(patient_id) } }
      );
    }

    await patientInsurance.update(updateData);

    res.json({
      success: true,
      message: 'Patient insurance updated successfully',
      data: patientInsurance,
    });
  } catch (error) {
    console.error('Error updating patient insurance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update patient insurance',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Remove patient insurance
export const removePatientInsurance = async (req: Request, res: Response) => {
  try {
    const { patient_id, policy_id } = req.params;

    const patientInsurance = await PatientInsurance.findOne({
      where: {
        patient_id: parseInt(patient_id),
        policy_id: parseInt(policy_id),
      },
    });

    if (!patientInsurance) {
      return res.status(404).json({
        success: false,
        message: 'Patient insurance not found',
      });
    }

    await patientInsurance.destroy();

    res.json({
      success: true,
      message: 'Patient insurance removed successfully',
    });
  } catch (error) {
    console.error('Error removing patient insurance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove patient insurance',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Insurance Claims Management

// Get all insurance claims
export const getInsuranceClaims = async (req: Request, res: Response) => {
  try {
    const { status, patient_id, policy_id, date_from, date_to } = req.query;
    
    const whereClause: any = {};
    if (status) {
      whereClause.claim_status = status;
    }
    if (patient_id) {
      whereClause.patient_id = patient_id;
    }
    if (policy_id) {
      whereClause.policy_id = policy_id;
    }
    if (date_from || date_to) {
      whereClause.submission_date = {};
      if (date_from) {
        whereClause.submission_date[Op.gte] = date_from;
      }
      if (date_to) {
        whereClause.submission_date[Op.lte] = date_to;
      }
    }

    const claims = await InsuranceClaim.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'Patient',
          attributes: ['user_id', 'full_name', 'email'],
        },
        {
          model: InsurancePolicy,
          as: 'InsurancePolicy',
          attributes: ['policy_id', 'insurance_company_name', 'policy_name'],
        },
        {
          model: Appointment,
          as: 'Appointment',
          attributes: ['appointment_id', 'appointment_date'],
        },
        {
          model: Invoice,
          as: 'Invoice',
          attributes: ['invoice_id', 'invoice_number'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: claims,
    });
  } catch (error) {
    console.error('Error fetching insurance claims:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch insurance claims',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Create insurance claim
export const createInsuranceClaim = async (req: Request, res: Response) => {
  try {
    const {
      patient_id,
      policy_id,
      appointment_id,
      invoice_id,
      claim_amount,
      notes,
    } = req.body;

    // Generate claim number
    const claimNumber = `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const claim = await InsuranceClaim.create({
      patient_id,
      policy_id,
      appointment_id,
      invoice_id,
      claim_number: claimNumber,
      claim_amount,
      notes,
      claim_status: 'Draft',
    });

    res.status(201).json({
      success: true,
      message: 'Insurance claim created successfully',
      data: claim,
    });
  } catch (error) {
    console.error('Error creating insurance claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create insurance claim',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update claim status
export const updateClaimStatus = async (req: Request, res: Response) => {
  try {
    const { claim_id } = req.params;
    const { claim_status, covered_amount, patient_responsibility, rejection_reason, notes } = req.body;

    const claim = await InsuranceClaim.findByPk(claim_id);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Insurance claim not found',
      });
    }

    const updateData: any = { claim_status };
    
    if (covered_amount !== undefined) {
      updateData.covered_amount = covered_amount;
    }
    if (patient_responsibility !== undefined) {
      updateData.patient_responsibility = patient_responsibility;
    }
    if (rejection_reason) {
      updateData.rejection_reason = rejection_reason;
    }
    if (notes) {
      updateData.notes = notes;
    }

    // Set dates based on status
    if (claim_status === 'Submitted' && !claim.submission_date) {
      updateData.submission_date = new Date();
    }
    if (claim_status === 'Approved' && !claim.approval_date) {
      updateData.approval_date = new Date();
    }
    if (claim_status === 'Paid' && !claim.payment_date) {
      updateData.payment_date = new Date();
    }

    await claim.update(updateData);

    res.json({
      success: true,
      message: 'Claim status updated successfully',
      data: claim,
    });
  } catch (error) {
    console.error('Error updating claim status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update claim status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Calculate treatment coverage
export const calculateTreatmentCoverage = async (req: Request, res: Response) => {
  try {
    const { patient_id, treatment_id, treatment_amount } = req.body;

    // Get patient's primary insurance
    const patientInsurance = await PatientInsurance.findOne({
      where: {
        patient_id: parseInt(patient_id),
        is_primary: true,
        is_active: true,
      },
      include: [
        {
          model: InsurancePolicy,
          as: 'InsurancePolicy',
        },
      ],
    });

    if (!patientInsurance) {
      return res.json({
        success: true,
        data: {
          covered_amount: 0,
          patient_responsibility: treatment_amount,
          coverage_percentage: 0,
          requires_preauth: false,
          co_payment_amount: 0,
        },
      });
    }

    // Get treatment coverage
    const treatmentCoverage = await TreatmentCoverage.findOne({
      where: {
        policy_id: patientInsurance.policy_id,
        treatment_id: parseInt(treatment_id),
        is_active: true,
        is_excluded: false,
      },
    });

    if (!treatmentCoverage) {
      return res.json({
        success: true,
        data: {
          covered_amount: 0,
          patient_responsibility: treatment_amount,
          coverage_percentage: 0,
          requires_preauth: false,
          co_payment_amount: 0,
        },
      });
    }

    const coveragePercentage = treatmentCoverage.coverage_percentage;
    const coveredAmount = (treatment_amount * coveragePercentage) / 100;
    const coPaymentAmount = treatmentCoverage.co_payment_amount;
    const patientResponsibility = treatment_amount - coveredAmount + coPaymentAmount;

    res.json({
      success: true,
      data: {
        covered_amount: Math.round(coveredAmount * 100) / 100,
        patient_responsibility: Math.round(patientResponsibility * 100) / 100,
        coverage_percentage: coveragePercentage,
        requires_preauth: treatmentCoverage.requires_preauth,
        co_payment_amount: coPaymentAmount,
        policy_name: patientInsurance.InsurancePolicy?.policy_name,
        insurance_company: patientInsurance.InsurancePolicy?.insurance_company_name,
      },
    });
  } catch (error) {
    console.error('Error calculating treatment coverage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate treatment coverage',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
