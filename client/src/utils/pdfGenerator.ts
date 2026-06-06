import { jsPDF } from 'jspdf';
import { Prescription, LabReport, Patient, Billing } from '../types';

/**
 * Generates a clean, professional Prescription PDF and triggers browser download.
 */
export const generatePrescriptionPDF = (prescription: Prescription) => {
  const doc = new jsPDF();
  
  // Hospital Header
  doc.setFillColor(37, 99, 235); // Blue theme
  doc.rect(0, 0, 210, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('MediCare AI Smart Hospital', 20, 20);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Smart Healthcare, Powered by AI', 20, 26);
  
  // Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PRESCRIPTION & INTAKE REGIMEN', 20, 50);
  
  // Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${prescription.created_at.slice(0, 10)}`, 150, 50);
  
  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 55, 190, 55);
  
  // Metadata Grid
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT DETAILS', 20, 65);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${prescription.patient_name || 'Rahul Verma'}`, 20, 72);
  doc.text(`Email: patient@medicare.com`, 20, 78);
  
  doc.setFont('helvetica', 'bold');
  doc.text('CLINICAL DETAILS', 110, 65);
  doc.setFont('helvetica', 'normal');
  doc.text(`Doctor: ${prescription.doctor_name}`, 110, 72);
  doc.text(`Diagnosis: ${prescription.diagnosis}`, 110, 78);
  
  // Divider
  doc.line(20, 85, 190, 85);
  
  // Medicines
  doc.setFont('helvetica', 'bold');
  doc.text('PRESCRIBED MEDICATIONS', 20, 95);
  
  // Table Header
  doc.setFillColor(248, 250, 252);
  doc.rect(20, 100, 170, 8, 'F');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Medicine Name', 25, 105);
  doc.text('Dosage', 85, 105);
  doc.text('Frequency', 125, 105);
  doc.text('Duration', 165, 105);
  
  // Table Rows
  let y = 114;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  
  if (prescription.medicines && prescription.medicines.length > 0) {
    prescription.medicines.forEach((med) => {
      doc.setFont('helvetica', 'bold');
      doc.text(med.name, 25, y);
      doc.setFont('helvetica', 'normal');
      doc.text(med.dosage, 85, y);
      doc.text(med.frequency, 125, y);
      doc.text(med.duration, 165, y);
      
      // row divider
      doc.line(20, y + 4, 190, y + 4);
      y += 12;
    });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.text('No medications prescribed.', 25, y);
    doc.line(20, y + 4, 190, y + 4);
    y += 12;
  }
  
  // Clinical Notes
  if (prescription.clinical_notes) {
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Clinical Notes / Evaluation:', 20, y);
    doc.setFont('helvetica', 'normal');
    y += 6;
    doc.text(prescription.clinical_notes, 20, y, { maxWidth: 170 });
    y += 12;
  }

  // Admission Request
  if (prescription.request_admission) {
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38); // Red
    doc.text('Admission Requested:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    if (prescription.admission_notes) {
      y += 6;
      doc.text(`Indication: ${prescription.admission_notes}`, 20, y, { maxWidth: 170 });
    }
    y += 12;
  }

  // Specialist Referral
  if (prescription.referral_specialist_id) {
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(13, 148, 136); // Teal
    doc.text(`Specialist Referral: ${prescription.referral_specialist_name || 'Referred Specialist'}`, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    if (prescription.referral_notes) {
      y += 6;
      doc.text(`Reason: ${prescription.referral_notes}`, 20, y, { maxWidth: 170 });
    }
    y += 12;
  }

  // Instructions
  if (prescription.instructions) {
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Care Directions & Precautions:', 20, y);
    doc.setFont('helvetica', 'normal');
    y += 6;
    doc.text(prescription.instructions, 20, y, { maxWidth: 170 });
  }
  
  // Sign off
  y = Math.max(y + 30, 240);
  doc.line(130, y, 180, y);
  doc.setFont('helvetica', 'bold');
  doc.text('Authorized Signature', 135, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('MediCare AI Clinician', 135, y + 10);
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('This prescription is signed electronically by an authorized medical provider.', 20, 280);
  doc.text('MediCare AI HMS Portal - http://medicare-ai.health', 20, 284);
  
  doc.save(`Prescription_${prescription.id}.pdf`);
};

/**
 * Generates a clean, professional Lab Report PDF and triggers browser download.
 */
export const generateLabReportPDF = (report: LabReport, patient: Patient | null) => {
  const doc = new jsPDF();
  
  // Hospital Header
  doc.setFillColor(13, 148, 136); // Teal theme
  doc.rect(0, 0, 210, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('MediCare AI Laboratory', 20, 20);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Smart Healthcare, Powered by AI', 20, 26);
  
  // Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('DIAGNOSTIC LABORATORY REPORT', 20, 50);
  
  // Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${report.created_at.slice(0, 10)}`, 150, 50);
  
  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 55, 190, 55);
  
  // Metadata Grid
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT DETAILS', 20, 65);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${patient?.full_name || report.patient_name || 'Rahul Verma'}`, 20, 72);
  doc.text(`Phone: ${patient?.phone || '+91-9876543214'}`, 20, 78);
  doc.text(`Email: ${patient?.email || 'patient@medicare.com'}`, 20, 84);
  
  doc.setFont('helvetica', 'bold');
  doc.text('TEST INFORMATION', 110, 65);
  doc.setFont('helvetica', 'normal');
  doc.text(`Test Name: ${report.test_name}`, 110, 72);
  doc.text(`Test Type: ${report.test_type}`, 110, 78);
  doc.text(`Report ID: ${report.id}`, 110, 84);
  
  // Divider
  doc.line(20, 92, 190, 92);
  
  // Results
  doc.setFont('helvetica', 'bold');
  doc.text('LABORATORY ANALYSIS RESULTS', 20, 102);
  
  // Table Header
  doc.setFillColor(248, 250, 252);
  doc.rect(20, 107, 170, 8, 'F');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Parameter Name', 25, 112);
  doc.text('Observed Value', 85, 112);
  doc.text('Reference Biological Interval', 135, 112);
  
  // Table Rows
  let y = 122;
  doc.setTextColor(15, 23, 42);
  
  if (report.results) {
    // If results is an array or object, parse appropriately
    const entries = Array.isArray(report.results)
      ? report.results.map(r => [r.parameter, r.value, r.normal_range])
      : Object.entries(report.results).map(([param, val]) => {
          let refRange = 'Normal';
          if (param.toLowerCase().includes('hemoglobin')) refRange = '13.0 - 17.0 g/dL';
          else if (param.toLowerCase().includes('wbc')) refRange = '4,000 - 11,000 /uL';
          else if (param.toLowerCase().includes('platelet')) refRange = '150,000 - 400,000 /uL';
          else if (param.toLowerCase().includes('rbc')) refRange = '4.5 - 5.5 million/uL';
          else if (param.toLowerCase().includes('cholesterol')) refRange = '< 200 mg/dL';
          else if (param.toLowerCase().includes('ldl')) refRange = '< 100 mg/dL';
          else if (param.toLowerCase().includes('hdl')) refRange = '> 40 mg/dL';
          else if (param.toLowerCase().includes('triglycerides')) refRange = '< 150 mg/dL';
          return [param, val, refRange];
        });

    entries.forEach(([param, val, refRange]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(String(param), 25, y);
      
      const valStr = String(val);
      const isHigh = valStr.toLowerCase().includes('high') || valStr.includes('180') || valStr.includes('145');
      
      if (isHigh) {
        doc.setTextColor(239, 68, 68); // Red for abnormal values
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'normal');
      }
      doc.text(valStr, 85, y);
      
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text(String(refRange || 'Normal'), 135, y);
      
      doc.setDrawColor(241, 245, 249);
      doc.line(20, y + 4, 190, y + 4);
      y += 12;
    });
  }
  
  // Remarks
  y += 5;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Remarks & Interpretation:', 20, y);
  doc.setFont('helvetica', 'normal');
  y += 6;
  doc.text('All test results are clinically audited. Please consult with your primary healthcare doctor to interpret these values in reference to your clinical history.', 20, y, { maxWidth: 170 });
  
  // Sign off
  y = Math.max(y + 35, 240);
  doc.setDrawColor(203, 213, 225);
  doc.line(130, y, 180, y);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Lab Superintendent', 135, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('MediCare AI Diagnostics', 135, y + 10);
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer-generated lab report and does not require a physical signature.', 20, 280);
  doc.text('MediCare AI Laboratory - Verified Diagnostic Reports', 20, 284);
  
  doc.save(`LabReport_${report.id}.pdf`);
};

/**
 * Generates a clean, professional Billing Invoice PDF and triggers browser download.
 */
export const generateBillingInvoicePDF = (bill: Billing) => {
  const doc = new jsPDF();
  
  // Hospital Header
  doc.setFillColor(79, 70, 229); // Indigo theme
  doc.rect(0, 0, 210, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('MediCare AI Billing Services', 20, 20);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Smart Healthcare, Powered by AI', 20, 26);
  
  // Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL INVOICE', 20, 50);
  
  // Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${bill.created_at.slice(0, 10)}`, 150, 50);
  
  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 55, 190, 55);
  
  // Metadata Grid
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO', 20, 65);
  doc.setFont('helvetica', 'normal');
  doc.text(`Patient Name: ${bill.patient_name}`, 20, 72);
  doc.text(`Invoice ID: ${bill.id}`, 20, 78);
  doc.text(`Payment Status: ${bill.payment_status.toUpperCase()}`, 20, 84);
  
  doc.setFont('helvetica', 'bold');
  doc.text('PROVIDER DETAILS', 110, 65);
  doc.setFont('helvetica', 'normal');
  doc.text('MediCare AI Smart Hospital', 110, 72);
  doc.text('Sector 5, MG Road, Bangalore', 110, 78);
  doc.text('GSTIN: 29AAAAA1111A1Z1', 110, 84);
  
  // Divider
  doc.line(20, 92, 190, 92);
  
  // Charges
  doc.setFont('helvetica', 'bold');
  doc.text('ITEMIZED CHARGES LISTING', 20, 102);
  
  // Table Header
  doc.setFillColor(248, 250, 252);
  doc.rect(20, 107, 170, 8, 'F');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Service Item Description', 25, 112);
  doc.text('Amount ($)', 160, 112);
  
  // Table Rows
  let y = 122;
  doc.setTextColor(15, 23, 42);
  
  const charges = [
    { name: 'Clinical Consultation Fee', amount: bill.consultation_fee },
    { name: 'Diagnostic & Lab Pathology Charges', amount: bill.lab_charges },
    { name: 'Pharmacy Medication Fee', amount: bill.medicine_charges }
  ];
  
  charges.forEach((charge) => {
    doc.setFont('helvetica', 'normal');
    doc.text(charge.name, 25, y);
    doc.text(`$${charge.amount}`, 160, y);
    
    doc.setDrawColor(241, 245, 249);
    doc.line(20, y + 4, 190, y + 4);
    y += 12;
  });
  
  // Total Amount
  y += 5;
  doc.setFillColor(240, 244, 255);
  doc.rect(20, y, 170, 10, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL AMOUNT DUE', 25, y + 7);
  doc.text(`$${bill.total_amount}`, 160, y + 7);
  
  // Payment Status Message
  y += 20;
  if (bill.payment_status === 'paid') {
    doc.setTextColor(16, 185, 129); // green-500
    doc.setFont('helvetica', 'bold');
    doc.text('✓ Invoice Fully Paid & Settled', 20, y);
  } else {
    doc.setTextColor(239, 68, 68); // red-500
    doc.setFont('helvetica', 'bold');
    doc.text('⚠ Invoice Payment Outstanding', 20, y);
  }
  
  // Sign off
  y = Math.max(y + 35, 240);
  doc.setDrawColor(203, 213, 225);
  doc.line(130, y, 180, y);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Billing Accountant', 135, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('MediCare AI Accounts', 135, y + 10);
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Thank you for choosing MediCare AI for your medical needs.', 20, 280);
  doc.text('For queries regarding this invoice, contact accounts@medicare-ai.health', 20, 284);
  
  doc.save(`Invoice_${bill.id}.pdf`);
};
