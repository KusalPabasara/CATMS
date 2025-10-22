import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Specialty from '../models/specialty.model';
import DoctorSpecialty from '../models/doctor_specialty.model';
import User from '../models/user.model';
import Branch from '../models/branch.model';

// Get all specialties
export const getSpecialties = async (req: Request, res: Response) => {
  try {
    const specialties = await Specialty.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']],
    });

    res.json({
      success: true,
      data: specialties,
    });
  } catch (error) {
    console.error('Error fetching specialties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch specialties',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get doctors with their specialties
export const getDoctorsWithSpecialties = async (req: Request, res: Response) => {
  try {
    const { branch_id } = req.query;
    
    const whereClause: any = {
      role_id: 3, // Doctor role
      is_active: true,
    };
    
    if (branch_id) {
      whereClause.branch_id = branch_id;
    }

    const doctors = await User.findAll({
      where: whereClause,
      include: [
        {
          model: DoctorSpecialty,
          as: 'DoctorSpecialties',
          include: [
            {
              model: Specialty,
              as: 'Specialty',
            },
          ],
        },
        {
          model: Branch,
          as: 'Branch',
        },
      ],
      order: [['full_name', 'ASC']],
    });

    // Transform the data to include specialties array
    const doctorsWithSpecialties = doctors.map(doctor => {
      const specialties = (doctor as any).DoctorSpecialties?.map((ds: any) => ({
        specialty_id: ds.Specialty?.specialty_id,
        name: ds.Specialty?.name,
        description: ds.Specialty?.description,
        is_primary: ds.is_primary,
      })) || [];

      return {
        user_id: doctor.user_id,
        full_name: doctor.full_name,
        email: doctor.email,
        phone: doctor.phone,
        branch_id: doctor.branch_id,
        branch_name: doctor.Branch?.name,
        specialties,
      };
    });

    res.json({
      success: true,
      data: doctorsWithSpecialties,
    });
  } catch (error) {
    console.error('Error fetching doctors with specialties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors with specialties',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Assign specialty to doctor
export const assignSpecialtyToDoctor = async (req: Request, res: Response) => {
  try {
    const { doctor_id, specialty_id, is_primary = false } = req.body;

    // Validate doctor exists and is a doctor
    const doctor = await User.findOne({
      where: {
        user_id: doctor_id,
        role_id: 3, // Doctor role
        is_active: true,
      },
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Validate specialty exists
    const specialty = await Specialty.findOne({
      where: {
        specialty_id,
        is_active: true,
      },
    });

    if (!specialty) {
      return res.status(404).json({
        success: false,
        message: 'Specialty not found',
      });
    }

    // If setting as primary, remove primary from other specialties
    if (is_primary) {
      await DoctorSpecialty.update(
        { is_primary: false },
        { where: { doctor_id } }
      );
    }

    // Create or update the doctor-specialty relationship
    const [doctorSpecialty, created] = await DoctorSpecialty.findOrCreate({
      where: {
        doctor_id,
        specialty_id,
      },
      defaults: {
        doctor_id,
        specialty_id,
        is_primary,
      },
    });

    if (!created) {
      await doctorSpecialty.update({ is_primary });
    }

    res.json({
      success: true,
      message: created ? 'Specialty assigned to doctor' : 'Specialty assignment updated',
      data: doctorSpecialty,
    });
  } catch (error) {
    console.error('Error assigning specialty to doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign specialty to doctor',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Remove specialty from doctor
export const removeSpecialtyFromDoctor = async (req: Request, res: Response) => {
  try {
    const { doctor_id, specialty_id } = req.params;

    const doctorSpecialty = await DoctorSpecialty.findOne({
      where: {
        doctor_id: parseInt(doctor_id),
        specialty_id: parseInt(specialty_id),
      },
    });

    if (!doctorSpecialty) {
      return res.status(404).json({
        success: false,
        message: 'Doctor-specialty relationship not found',
      });
    }

    await doctorSpecialty.destroy();

    res.json({
      success: true,
      message: 'Specialty removed from doctor',
    });
  } catch (error) {
    console.error('Error removing specialty from doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove specialty from doctor',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get doctors by specialty
export const getDoctorsBySpecialty = async (req: Request, res: Response) => {
  try {
    const { specialty_id, branch_id } = req.query;

    const whereClause: any = {
      specialty_id: parseInt(specialty_id as string),
    };

    const includeClause: any = [
      {
        model: User,
        as: 'Doctor',
        where: {
          role_id: 3, // Doctor role
          is_active: true,
        },
        include: [
          {
            model: Branch,
            as: 'Branch',
          },
        ],
      },
      {
        model: Specialty,
        as: 'Specialty',
      },
    ];

    if (branch_id) {
      includeClause[0].where.branch_id = parseInt(branch_id as string);
    }

    const doctorSpecialties = await DoctorSpecialty.findAll({
      where: whereClause,
      include: includeClause,
      order: [
        [{ model: User, as: 'Doctor' }, 'full_name', 'ASC'],
      ],
    });

    const doctors = doctorSpecialties.map(ds => ({
      user_id: ds.Doctor?.user_id,
      full_name: ds.Doctor?.full_name,
      email: ds.Doctor?.email,
      phone: ds.Doctor?.phone,
      branch_id: ds.Doctor?.branch_id,
      branch_name: ds.Doctor?.Branch?.name,
      specialty_name: ds.Specialty?.name,
      is_primary: ds.is_primary,
    }));

    res.json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.error('Error fetching doctors by specialty:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors by specialty',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get specialties by doctor
export const getSpecialtiesByDoctor = async (req: Request, res: Response) => {
  try {
    const { doctor_id } = req.params;

    const doctorSpecialties = await DoctorSpecialty.findAll({
      where: {
        doctor_id: parseInt(doctor_id),
      },
      include: [
        {
          model: Specialty,
          as: 'Specialty',
        },
      ],
      order: [
        ['is_primary', 'DESC'],
        [{ model: Specialty, as: 'Specialty' }, 'name', 'ASC'],
      ],
    });

    const specialties = doctorSpecialties.map(ds => ({
      specialty_id: ds.Specialty?.specialty_id,
      name: ds.Specialty?.name,
      description: ds.Specialty?.description,
      is_primary: ds.is_primary,
    }));

    res.json({
      success: true,
      data: specialties,
    });
  } catch (error) {
    console.error('Error fetching specialties by doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch specialties by doctor',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
