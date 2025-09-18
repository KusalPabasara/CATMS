import { Op } from 'sequelize';
import Appointment from '../models/appointment.model';

/**
 * Check if a given time is within working hours (8 AM to 6 PM)
 */
export const isWorkingHour = (date: Date): boolean => {
  const hour = date.getHours();
  return hour >= 8 && hour < 18;
};

/**
 * Check for conflicting appointments
 * Returns true if there is a conflict
 */
export const hasConflictingAppointment = async (
  doctorId: number,
  appointmentTime: Date
): Promise<boolean> => {
  // Check 30 minutes before and after the appointment time
  const startTime = new Date(appointmentTime.getTime() - 30 * 60000);
  const endTime = new Date(appointmentTime.getTime() + 30 * 60000);

  const conflicts = await Appointment.findOne({
    where: {
      doctor_id: doctorId,
      appointment_date: {
        [Op.between]: [startTime, endTime]
      },
      status: {
        [Op.notIn]: ['cancelled', 'completed']
      }
    }
  });

  return !!conflicts;
};

/**
 * Get available time slots for a doctor on a given date
 */
export const getAvailableTimeSlots = async (
  doctorId: number,
  date: Date
): Promise<Date[]> => {
  const workingHours = {
    start: 8,
    end: 18
  };

  // Create array of all possible time slots
  const slots: Date[] = [];
  const currentDate = new Date(date);
  currentDate.setHours(workingHours.start, 0, 0, 0);

  while (currentDate.getHours() < workingHours.end) {
    slots.push(new Date(currentDate));
    currentDate.setMinutes(currentDate.getMinutes() + 30);
  }

  // Get booked appointments for the day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const bookedAppointments = await Appointment.findAll({
    where: {
      doctor_id: doctorId,
      appointment_date: {
        [Op.between]: [startOfDay, endOfDay]
      },
      status: {
        [Op.notIn]: ['cancelled', 'completed']
      }
    }
  });

  // Filter out booked slots
  return slots.filter(slot => {
    return !bookedAppointments.some(appointment => {
      const appointmentTime = new Date(appointment.getDataValue('appointment_date'));
      const timeDiff = Math.abs(appointmentTime.getTime() - slot.getTime());
      return timeDiff < 30 * 60000; // 30 minutes in milliseconds
    });
  });
};