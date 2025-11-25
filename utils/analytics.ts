/**
 * Analytics & AI Insights Utility
 * Provides intelligent analysis of student data, attendance, and payments
 */

import { Student, Attendance } from '../types';

export interface RiskStudent {
    id: string;
    name: string;
    enrollmentNo: string;
    riskType: 'dropout' | 'payment' | 'attendance';
    riskLevel: 'high' | 'medium' | 'low';
    reason: string;
    absentDays?: number;
    pendingAmount?: number;
}

export interface RevenueProjection {
    currentMonth: number;
    nextMonth: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    confidence: number;
}

export interface AIInsight {
    id: string;
    type: 'risk' | 'opportunity' | 'alert' | 'success';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actionable: boolean;
    count?: number;
    amount?: number;
}

/**
 * Identify students at risk of dropping out based on attendance
 */
export const identifyDropoutRisks = (
    students: Student[],
    attendanceRecords: Attendance[],
    thresholdDays: number = 5
): RiskStudent[] => {
    const risks: RiskStudent[] = [];

    students.forEach(student => {
        // Count absences in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentAbsences = attendanceRecords.filter(record =>
            record.studentId === student.id &&
            record.status === 'Absent' &&
            new Date(record.date) >= thirtyDaysAgo
        ).length;

        if (recentAbsences >= thresholdDays) {
            risks.push({
                id: student.id,
                name: student.name,
                enrollmentNo: student.enrollmentNo,
                riskType: 'dropout',
                riskLevel: recentAbsences >= 10 ? 'high' : recentAbsences >= 7 ? 'medium' : 'low',
                reason: `Absent for ${recentAbsences} days in last 30 days`,
                absentDays: recentAbsences
            });
        }
    });

    return risks.sort((a, b) => (b.absentDays || 0) - (a.absentDays || 0));
};

/**
 * Identify students with overdue payments
 */
export const identifyPaymentRisks = (students: Student[]): RiskStudent[] => {
    const risks: RiskStudent[] = [];

    students.forEach(student => {
        if (student.feeStatus === 'Pending' || student.feeStatus === 'Partial') {
            const pendingAmount = student.balance || 0;

            if (pendingAmount > 0) {
                risks.push({
                    id: student.id,
                    name: student.name,
                    enrollmentNo: student.enrollmentNo,
                    riskType: 'payment',
                    riskLevel: pendingAmount > 10000 ? 'high' : pendingAmount > 5000 ? 'medium' : 'low',
                    reason: `Pending payment of ₹${pendingAmount}`,
                    pendingAmount
                });
            }
        }
    });

    return risks.sort((a, b) => (b.pendingAmount || 0) - (a.pendingAmount || 0));
};

/**
 * Project revenue for next month based on payment history
 */
export const projectRevenue = (students: Student[]): RevenueProjection => {
    // Calculate current month revenue (paid fees)
    const currentMonthRevenue = students.reduce((sum, student) => {
        return sum + (student.paidFee || 0);
    }, 0);

    // Calculate expected revenue (total fees - concessions)
    const expectedRevenue = students.reduce((sum, student) => {
        const netFee = (student.totalFee || 0) - (student.concession || 0);
        return sum + netFee;
    }, 0);

    // Calculate pending revenue
    const pendingRevenue = students.reduce((sum, student) => {
        return sum + (student.balance || 0);
    }, 0);

    // Simple projection: assume 60% of pending will be collected next month
    const projectedNextMonth = pendingRevenue * 0.6;

    // Determine trend
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    const collectionRate = currentMonthRevenue / expectedRevenue;

    if (collectionRate > 0.8) trend = 'increasing';
    else if (collectionRate < 0.5) trend = 'decreasing';

    return {
        currentMonth: currentMonthRevenue,
        nextMonth: projectedNextMonth,
        trend,
        confidence: collectionRate * 100
    };
};

/**
 * Generate AI insights based on all data
 */
export const generateAIInsights = (
    students: Student[],
    attendanceRecords: Attendance[]
): AIInsight[] => {
    const insights: AIInsight[] = [];

    // 1. Dropout Risk Insight
    const dropoutRisks = identifyDropoutRisks(students, attendanceRecords);
    if (dropoutRisks.length > 0) {
        insights.push({
            id: 'dropout-risk',
            type: 'risk',
            priority: dropoutRisks.filter(r => r.riskLevel === 'high').length > 0 ? 'high' : 'medium',
            title: 'Students at Risk of Dropping Out',
            description: `${dropoutRisks.length} student${dropoutRisks.length > 1 ? 's are' : ' is'} showing poor attendance patterns`,
            actionable: true,
            count: dropoutRisks.length
        });
    }

    // 2. Payment Risk Insight
    const paymentRisks = identifyPaymentRisks(students);
    const totalPending = paymentRisks.reduce((sum, r) => sum + (r.pendingAmount || 0), 0);

    if (paymentRisks.length > 0) {
        insights.push({
            id: 'payment-overdue',
            type: 'alert',
            priority: 'high',
            title: 'Overdue Fee Payments',
            description: `${paymentRisks.length} student${paymentRisks.length > 1 ? 's have' : ' has'} pending payments`,
            actionable: true,
            count: paymentRisks.length,
            amount: totalPending
        });
    }

    // 3. Revenue Projection
    const revenueProjection = projectRevenue(students);
    insights.push({
        id: 'revenue-projection',
        type: revenueProjection.trend === 'increasing' ? 'success' : revenueProjection.trend === 'decreasing' ? 'risk' : 'opportunity',
        priority: 'medium',
        title: 'Revenue Projection',
        description: `Expected revenue for next month: ₹${Math.round(revenueProjection.nextMonth).toLocaleString('en-IN')}`,
        actionable: false,
        amount: revenueProjection.nextMonth
    });

    // 4. High Performers (Good Attendance + Paid Fees)
    const highPerformers = students.filter(s =>
        s.feeStatus === 'Paid' &&
        attendanceRecords.filter(a =>
            a.studentId === s.id &&
            a.status === 'Present'
        ).length > 20
    );

    if (highPerformers.length > 0) {
        insights.push({
            id: 'high-performers',
            type: 'success',
            priority: 'low',
            title: 'Excellent Students',
            description: `${highPerformers.length} student${highPerformers.length > 1 ? 's have' : ' has'} excellent attendance and payment records`,
            actionable: false,
            count: highPerformers.length
        });
    }

    // 5. New Admissions Opportunity
    const recentStudents = students.filter(s => {
        const admissionDate = new Date(s.admissionDate);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return admissionDate >= thirtyDaysAgo;
    });

    if (recentStudents.length > 5) {
        insights.push({
            id: 'admission-trend',
            type: 'success',
            priority: 'low',
            title: 'Strong Admission Trend',
            description: `${recentStudents.length} new admissions in the last 30 days`,
            actionable: false,
            count: recentStudents.length
        });
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};

/**
 * Calculate attendance percentage for a student
 */
export const calculateAttendancePercentage = (
    studentId: string,
    attendanceRecords: Attendance[]
): number => {
    const studentRecords = attendanceRecords.filter(r => r.studentId === studentId);
    if (studentRecords.length === 0) return 0;

    const presentCount = studentRecords.filter(r => r.status === 'Present').length;
    return Math.round((presentCount / studentRecords.length) * 100);
};
