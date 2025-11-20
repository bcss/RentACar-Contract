/**
 * Report Routes
 * 
 * Handles all reporting endpoints including:
 * - Financial reports (revenue, collections, outstanding)
 * - Operational reports (utilization, status, charges)
 * - Customer reports (demographics, loyalty, rentals)
 * - Audit reports (modifications, timeline, user activity)
 * - Insurance reports (claims tracking and analysis)
 * - Driver reports (utilization, revenue-cost)
 * - Predictive reports (6 forecasting models)
 * - Export functionality (PDF/Excel with charts)
 */

import { Router } from "express";
import { format } from "date-fns";
import { storage } from "../storage";
import { isAuthenticated, requireReportsAccess } from "../auth/localAuth";

const router = Router();

/**
 * GET /api/reports/financial
 * Financial report with revenue, collections, and outstanding balances
 */
router.get("/financial", isAuthenticated, requireReportsAccess, async (req: any, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const report = await storage.getFinancialReport(startDate, endDate);
    res.json(report);
  } catch (error) {
    console.error("Error fetching financial report:", error);
    res.status(500).json({ message: "Failed to fetch financial report" });
  }
});

/**
 * GET /api/reports/operational
 * Operational report with vehicle utilization, contract status, and extra charges
 */
router.get("/operational", isAuthenticated, requireReportsAccess, async (req: any, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const report = await storage.getOperationalReport(startDate, endDate);
    res.json(report);
  } catch (error) {
    console.error("Error fetching operational report:", error);
    res.status(500).json({ message: "Failed to fetch operational report" });
  }
});

/**
 * GET /api/reports/customers
 * Customer report with demographics, loyalty metrics, and rental patterns
 */
router.get("/customers", isAuthenticated, requireReportsAccess, async (req: any, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const report = await storage.getCustomerReport(startDate, endDate);
    res.json(report);
  } catch (error) {
    console.error("Error fetching customer report:", error);
    res.status(500).json({ message: "Failed to fetch customer report" });
  }
});

/**
 * GET /api/reports/audit
 * Audit report with contract modifications and user activity
 */
router.get("/audit", isAuthenticated, requireReportsAccess, async (req: any, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const report = await storage.getAuditReport(startDate, endDate);
    res.json(report);
  } catch (error) {
    console.error("Error fetching audit report:", error);
    res.status(500).json({ message: "Failed to fetch audit report" });
  }
});

/**
 * GET /api/reports/insurance
 * Insurance claims report with status breakdown and financial summaries
 */
router.get("/insurance", isAuthenticated, requireReportsAccess, async (req: any, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const report = await storage.getInsuranceReport(startDate, endDate);
    res.json(report);
  } catch (error) {
    console.error("Error fetching insurance report:", error);
    res.status(500).json({ message: "Failed to fetch insurance report" });
  }
});

/**
 * GET /api/reports/driver-utilization
 * Driver utilization report with assignments and performance metrics
 */
router.get("/driver-utilization", isAuthenticated, requireReportsAccess, async (req: any, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const report = await storage.getDriverUtilizationReport(startDate, endDate);
    res.json(report);
  } catch (error) {
    console.error("Error fetching driver utilization report:", error);
    res.status(500).json({ message: "Failed to fetch driver utilization report" });
  }
});

/**
 * GET /api/reports/driver-revenue-cost
 * Driver revenue and cost analysis report
 */
router.get("/driver-revenue-cost", isAuthenticated, requireReportsAccess, async (req: any, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const report = await storage.getDriverRevenueCostReport(startDate, endDate);
    res.json(report);
  } catch (error) {
    console.error("Error fetching driver revenue-cost report:", error);
    res.status(500).json({ message: "Failed to fetch driver revenue-cost report" });
  }
});

/**
 * GET /api/reports/revenue-forecast
 * Predictive revenue forecasting using historical trends
 */
router.get("/revenue-forecast", isAuthenticated, requireReportsAccess, async (req: any, res) => {
  try {
    const months = req.query.months ? parseInt(req.query.months as string) : 12;
    const forecastMonths = req.query.forecastMonths ? parseInt(req.query.forecastMonths as string) : 3;
    const report = await storage.getRevenueForecastReport(months, forecastMonths);
    res.json(report);
  } catch (error) {
    console.error("Error fetching revenue forecast report:", error);
    res.status(500).json({ message: "Failed to fetch revenue forecast report" });
  }
});

/**
 * GET /api/reports/fleet-utilization-forecast
 * Predictive fleet utilization forecasting by category
 */
router.get("/fleet-utilization-forecast", isAuthenticated, requireReportsAccess, async (req: any, res) => {
  try {
    const months = req.query.months ? parseInt(req.query.months as string) : 6;
    const category = req.query.category as string || undefined;
    const report = await storage.getFleetUtilizationForecastReport(months, category);
    res.json(report);
  } catch (error) {
    console.error("Error fetching fleet utilization forecast report:", error);
    res.status(500).json({ message: "Failed to fetch fleet utilization forecast report" });
  }
});

/**
 * GET /api/reports/customer-churn-risk
 * Customer churn risk prediction based on inactivity
 */
router.get("/customer-churn-risk", isAuthenticated, requireReportsAccess, async (req: any, res) => {
  try {
    const inactiveDays = req.query.inactiveDays ? parseInt(req.query.inactiveDays as string) : 90;
    const minRentals = req.query.minRentals ? parseInt(req.query.minRentals as string) : 3;
    const report = await storage.getCustomerChurnRiskReport(inactiveDays, minRentals);
    res.json(report);
  } catch (error) {
    console.error("Error fetching customer churn risk report:", error);
    res.status(500).json({ message: "Failed to fetch customer churn risk report" });
  }
});

/**
 * GET /api/reports/maintenance-cost-forecast
 * Maintenance cost forecasting by vehicle
 */
router.get("/maintenance-cost-forecast", isAuthenticated, requireReportsAccess, async (req: any, res) => {
  try {
    const months = req.query.months ? parseInt(req.query.months as string) : 12;
    const forecastMonths = req.query.forecastMonths ? parseInt(req.query.forecastMonths as string) : 3;
    const vehicleId = req.query.vehicleId as string || undefined;
    const report = await storage.getMaintenanceCostForecastReport(months, forecastMonths, vehicleId);
    res.json(report);
  } catch (error) {
    console.error("Error fetching maintenance cost forecast report:", error);
    res.status(500).json({ message: "Failed to fetch maintenance cost forecast report" });
  }
});

/**
 * GET /api/reports/payment-default-prediction
 * Payment default risk prediction
 */
router.get("/payment-default-prediction", isAuthenticated, requireReportsAccess, async (req: any, res) => {
  try {
    const riskThreshold = req.query.riskThreshold ? parseInt(req.query.riskThreshold as string) : 50;
    const report = await storage.getPaymentDefaultPredictionReport(riskThreshold);
    res.json(report);
  } catch (error) {
    console.error("Error fetching payment default prediction report:", error);
    res.status(500).json({ message: "Failed to fetch payment default prediction report" });
  }
});

/**
 * GET /api/reports/demand-forecast
 * Location-based demand forecasting by emirate
 */
router.get("/demand-forecast", isAuthenticated, requireReportsAccess, async (req: any, res) => {
  try {
    const months = req.query.months ? parseInt(req.query.months as string) : 6;
    const emirate = req.query.emirate as string || undefined;
    const report = await storage.getDemandForecastReport(months, emirate);
    res.json(report);
  } catch (error) {
    console.error("Error fetching demand forecast report:", error);
    res.status(500).json({ message: "Failed to fetch demand forecast report" });
  }
});

/**
 * POST /api/reports/financial/export
 * Export financial report to PDF or Excel with embedded charts
 */
router.post("/financial/export", isAuthenticated, requireReportsAccess, async (req: any, res) => {
  try {
    const { format: exportFormat, startDate: startDateParam, endDate: endDateParam, lang } = req.query;
    const { charts = [] } = req.body;
    const startDate = startDateParam ? new Date(startDateParam as string) : undefined;
    const endDate = endDateParam ? new Date(endDateParam as string) : undefined;
    const isRTL = lang === 'ar';
    
    const report = await storage.getFinancialReport(startDate, endDate);
    const settings = await storage.getCompanySettings();
    const currency = isRTL ? settings.currencyAr : settings.currencyEn;
    
    const { 
      createPDF, 
      addPDFSummarySection, 
      addPDFTable, 
      addPDFChartImages,
      createExcelWorkbook, 
      addExcelSheet,
      addExcelChartSheet,
      exportExcelToBuffer,
      formatCurrency,
      formatDate 
    } = await import('../utils/exportHelpers');

    if (exportFormat === 'pdf') {
      const doc = createPDF(
        'Financial Report',
        {
          nameEn: settings.companyNameEn,
          nameAr: settings.companyNameAr,
          phone: settings.phone || undefined,
          email: settings.email || undefined,
        },
        isRTL
      );

      let currentY = addPDFSummarySection(doc, 'Summary', [
        { label: 'Total Revenue', value: formatCurrency(report.summary.totalRevenue, currency) },
        { label: 'All-Time Revenue', value: formatCurrency(report.summary.allTimeRevenue, currency) },
        { label: 'Collection Rate', value: `${report.summary.collectionRate.toFixed(1)}%` },
        { label: 'Total Collected', value: formatCurrency(report.summary.totalCollected, currency) },
        { label: 'Outstanding', value: formatCurrency(report.summary.totalOutstanding, currency) },
      ], 55);

      if (report.monthlyBreakdown.length > 0) {
        currentY += 5;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Monthly Breakdown', 14, currentY);
        
        const monthlyData = report.monthlyBreakdown.map(item => [
          item.month,
          formatCurrency(item.revenue, currency),
          item.contractCount.toString()
        ]);
        
        addPDFTable(doc, ['Month', 'Revenue', 'Contracts'], monthlyData, currentY + 5);
      }
      
      if (charts && charts.length > 0) {
        const docWithTable = doc as any;
        addPDFChartImages(doc, charts, docWithTable.lastAutoTable ? docWithTable.lastAutoTable.finalY + 10 : currentY + 10);
      }

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="financial-report-${format(new Date(), 'yyyy-MM-dd')}.pdf"`);
      res.send(pdfBuffer);
    } else if (exportFormat === 'excel') {
      const wb = createExcelWorkbook();
      
      const summaryData = [
        { Metric: 'Total Revenue', Value: report.summary.totalRevenue },
        { Metric: 'All-Time Revenue', Value: report.summary.allTimeRevenue },
        { Metric: 'Collection Rate (%)', Value: report.summary.collectionRate },
        { Metric: 'Total Collected', Value: report.summary.totalCollected },
        { Metric: 'Total Outstanding', Value: report.summary.totalOutstanding },
      ];
      addExcelSheet(wb, 'Summary', summaryData);
      
      const monthlyData = report.monthlyBreakdown.map(item => ({
        Month: item.month,
        Revenue: item.revenue,
        'Contract Count': item.contractCount
      }));
      addExcelSheet(wb, 'Monthly Breakdown', monthlyData);
      
      const paymentsData = report.recentPayments.map(p => ({
        'Contract Number': p.contractNumber,
        Amount: p.amount,
        Method: p.method,
        Date: formatDate(p.date)
      }));
      addExcelSheet(wb, 'Recent Payments', paymentsData);
      
      const outstandingData = report.outstandingPayments.map(p => ({
        'Contract Number': p.contractNumber,
        Customer: p.customerName,
        'Total Amount': p.totalAmount,
        Collected: p.collected,
        Outstanding: p.outstanding,
        Status: p.status,
        'Due Date': formatDate(p.dueDate)
      }));
      addExcelSheet(wb, 'Outstanding Payments', outstandingData);
      
      if (charts && charts.length > 0) {
        addExcelChartSheet(wb, charts);
      }
      
      const buffer = exportExcelToBuffer(wb);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="financial-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx"`);
      res.send(buffer);
    } else {
      res.status(400).json({ message: 'Invalid export format. Use "pdf" or "excel".' });
    }
  } catch (error) {
    console.error("Error exporting financial report:", error);
    res.status(500).json({ message: "Failed to export financial report" });
  }
});

/**
 * POST /api/reports/operational/export
 * Export operational report to PDF or Excel with tab-specific content
 */
router.post("/operational/export", isAuthenticated, requireReportsAccess, async (req: any, res) => {
  try {
    const { format: exportFormat, startDate: startDateParam, endDate: endDateParam, lang, activeTab } = req.query;
    const { charts = [] } = req.body;
    const startDate = startDateParam ? new Date(startDateParam as string) : undefined;
    const endDate = endDateParam ? new Date(endDateParam as string) : undefined;
    const isRTL = lang === 'ar';
    
    const report = await storage.getOperationalReport(startDate, endDate);
    const settings = await storage.getCompanySettings();
    
    const { 
      createPDF, 
      addPDFSummarySection, 
      addPDFTable,
      addPDFChartImages,
      createExcelWorkbook, 
      addExcelSheet,
      addExcelChartSheet,
      exportExcelToBuffer,
      formatPercentage
    } = await import('../utils/exportHelpers');

    if (exportFormat === 'pdf') {
      const reportTitles = {
        utilization: 'Vehicle Utilization Report',
        status: 'Contract Status Report',
        charges: 'Extra Charges Report'
      };
      const reportTitle = reportTitles[activeTab as keyof typeof reportTitles] || 'Operational Report';
      
      const doc = createPDF(
        reportTitle,
        {
          nameEn: settings.companyNameEn,
          nameAr: settings.companyNameAr,
          phone: settings.phone || undefined,
          email: settings.email || undefined,
        },
        isRTL
      );

      let currentY = 55;

      if (activeTab === 'utilization' || !activeTab) {
        currentY = addPDFSummarySection(doc, 'Utilization Summary', [
          { label: 'Total Vehicles', value: report.summary.totalVehicles.toString() },
          { label: 'Rented', value: report.summary.rentedVehicles.toString() },
          { label: 'Available', value: report.summary.availableVehicles.toString() },
          { label: 'Under Maintenance', value: report.summary.maintenanceVehicles.toString() },
          { label: 'Utilization Rate', value: formatPercentage(report.summary.utilizationRate) },
        ], 55);

        if (report.utilizationByCategory.length > 0) {
          currentY += 5;
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('Utilization by Category', 14, currentY);
          
          const utilizationData = report.utilizationByCategory.map(item => [
            item.category,
            item.total.toString(),
            item.rented.toString(),
            formatPercentage(item.utilizationRate)
          ]);
          
          addPDFTable(doc, ['Category', 'Total', 'Rented', 'Utilization'], utilizationData, currentY + 5);
        }
      }

      if (activeTab === 'status' || !activeTab) {
        if (report.contractsByStatus.length > 0) {
          currentY = (doc as any).lastAutoTable?.finalY || currentY;
          currentY += 10;
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('Contracts by Status', 14, currentY);
          
          const statusData = report.contractsByStatus.map(item => [
            item.status.charAt(0).toUpperCase() + item.status.slice(1),
            item.count.toString()
          ]);
          
          addPDFTable(doc, ['Status', 'Count'], statusData, currentY + 5);
        }
      }

      if (activeTab === 'charges' || !activeTab) {
        if (report.extraCharges.length > 0) {
          currentY = (doc as any).lastAutoTable?.finalY || currentY;
          currentY += 10;
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('Top Extra Charges', 14, currentY);
          
          const chargesData = report.extraCharges.map(item => [
            item.contractNumber,
            item.type,
            item.amount.toString()
          ]);
          
          addPDFTable(doc, ['Contract', 'Type', 'Amount'], chargesData, currentY + 5);
        }
      }
      
      if (charts && charts.length > 0) {
        const docWithTable = doc as any;
        addPDFChartImages(doc, charts, docWithTable.lastAutoTable ? docWithTable.lastAutoTable.finalY + 10 : currentY + 10);
      }

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="operational-report-${format(new Date(), 'yyyy-MM-dd')}.pdf"`);
      res.send(pdfBuffer);
    } else if (exportFormat === 'excel') {
      const wb = createExcelWorkbook();
      
      const summaryData = [
        { Metric: 'Total Vehicles', Value: report.summary.totalVehicles },
        { Metric: 'Rented Vehicles', Value: report.summary.rentedVehicles },
        { Metric: 'Available Vehicles', Value: report.summary.availableVehicles },
        { Metric: 'Under Maintenance', Value: report.summary.maintenanceVehicles },
        { Metric: 'Utilization Rate (%)', Value: report.summary.utilizationRate },
      ];
      addExcelSheet(wb, 'Summary', summaryData);
      
      const utilizationData = report.utilizationByCategory.map(item => ({
        Category: item.category,
        Total: item.total,
        Rented: item.rented,
        Available: item.available,
        'Utilization Rate (%)': item.utilizationRate
      }));
      addExcelSheet(wb, 'Utilization by Category', utilizationData);
      
      const statusData = report.contractsByStatus.map(item => ({
        Status: item.status,
        Count: item.count
      }));
      addExcelSheet(wb, 'Contracts by Status', statusData);
      
      const chargesData = report.extraCharges.map(item => ({
        'Contract Number': item.contractNumber,
        Type: item.type,
        Amount: item.amount,
        Date: item.date
      }));
      addExcelSheet(wb, 'Extra Charges', chargesData);
      
      if (charts && charts.length > 0) {
        addExcelChartSheet(wb, charts);
      }
      
      const buffer = exportExcelToBuffer(wb);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="operational-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx"`);
      res.send(buffer);
    } else {
      res.status(400).json({ message: 'Invalid export format. Use "pdf" or "excel".' });
    }
  } catch (error) {
    console.error("Error exporting operational report:", error);
    res.status(500).json({ message: "Failed to export operational report" });
  }
});

/**
 * POST /api/reports/customers/export
 * Export customer report to PDF or Excel
 */
router.post("/customers/export", isAuthenticated, requireReportsAccess, async (req: any, res) => {
  try {
    const { format: exportFormat, startDate: startDateParam, endDate: endDateParam, lang } = req.query;
    const { charts = [] } = req.body;
    const startDate = startDateParam ? new Date(startDateParam as string) : undefined;
    const endDate = endDateParam ? new Date(endDateParam as string) : undefined;
    const isRTL = lang === 'ar';
    
    const report = await storage.getCustomerReport(startDate, endDate);
    const settings = await storage.getCompanySettings();
    
    const { 
      createPDF, 
      addPDFSummarySection, 
      addPDFTable, 
      addPDFChartImages,
      createExcelWorkbook, 
      addExcelSheet,
      addExcelChartSheet,
      exportExcelToBuffer,
      formatDate 
    } = await import('../utils/exportHelpers');

    if (exportFormat === 'pdf') {
      const doc = createPDF(
        'Customer Report',
        {
          nameEn: settings.companyNameEn,
          nameAr: settings.companyNameAr,
          phone: settings.phone || undefined,
          email: settings.email || undefined,
        },
        isRTL
      );

      let currentY = addPDFSummarySection(doc, 'Summary', [
        { label: 'Total Customers', value: report.summary.totalCustomers.toString() },
        { label: 'New Customers', value: report.summary.newCustomers.toString() },
        { label: 'Repeat Customers', value: report.summary.repeatCustomers.toString() },
        { label: 'Active Customers', value: report.summary.activeCustomers.toString() },
      ], 55);

      if (report.topCustomers.length > 0) {
        currentY += 5;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Top Customers', 14, currentY);
        
        const topCustomersData = report.topCustomers.map(item => [
          item.customerName,
          item.totalRentals.toString(),
          item.totalSpent.toString()
        ]);
        
        addPDFTable(doc, ['Customer', 'Rentals', 'Total Spent'], topCustomersData, currentY + 5);
      }
      
      if (charts && charts.length > 0) {
        const docWithTable = doc as any;
        addPDFChartImages(doc, charts, docWithTable.lastAutoTable ? docWithTable.lastAutoTable.finalY + 10 : currentY + 10);
      }

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="customer-report-${format(new Date(), 'yyyy-MM-dd')}.pdf"`);
      res.send(pdfBuffer);
    } else if (exportFormat === 'excel') {
      const wb = createExcelWorkbook();
      
      const summaryData = [
        { Metric: 'Total Customers', Value: report.summary.totalCustomers },
        { Metric: 'New Customers', Value: report.summary.newCustomers },
        { Metric: 'Repeat Customers', Value: report.summary.repeatCustomers },
        { Metric: 'Active Customers', Value: report.summary.activeCustomers },
      ];
      addExcelSheet(wb, 'Summary', summaryData);
      
      const topCustomersData = report.topCustomers.map(item => ({
        Customer: item.customerName,
        'Total Rentals': item.totalRentals,
        'Total Spent': item.totalSpent,
        'Last Rental': formatDate(item.lastRentalDate)
      }));
      addExcelSheet(wb, 'Top Customers', topCustomersData);
      
      const demographicsData = report.customersByDemographic.map(item => ({
        Type: item.type,
        Count: item.count,
        Percentage: item.percentage
      }));
      addExcelSheet(wb, 'Demographics', demographicsData);
      
      if (charts && charts.length > 0) {
        addExcelChartSheet(wb, charts);
      }
      
      const buffer = exportExcelToBuffer(wb);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="customer-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx"`);
      res.send(buffer);
    } else {
      res.status(400).json({ message: 'Invalid export format. Use "pdf" or "excel".' });
    }
  } catch (error) {
    console.error("Error exporting customer report:", error);
    res.status(500).json({ message: "Failed to export customer report" });
  }
});

/**
 * GET /api/reports/audit/export
 * Export audit report to PDF or Excel
 * Note: Uses GET for backward compatibility
 */
router.get("/audit/export", isAuthenticated, requireReportsAccess, async (req: any, res) => {
  try {
    const { format: exportFormat, startDate: startDateParam, endDate: endDateParam, lang } = req.query;
    const startDate = startDateParam ? new Date(startDateParam as string) : undefined;
    const endDate = endDateParam ? new Date(endDateParam as string) : undefined;
    const isRTL = lang === 'ar';
    
    const report = await storage.getAuditReport(startDate, endDate);
    const settings = await storage.getCompanySettings();
    
    const { 
      createPDF, 
      addPDFSummarySection, 
      addPDFTable,
      createExcelWorkbook, 
      addExcelSheet,
      exportExcelToBuffer,
      formatDate 
    } = await import('../utils/exportHelpers');

    if (exportFormat === 'pdf') {
      const doc = createPDF(
        'Audit Report',
        {
          nameEn: settings.companyNameEn,
          nameAr: settings.companyNameAr,
          phone: settings.phone || undefined,
          email: settings.email || undefined,
        },
        isRTL
      );

      let currentY = addPDFSummarySection(doc, 'Summary', [
        { label: 'Total Modifications', value: report.summary.totalModifications.toString() },
        { label: 'Contracts Modified', value: report.summary.contractsModified.toString() },
        { label: 'Active Users', value: report.summary.activeUsers.toString() },
      ], 55);

      if (report.recentModifications.length > 0) {
        currentY += 5;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Recent Modifications', 14, currentY);
        
        const modificationsData = report.recentModifications.map(item => [
          item.contractNumber,
          item.editedBy,
          formatDate(item.editedAt),
          item.changesSummary.substring(0, 50)
        ]);
        
        addPDFTable(doc, ['Contract', 'User', 'Date', 'Changes'], modificationsData, currentY + 5);
      }

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="audit-report-${format(new Date(), 'yyyy-MM-dd')}.pdf"`);
      res.send(pdfBuffer);
    } else if (exportFormat === 'excel') {
      const wb = createExcelWorkbook();
      
      const summaryData = [
        { Metric: 'Total Modifications', Value: report.summary.totalModifications },
        { Metric: 'Contracts Modified', Value: report.summary.contractsModified },
        { Metric: 'Active Users', Value: report.summary.activeUsers },
      ];
      addExcelSheet(wb, 'Summary', summaryData);
      
      const modificationsData = report.recentModifications.map((item: any) => ({
        'Contract Number': item.contractNumber,
        'Edited By': item.editedBy,
        'Edit Reason': item.editReason,
        'Changes Summary': item.changesSummary,
        'Edited At': formatDate(item.editedAt)
      }));
      addExcelSheet(wb, 'Modifications', modificationsData);
      
      const userActivityData = report.userActivity.map((item: any) => ({
        User: item.userName,
        'Modifications': item.modificationCount,
        'Contracts Modified': item.contractsModified
      }));
      addExcelSheet(wb, 'User Activity', userActivityData);
      
      const buffer = exportExcelToBuffer(wb);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="audit-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx"`);
      res.send(buffer);
    } else {
      res.status(400).json({ message: 'Invalid export format. Use "pdf" or "excel".' });
    }
  } catch (error) {
    console.error("Error exporting audit report:", error);
    res.status(500).json({ message: "Failed to export audit report" });
  }
});

/**
 * POST /api/reports/insurance/export
 * Export insurance claims report to PDF or Excel
 */
router.post("/insurance/export", isAuthenticated, requireReportsAccess, async (req: any, res) => {
  try {
    const { format: exportFormat, startDate: startDateParam, endDate: endDateParam, lang } = req.query;
    const { charts = [] } = req.body;
    const startDate = startDateParam ? new Date(startDateParam as string) : undefined;
    const endDate = endDateParam ? new Date(endDateParam as string) : undefined;
    const isRTL = lang === 'ar';
    
    const report = await storage.getInsuranceReport(startDate, endDate);
    const settings = await storage.getCompanySettings();
    const currency = isRTL ? settings.currencyAr : settings.currencyEn;
    
    const { 
      createPDF, 
      addPDFSummarySection, 
      addPDFTable, 
      addPDFChartImages,
      createExcelWorkbook, 
      addExcelSheet,
      addExcelChartSheet,
      exportExcelToBuffer,
      formatCurrency,
      formatDate 
    } = await import('../utils/exportHelpers');

    if (exportFormat === 'pdf') {
      const doc = createPDF(
        'Insurance Claims Report',
        {
          nameEn: settings.companyNameEn,
          nameAr: settings.companyNameAr,
          phone: settings.phone || undefined,
          email: settings.email || undefined,
        },
        isRTL
      );

      let currentY = addPDFSummarySection(doc, 'Summary', [
        { label: 'Total Claims', value: report.summary.totalClaims.toString() },
        { label: 'Pending Claims', value: report.summary.pendingClaims.toString() },
        { label: 'Approved Claims', value: report.summary.approvedClaims.toString() },
        { label: 'Settled Claims', value: report.summary.settledClaims.toString() },
        { label: 'Total Claim Amount', value: formatCurrency(report.summary.totalClaimAmount, currency) },
        { label: 'Total Settled Amount', value: formatCurrency(report.summary.totalSettledAmount, currency) },
      ], 55);

      if (report.claimsByStatus.length > 0) {
        currentY += 5;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Claims by Status', 14, currentY);
        
        const statusData = report.claimsByStatus.map(item => [
          item.status.charAt(0).toUpperCase() + item.status.slice(1),
          item.count.toString(),
          formatCurrency(item.totalAmount, currency)
        ]);
        
        addPDFTable(doc, ['Status', 'Count', 'Total Amount'], statusData, currentY + 5);
      }
      
      if (charts && charts.length > 0) {
        const docWithTable = doc as any;
        addPDFChartImages(doc, charts, docWithTable.lastAutoTable ? docWithTable.lastAutoTable.finalY + 10 : currentY + 10);
      }

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="insurance-report-${format(new Date(), 'yyyy-MM-dd')}.pdf"`);
      res.send(pdfBuffer);
    } else if (exportFormat === 'excel') {
      const wb = createExcelWorkbook();
      
      const summaryData = [
        { Metric: 'Total Claims', Value: report.summary.totalClaims },
        { Metric: 'Pending Claims', Value: report.summary.pendingClaims },
        { Metric: 'Approved Claims', Value: report.summary.approvedClaims },
        { Metric: 'Settled Claims', Value: report.summary.settledClaims },
        { Metric: 'Total Claim Amount', Value: report.summary.totalClaimAmount },
        { Metric: 'Total Settled Amount', Value: report.summary.totalSettledAmount },
      ];
      addExcelSheet(wb, 'Summary', summaryData);
      
      const claimsData = report.claimsByStatus.map(item => ({
        Status: item.status,
        Count: item.count,
        'Total Amount': item.totalAmount
      }));
      addExcelSheet(wb, 'Claims by Status', claimsData);
      
      const recentClaimsData = report.recentClaims.map((item: any) => ({
        'Claim Number': item.claimNumber,
        'Contract Number': item.contractNumber,
        'Insurance Company': item.insuranceCompany,
        'Claim Amount': item.claimAmount,
        Status: item.status,
        'Incident Date': formatDate(item.incidentDate)
      }));
      addExcelSheet(wb, 'Recent Claims', recentClaimsData);
      
      if (charts && charts.length > 0) {
        addExcelChartSheet(wb, charts);
      }
      
      const buffer = exportExcelToBuffer(wb);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="insurance-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx"`);
      res.send(buffer);
    } else {
      res.status(400).json({ message: 'Invalid export format. Use "pdf" or "excel".' });
    }
  } catch (error) {
    console.error("Error exporting insurance report:", error);
    res.status(500).json({ message: "Failed to export insurance report" });
  }
});

export default router;
