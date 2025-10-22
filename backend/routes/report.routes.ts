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
  getRevenueBySpecialty,
  getBranchAppointmentSummary,
  getDoctorRevenueReport,
  getOutstandingBalances,
  getTreatmentCategoryReport,
  getInsuranceVsOutOfPocketReport
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

// ===== PHASE 3: REQUIRED REPORTS =====

// Report 1: Branch-wise appointment summary per day
router.get("/branch-appointment-summary", authorizeRoles("System Administrator", "Branch Manager", "Receptionist"), getBranchAppointmentSummary);

// Report 2: Doctor-wise revenue report
router.get("/doctor-revenue", authorizeRoles("System Administrator", "Branch Manager", "Billing Staff"), getDoctorRevenueReport);

// Report 3: List of patients with outstanding balances
router.get("/outstanding-balances", authorizeRoles("System Administrator", "Branch Manager", "Billing Staff"), getOutstandingBalances);

// Report 4: Number of treatments per category over period
router.get("/treatment-category", authorizeRoles("System Administrator", "Branch Manager", "Doctor"), getTreatmentCategoryReport);

// Report 5: Insurance coverage vs out-of-pocket payments
router.get("/insurance-vs-out-of-pocket", authorizeRoles("System Administrator", "Branch Manager", "Billing Staff"), getInsuranceVsOutOfPocketReport);

export default router;
