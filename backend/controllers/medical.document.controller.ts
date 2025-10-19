import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import path from "path";
import fs from "fs/promises";
import fileUpload from "express-fileupload";
import Patient from "../models/patient.model";
import { v4 as uuidv4 } from "uuid";
import MedicalDocument from "../models/medical.document.model";
import { logAuditWithRequest, auditActions } from "../services/audit.service";
import { sendEmail, emailTemplates } from "../services/email.service";
import { sendSMS, smsTemplates } from "../services/sms.service";

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'medical_documents');

// Ensure upload directory exists
fs.mkdir(UPLOAD_DIR, { recursive: true }).catch(console.error);

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/dicom',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    if (!req.files || !(req.files as any).document) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = (req.files as any).document as UploadedFile;
    const { 
      patient_id,
      document_type,
      title,
      description,
      is_public,
      tags
    } = req.body;

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      return res.status(400).json({ error: "Invalid file type" });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({ error: "File size too large" });
    }

    // Generate unique filename
    const ext = path.extname(file.name);
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    // Move file to upload directory
    await file.mv(filePath);

    // Create document record
    const document = await MedicalDocument.create({
      patient_id,
      uploaded_by: req.user.id, // Assuming user info is in request
      document_type,
      title,
      description,
      file_path: filename,
      file_type: file.mimetype,
      file_size: file.size,
      is_public: is_public === 'true',
      tags: tags ? JSON.parse(tags) : []
    });

    // Log audit trail
    await logAuditWithRequest(
      req,
      auditActions.DOCUMENT_UPLOADED,
      'medical_documents',
      document.getDataValue('document_id'),
      `Uploaded document: ${title} for patient ID: ${patient_id}`
    );

    // Notify patient if document is public
    if (document.getDataValue('is_public')) {
      const patient = await Patient.findByPk(patient_id);
      
      if (patient?.email) {
        const emailTemplate = emailTemplates.documentUploaded(
          patient.getDataValue('full_name'),
          title,
          document_type
        );
        await sendEmail(
          patient.getDataValue('email'),
          emailTemplate.subject,
          emailTemplate.html
        );
      }
    }

    res.status(201).json({
      document,
      message: 'Document uploaded successfully'
    });
  } catch (err) {
    console.error('Failed to upload document:', err);
    res.status(400).json({ error: "Failed to upload document", details: err });
  }
};

export const getPatientDocuments = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const { type, status } = req.query;

    const whereClause: any = {
      patient_id: patientId,
      status: status || 'active'
    };

    if (type) {
      whereClause.document_type = type;
    }

    // If request is from patient portal, only show public documents
    if (req.user.role === 'Patient') {
      whereClause.is_public = true;
    }

    const documents = await MedicalDocument.findAll({
      where: whereClause,
      order: [['upload_date', 'DESC']]
    });

    res.json(documents);
  } catch (err) {
    console.error('Failed to fetch documents:', err);
    res.status(500).json({ error: "Failed to fetch documents", details: err });
  }
};

export const downloadDocument = async (req: Request, res: Response) => {
  try {
    const documentId = parseInt(req.params.documentId, 10);
    const document = await MedicalDocument.findByPk(documentId);

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Check access permission
    if (req.user.role === 'Patient' && !document.getDataValue('is_public')) {
      return res.status(403).json({ error: "Access denied" });
    }

    const filePath = path.join(UPLOAD_DIR, document.getDataValue('file_path'));
    
    // Update last accessed
    await document.update({
      last_accessed: new Date()
    });

    // Log audit trail
    await logAuditWithRequest(
      req,
      auditActions.DOCUMENT_ACCESSED,
      'medical_documents',
      documentId,
      `Downloaded document: ${document.getDataValue('title')}`
    );

    res.download(filePath, document.getDataValue('title'));
  } catch (err) {
    console.error('Failed to download document:', err);
    res.status(500).json({ error: "Failed to download document", details: err });
  }
};

export const updateDocumentStatus = async (req: Request, res: Response) => {
  try {
    const documentId = parseInt(req.params.documentId, 10);
    const { status, is_public } = req.body;

    const document = await MedicalDocument.findByPk(documentId);
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    await document.update({
      status,
      is_public: is_public === undefined ? document.getDataValue('is_public') : is_public
    });

    // Log audit trail
    await logAuditWithRequest(
      req,
      auditActions.DOCUMENT_UPDATED,
      'medical_documents',
      documentId,
      `Updated document status to: ${status}`
    );

    res.json({
      document,
      message: 'Document status updated successfully'
    });
  } catch (err) {
    console.error('Failed to update document:', err);
    res.status(400).json({ error: "Failed to update document", details: err });
  }
};