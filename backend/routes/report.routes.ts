import { Router } from "express";
import {
  getDashboardOverview,
  getAppointmentChart,
  getRevenueChart,
  getTopDoctors,
  getPaymentMethodsChart,
  getPatientGrowth,
  getTopTreatments,
  getPaymentMethodTrends,
  getInsuranceClaimStatus,
  getAppointmentStatusDistribution,
  getRevenueBySpecialty
} from "../controllers/report.controller";
import { authenticateToken } from "../auth/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticateToken); // All routes secured

// Dashboard overview - accessible to all authenticated users
router.get("/overview", getDashboardOverview);

// Charts and analytics - accessible to staff and above
router.get("/appointment-chart", authorizeRoles("Doctor", "Receptionist", "Billing Staff", "System Administrator", "Branch Manager"), getAppointmentChart);
router.get("/revenue-monthly", authorizeRoles("Billing Staff", "System Administrator", "Branch Manager"), getRevenueChart);
router.get("/payment-methods", authorizeRoles("Billing Staff", "System Administrator", "Branch Manager"), getPaymentMethodsChart);
router.get("/patient-growth", authorizeRoles("Doctor", "System Administrator", "Branch Manager"), getPatientGrowth);

// Advanced analytics - accessible to managers and admins
router.get("/top-doctors", authorizeRoles("System Administrator", "Branch Manager"), getTopDoctors);
router.get("/top-treatments", authorizeRoles("System Administrator", "Branch Manager"), getTopTreatments);
router.get("/payment-method-trends", authorizeRoles("Billing Staff", "System Administrator", "Branch Manager"), getPaymentMethodTrends);
router.get("/insurance-claims-status", authorizeRoles("System Administrator", "Branch Manager"), getInsuranceClaimStatus);
router.get("/appointment-status-distribution", authorizeRoles("Doctor", "Receptionist", "System Administrator", "Branch Manager"), getAppointmentStatusDistribution);
router.get("/revenue-by-specialty", authorizeRoles("System Administrator", "Branch Manager"), getRevenueBySpecialty);

export default router;
