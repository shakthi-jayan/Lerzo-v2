import jsPDF from 'jspdf';
import { QRCodeCanvas } from 'qrcode.react';

export interface ReceiptData {
    receiptNumber: string;
    studentName: string;
    enrollmentNo: string;
    course: string;
    amount: number;
    paymentDate: string;
    paymentMode: string;
    instituteName: string;
    instituteAddress: string;
    institutePhone: string;
    logoUrl?: string;
}

/**
 * Generate a unique receipt number
 * Format: RCP-YYYYMMDD-XXXX
 */
export const generateReceiptNumber = (): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');

    return `RCP-${year}${month}${day}-${random}`;
};

/**
 * Generate QR code as data URL
 */
const generateQRCodeDataURL = async (text: string): Promise<string> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const qr = document.createElement('div');
        qr.style.position = 'absolute';
        qr.style.left = '-9999px';
        document.body.appendChild(qr);

        // Create QR code
        const qrCanvas = document.createElement('canvas');
        const ctx = qrCanvas.getContext('2d');
        if (!ctx) {
            resolve('');
            return;
        }

        // Simple QR code generation (you can use qrcode.react here)
        qrCanvas.width = 200;
        qrCanvas.height = 200;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.fillText(text, 10, 100);

        const dataURL = qrCanvas.toDataURL();
        document.body.removeChild(qr);
        resolve(dataURL);
    });
};

/**
 * Generate PDF receipt
 */
export const generateReceipt = async (data: ReceiptData): Promise<jsPDF> => {
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Colors
    const primaryColor = '#1e293b';
    const accentColor = '#3b82f6';
    const lightGray = '#f1f5f9';

    // Header Background
    pdf.setFillColor(30, 41, 59); // primaryColor
    pdf.rect(0, 0, pageWidth, 40, 'F');

    // Institute Name
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.instituteName, pageWidth / 2, 15, { align: 'center' });

    // Institute Details
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.instituteAddress, pageWidth / 2, 22, { align: 'center' });
    pdf.text(`Phone: ${data.institutePhone}`, pageWidth / 2, 28, { align: 'center' });

    // Receipt Title
    pdf.setFillColor(59, 130, 246); // accentColor
    pdf.rect(0, 45, pageWidth, 15, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PAYMENT RECEIPT', pageWidth / 2, 55, { align: 'center' });

    // Receipt Number & Date
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Receipt No: ${data.receiptNumber}`, 20, 70);
    pdf.text(`Date: ${data.paymentDate}`, pageWidth - 20, 70, { align: 'right' });

    // Divider Line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, 75, pageWidth - 20, 75);

    // Student Details Section
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Student Details', 20, 85);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    let yPos = 95;

    const details = [
        { label: 'Name:', value: data.studentName },
        { label: 'Enrollment No:', value: data.enrollmentNo },
        { label: 'Course:', value: data.course }
    ];

    details.forEach(detail => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(detail.label, 25, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(detail.value, 65, yPos);
        yPos += 8;
    });

    // Payment Details Section
    yPos += 10;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Payment Details', 20, yPos);

    yPos += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const paymentDetails = [
        { label: 'Payment Mode:', value: data.paymentMode },
        { label: 'Payment Date:', value: data.paymentDate }
    ];

    paymentDetails.forEach(detail => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(detail.label, 25, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(detail.value, 65, yPos);
        yPos += 8;
    });

    // Amount Box
    yPos += 10;
    pdf.setFillColor(241, 245, 249); // lightGray
    pdf.rect(20, yPos, pageWidth - 40, 25, 'F');
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(0.5);
    pdf.rect(20, yPos, pageWidth - 40, 25);

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Amount Paid:', 25, yPos + 10);

    pdf.setFontSize(20);
    pdf.setTextColor(59, 130, 246);
    pdf.text(`₹${data.amount.toLocaleString('en-IN')}`, pageWidth - 25, yPos + 12, { align: 'right' });
    pdf.setTextColor(0, 0, 0);

    // Amount in Words
    yPos += 30;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.text(`(Rupees ${numberToWords(data.amount)} Only)`, 25, yPos);

    // QR Code (placeholder - you can add actual QR code generation)
    yPos += 15;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Scan to Verify:', pageWidth - 60, yPos);

    // Add a simple box for QR code placeholder
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(pageWidth - 60, yPos + 5, 40, 40);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('QR Code', pageWidth - 40, yPos + 27, { align: 'center' });

    // Footer
    yPos = pageHeight - 40;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, yPos, pageWidth - 20, yPos);

    yPos += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Authorized Signature', 25, yPos);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('This is a computer-generated receipt and does not require a physical signature.', pageWidth / 2, pageHeight - 15, { align: 'center' });

    pdf.setFontSize(7);
    pdf.text('Thank you for your payment!', pageWidth / 2, pageHeight - 10, { align: 'center' });

    return pdf;
};

/**
 * Convert number to words (Indian system)
 */
const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return 'Zero';

    let words = '';

    // Lakhs
    if (num >= 100000) {
        words += numberToWords(Math.floor(num / 100000)) + ' Lakh ';
        num %= 100000;
    }

    // Thousands
    if (num >= 1000) {
        words += numberToWords(Math.floor(num / 1000)) + ' Thousand ';
        num %= 1000;
    }

    // Hundreds
    if (num >= 100) {
        words += ones[Math.floor(num / 100)] + ' Hundred ';
        num %= 100;
    }

    // Tens and Ones
    if (num >= 20) {
        words += tens[Math.floor(num / 10)] + ' ';
        num %= 10;
    } else if (num >= 10) {
        words += teens[num - 10] + ' ';
        return words.trim();
    }

    if (num > 0) {
        words += ones[num] + ' ';
    }

    return words.trim();
};

/**
 * Download receipt as PDF
 */
export const downloadReceipt = async (data: ReceiptData): Promise<void> => {
    const pdf = await generateReceipt(data);
    pdf.save(`Receipt_${data.receiptNumber}.pdf`);
};

/**
 * Get receipt as blob for sharing
 */
export const getReceiptBlob = async (data: ReceiptData): Promise<Blob> => {
    const pdf = await generateReceipt(data);
    return pdf.output('blob');
};

/**
 * Share receipt via WhatsApp
 */
export const shareReceiptViaWhatsApp = async (data: ReceiptData, phone: string): Promise<void> => {
    // Note: WhatsApp Web API doesn't support file sharing directly
    // This will open WhatsApp with a message, user needs to manually attach the PDF
    const message = `Dear ${data.studentName},\n\nYour payment receipt (${data.receiptNumber}) for ₹${data.amount} has been generated.\n\nPlease download the PDF from our system.\n\nThank you!`;
    const url = `https://wa.me/91${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');

    // Also download the PDF for manual sharing
    await downloadReceipt(data);
};
