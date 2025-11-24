# REPORTS CATALOG

**Document Purpose:** Comprehensive catalog of all reports in the KarāraOS system with technical specifications, data sources, and recommendations  
**Total Reports:** 25+ existing reports + 12 recommended reports  
**Categories:** Financial, Operational, Customer Analytics, Predictive Intelligence, Audit & Compliance  
**Last Updated:** November 23, 2025

---

## TABLE OF CONTENTS

1. [Financial Reports](#financial-reports)
2. [Operational Reports](#operational-reports)
3. [Customer Reports](#customer-reports)
4. [Predictive Analytics Reports](#predictive-analytics-reports)
5. [Audit & Compliance Reports](#audit--compliance-reports)
6. [Recommended New Reports](#recommended-new-reports)
7. [Report Infrastructure](#report-infrastructure)

---

## FINANCIAL REPORTS

### 1. Financial Reports Dashboard
**File:** `client/src/pages/FinancialReports.tsx`  
**Access Level:** Admin, Manager  
**Navigation:** Reports → Financial Reports

**Purpose:**  
Comprehensive financial performance dashboard providing real-time revenue, collection, and payment analytics with multi-dimensional breakdowns.

**Data Sources:**
- **Primary Tables:** `contracts`, `payments`
- **Related Tables:** `customers`, `vehicles`, `branches`

**Key Metrics Calculated:**
1. **Total Revenue** = SUM(contract.totalAmount + contract.totalExtraCharges + contract.dropOffCharge + contract.pickUpCharge)
2. **Total Collected** = SUM(payment.amount) WHERE payment.contractId IN (contracts)
3. **Total Outstanding** = Total Revenue - Total Collected
4. **Collection Rate** = (Total Collected / Total Revenue) × 100

**Report Sections:**
1. **Revenue Analysis Tab:**
   - Monthly revenue breakdown (12 months)
   - Revenue by contract status (active/completed/closed)
   - Revenue trend line chart
   - Revenue by status pie chart

2. **Collection Performance Tab:**
   - Payment method breakdown (cash/card/transfer/cheque)
   - Recent payments table (last 20)
   - Collection rate KPIs
   - Payment method pie chart

3. **Outstanding Payments Tab:**
   - Contracts with outstanding balances
   - Aging analysis (current/30/60/90+ days)
   - Customer payment history
   - Overdue highlights

**Filters:**
- Date range (startDate, endDate)
- Branch selection
- Contract status

**Export Formats:**
- PDF (with embedded charts)
- Excel (with raw data + charts)

**Calculations:**
```javascript
// Monthly Revenue
monthlyRevenue = contracts
  .filter(c => c.rentalStartDate >= startDate && c.rentalStartDate <= endDate)
  .reduce((acc, c) => {
    const month = format(c.rentalStartDate, 'yyyy-MM');
    acc[month] = (acc[month] || 0) + parseFloat(c.totalAmount);
    return acc;
  }, {});

// Collection Rate
collectionRate = (totalCollected / totalRevenue) × 100;
```

---

### 2. Revenue Trends Report
**File:** `client/src/pages/RevenueTrendsReport.tsx`  
**Access Level:** Admin, Manager  
**API Endpoint:** `/api/analytics/revenue-trend?months={months}`

**Purpose:**  
Time-series revenue analysis with month-over-month growth tracking, seasonal pattern identification, and revenue forecasting.

**Data Sources:**
- **Primary Tables:** `contracts`, `payments`
- **Aggregation:** Monthly grouping

**Key Metrics Calculated:**
1. **Total Revenue (Period)** = SUM(all contract amounts in period)
2. **Average Revenue Per Month** = Total Revenue / Number of Months
3. **Average Revenue Per Contract** = Total Revenue / Total Contract Count
4. **Month-over-Month Growth %** = ((Current Month - Previous Month) / Previous Month) × 100
5. **Highest Revenue Month** = MAX(monthly revenue)
6. **Lowest Revenue Month** = MIN(monthly revenue)

**Visual Components:**
- Line chart: Monthly revenue trend
- Area chart: Revenue accumulation
- Bar chart: Contract count per month
- Trend indicators with percentage change

**Filters:**
- Time period selector (6/12/18/24 months)

**Export Formats:**
- CSV with summary + monthly breakdown

**Calculations:**
```javascript
// Month-over-Month Growth
momGrowth = ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) × 100;

// Average Per Contract
avgPerContract = totalRevenue / totalContracts;
```

---

### 3. Revenue Forecast Report
**File:** `client/src/pages/RevenueForecastReport.tsx`  
**Access Level:** Admin, Manager

**Purpose:**  
ML-based revenue forecasting using historical data, seasonal patterns, and trend analysis to predict future revenue.

**Data Sources:**
- **Primary Tables:** `contracts` (historical data)
- **Time Range:** Last 12-24 months for model training

**Key Metrics Calculated:**
1. **Forecasted Revenue (30/60/90 days)** = Linear regression + seasonal adjustment
2. **Confidence Interval (80%/90%/95%)** = Statistical confidence bounds
3. **Expected Contract Count** = Based on historical average
4. **Revenue Growth Rate Projection** = Trend line slope

**Forecasting Model:**
- **Algorithm:** Linear regression with seasonal decomposition
- **Factors Considered:**
  - Historical revenue trends
  - Seasonal patterns (monthly variations)
  - Day-of-week patterns
  - Holiday adjustments
  - Growth rate trends

**Visual Components:**
- Line chart: Historical + forecasted revenue
- Confidence interval bands (shaded areas)
- Comparison: Last year vs forecast
- Scenario analysis (optimistic/realistic/pessimistic)

**Filters:**
- Forecast period (30/60/90 days)
- Confidence level (80%/90%/95%)
- Include seasonality toggle

**Export Formats:**
- PDF with forecast chart
- Excel with forecast data + confidence intervals

---

### 4. Collection Performance Report
**File:** `client/src/pages/CollectionPerformanceReport.tsx`  
**Access Level:** Admin, Manager

**Purpose:**  
Detailed analysis of payment collection efficiency, aging analysis, and payment behavior patterns.

**Data Sources:**
- **Primary Tables:** `payments`, `contracts`, `customers`

**Key Metrics Calculated:**
1. **Overall Collection Rate** = (Total Collected / Total Billed) × 100
2. **Average Days to Collect** = AVG(payment.date - contract.rentalEndDate)
3. **Collection by Aging Bucket:**
   - Current (0-30 days): % collected
   - 30-60 days: % collected
   - 60-90 days: % collected
   - 90+ days: % collected
4. **Customer Payment Score** = Based on payment history and timeliness

**Aging Analysis:**
```javascript
// Classify outstanding by age
agingBuckets = {
  current: contracts.filter(c => daysOverdue <= 30),
  days30: contracts.filter(c => daysOverdue > 30 && daysOverdue <= 60),
  days60: contracts.filter(c => daysOverdue > 60 && daysOverdue <= 90),
  days90Plus: contracts.filter(c => daysOverdue > 90)
};
```

**Visual Components:**
- Aging pyramid chart
- Collection rate trend over time
- Payment method effectiveness comparison
- Top delinquent accounts table

**Filters:**
- Date range
- Branch
- Aging bucket
- Customer segment

**Export Formats:**
- PDF (with charts)
- CSV (detailed aging report)

---

### 5. Unclosed Contracts Report
**File:** `client/src/pages/UnclosedContractsReport.tsx`  
**Access Level:** Admin, Manager

**Purpose:**  
Identify and track contracts that are past their end date but not yet closed, including financial impact analysis.

**Data Sources:**
- **Primary Tables:** `contracts`, `customers`, `vehicles`

**Key Metrics Calculated:**
1. **Total Unclosed Contracts** = COUNT(contracts WHERE status != 'closed' AND rentalEndDate < TODAY)
2. **Total Outstanding Amount** = SUM(unclosed contracts outstanding balance)
3. **Average Days Overdue** = AVG(TODAY - contract.rentalEndDate)
4. **Longest Overdue** = MAX(TODAY - contract.rentalEndDate)
5. **Financial Impact** = SUM(potential late fees + outstanding)

**Contract Classification:**
- **Overdue Returns:** End date passed, vehicle not returned
- **Pending Closure:** Returned but paperwork incomplete
- **Outstanding Payments:** Returned but balance unpaid

**Visual Components:**
- Unclosed contracts by branch
- Overdue days distribution histogram
- Financial impact by customer
- Priority action list

**Filters:**
- Branch
- Days overdue (minimum)
- Contract start date range
- Customer

**Export Formats:**
- Excel (action list with contact details)
- PDF (summary report)

---

## OPERATIONAL REPORTS

### 6. Operational Reports Dashboard
**File:** `client/src/pages/OperationalReports.tsx`  
**Access Level:** Admin, Manager

**Purpose:**  
Central hub providing links and quick stats for all operational performance reports.

**Quick Stats Displayed:**
- Fleet utilization rate
- Active contracts count
- Pending returns count
- Maintenance due alerts
- Driver utilization rate

---

### 7. Fleet Performance Report
**File:** `client/src/pages/FleetPerformanceReport.tsx`  
**Access Level:** Admin, Manager

**Purpose:**  
Comprehensive analysis of individual vehicle performance including revenue generation, utilization, and profitability.

**Data Sources:**
- **Primary Tables:** `vehicles`, `contracts`, `vehicleMaintenance`

**Key Metrics Calculated:**
1. **Vehicle Revenue** = SUM(contract amounts for vehicle)
2. **Contract Count** = COUNT(contracts for vehicle)
3. **Total Rental Days** = SUM(contract.totalDays)
4. **Average Revenue Per Day** = Total Revenue / Total Days
5. **Utilization Rate** = (Days Rented / Days Available) × 100
6. **Maintenance Cost** = SUM(vehicleMaintenance.cost)
7. **Net Profit** = Revenue - Maintenance Cost - Depreciation

**Performance Metrics Per Vehicle:**
```javascript
vehicleMetrics = {
  revenue: SUM(contracts.totalAmount WHERE vehicleId = vehicle.id),
  rentalDays: SUM(contracts.totalDays WHERE vehicleId = vehicle.id),
  contractCount: COUNT(contracts WHERE vehicleId = vehicle.id),
  utilizationRate: (rentalDays / 365) × 100,
  avgRevenuePerDay: revenue / rentalDays,
  maintenanceCost: SUM(maintenance.cost),
  netProfit: revenue - maintenanceCost
};
```

**Visual Components:**
- Top performers table (sortable by revenue/contracts/utilization)
- Vehicle type distribution pie chart
- Revenue per vehicle bar chart
- Utilization rate scatter plot

**Filters:**
- Date range
- Branch
- Vehicle category
- Minimum utilization threshold

**Export Formats:**
- CSV (all vehicle details)
- PDF (top 20 performers)

---

### 8. Driver Utilization Report
**File:** `client/src/pages/DriverUtilizationReport.tsx`  
**Access Level:** Admin, Manager  
**Also at:** `client/src/pages/reports/DriverUtilizationReport.tsx`

**Purpose:**  
Analyze driver performance, utilization rates, and service quality metrics for both internal and outsourced drivers.

**Data Sources:**
- **Primary Tables:** `drivers`, `driverAssignments`, `contracts`

**Key Metrics Calculated:**
1. **Driver Utilization Rate** = (Assigned Days / Available Days) × 100
2. **Revenue Generated** = SUM(driver service charges)
3. **Assignment Count** = COUNT(driver assignments)
4. **Average Assignment Duration** = AVG(assignment end - start)
5. **Customer Satisfaction** = AVG(customer ratings) if available
6. **Emirate Coverage** = COUNT(DISTINCT emirates serviced)

**Driver Performance Metrics:**
```javascript
driverMetrics = {
  assignedDays: COUNT(distinct days with assignments),
  totalRevenue: SUM(contract.driverDailyRate × days),
  assignmentCount: COUNT(assignments),
  avgDuration: AVG(assignment.endDateTime - assignment.startDateTime),
  utilizationRate: (assignedDays / 365) × 100,
  emirates: COUNT(DISTINCT emiratePickup, emirateDropoff)
};
```

**Visual Components:**
- Driver utilization comparison bar chart
- Internal vs Outsource comparison
- Emirate coverage heatmap
- Revenue per driver ranking

**Filters:**
- Date range
- Driver type (internal/outsource)
- Emirate
- Minimum utilization

**Export Formats:**
- Excel (driver performance scorecard)

---

### 9. Driver Revenue & Cost Report
**File:** `client/src/pages/DriverRevenueCostReport.tsx`  
**Access Level:** Admin, Manager

**Purpose:**  
Financial analysis of driver service profitability comparing revenue generated vs costs incurred.

**Data Sources:**
- **Primary Tables:** `drivers`, `driverCompanies`, `contracts`, `driverAssignments`

**Key Metrics Calculated:**
1. **Total Driver Revenue** = SUM(contract.driverDailyRate × days)
2. **Total Driver Cost** = 
   - Internal: SUM(driver salary/365 × days assigned)
   - Outsource: SUM(driverCompany rate × days)
3. **Gross Profit Margin** = ((Revenue - Cost) / Revenue) × 100
4. **Cost Per Assignment** = Total Cost / Assignment Count
5. **Revenue Per Assignment** = Total Revenue / Assignment Count

**Profitability Analysis:**
```javascript
driverProfitability = {
  revenue: SUM(driverServiceCharges),
  cost: driverType === 'internal' 
    ? (monthlySalary / 30) × assignedDays
    : driverCompany.dailyRate × assignedDays,
  grossProfit: revenue - cost,
  profitMargin: ((revenue - cost) / revenue) × 100
};
```

**Visual Components:**
- Revenue vs Cost comparison bars
- Profit margin trend over time
- Internal vs Outsource cost comparison
- Driver company profitability ranking

**Filters:**
- Date range
- Driver type
- Driver company (for outsource)
- Minimum profit margin

**Export Formats:**
- PDF (profitability summary)
- Excel (detailed cost breakdown)

---

### 10. Contract Analytics Report
**File:** `client/src/pages/ContractAnalyticsReport.tsx`  
**Access Level:** Admin, Manager

**Purpose:**  
Comprehensive contract lifecycle analytics including conversion rates, duration patterns, and revenue analysis.

**Data Sources:**
- **Primary Tables:** `contracts`, `customers`, `vehicles`, `branches`

**Key Metrics Calculated:**
1. **Total Contracts** = COUNT(all contracts)
2. **Contracts by Status:**
   - Draft: COUNT(status = 'draft')
   - Pending: COUNT(status = 'pending')
   - Active: COUNT(status = 'active')
   - Completed: COUNT(status = 'completed')
3. **Average Contract Value** = AVG(contract.totalAmount)
4. **Average Contract Duration** = AVG(contract.totalDays)
5. **Conversion Rate** = (Active + Completed) / (All Contracts) × 100
6. **Early Termination Rate** = COUNT(closed before end date) / Total × 100

**Contract Patterns:**
```javascript
contractPatterns = {
  avgDuration: AVG(contracts.totalDays),
  avgValue: AVG(contracts.totalAmount),
  durationDistribution: GROUP_BY(contracts, 
    CASE 
      WHEN totalDays <= 7 THEN 'Weekly'
      WHEN totalDays <= 30 THEN 'Monthly'
      ELSE 'Long-term'
    END
  ),
  byHirerType: {
    individual: COUNT(hirerType = 'individual'),
    corporate: COUNT(hirerType = 'corporate')
  }
};
```

**Visual Components:**
- Contract status funnel chart
- Duration distribution histogram
- Revenue by hirer type pie chart
- Monthly contract count trend line

**Filters:**
- Date range
- Branch
- Contract status
- Hirer type (individual/corporate)
- Driver required filter

**Export Formats:**
- PDF (analytics summary)
- CSV (contract details)

---

### 11. Insurance Reports
**File:** `client/src/pages/InsuranceReports.tsx`  
**Access Level:** Admin, Manager

**Purpose:**  
Track and analyze insurance claims, costs, and patterns to optimize insurance strategy.

**Data Sources:**
- **Primary Tables:** `insuranceClaims`, `contracts`, `vehicles`, `customers`

**Key Metrics Calculated:**
1. **Total Claims** = COUNT(insurance claims)
2. **Total Claim Amount** = SUM(claim.estimatedCost)
3. **Average Claim Cost** = AVG(claim.estimatedCost)
4. **Claims by Type:**
   - Collision: COUNT(type = 'collision')
   - Theft: COUNT(type = 'theft')
   - Vandalism: COUNT(type = 'vandalism')
   - Fire: COUNT(type = 'fire')
   - Other: COUNT(other types)
5. **Claim Approval Rate** = COUNT(approved) / COUNT(all) × 100
6. **Average Processing Time** = AVG(resolution date - incident date)

**Cost Analysis:**
```javascript
insuranceAnalysis = {
  totalClaims: COUNT(claims),
  totalCost: SUM(claim.actualCost || claim.estimatedCost),
  avgCost: AVG(claim.actualCost || claim.estimatedCost),
  byVehicle: GROUP_BY(claims, vehicleId),
  byType: GROUP_BY(claims, claimType),
  approvalRate: COUNT(status = 'approved') / COUNT(all) × 100,
  costTrend: GROUP_BY(claims, MONTH(incidentDate))
};
```

**Visual Components:**
- Claims by type pie chart
- Monthly claim cost trend
- Vehicle claim frequency ranking
- Claim status breakdown

**Filters:**
- Date range
- Claim type
- Status
- Vehicle
- Minimum claim amount

**Export Formats:**
- PDF (claims summary)
- Excel (detailed claim list)

---

## CUSTOMER REPORTS

### 12. Customer Reports Dashboard
**File:** `client/src/pages/CustomerReports.tsx`  
**Access Level:** Admin, Manager

**Purpose:**  
Central navigation for all customer-focused analytics and risk assessment reports.

---

### 13. Customer Risk Scoring
**File:** `client/src/pages/CustomerRiskScoring.tsx`  
**Access Level:** Admin, Manager  
**API Endpoint:** `/api/customer-risk-scores`

**Purpose:**  
ML-based customer risk assessment system evaluating payment behavior, violation history, and creditworthiness.

**Data Sources:**
- **Primary Tables:** `customerRiskScores`, `customers`, `contracts`, `payments`, `incidents`, `trafficFines`

**Risk Score Components (0-100 scale):**
1. **Payment History Score (0-30):**
   - On-time payment rate
   - Average payment delay
   - Default history
   
2. **Contract Violations (0-15):**
   - Late returns count
   - Early terminations
   - Contract breaches

3. **Accident History (0-20):**
   - Number of accidents
   - Fault determination
   - Severity of incidents

4. **Fines History (0-15):**
   - Traffic fine count
   - Fine amount total
   - Unpaid fines

5. **License Validity (0-10):**
   - License expiry status
   - License type appropriateness
   - International license compliance

6. **Identity Verification (0-10):**
   - Document completeness
   - Verification status
   - Background check results

**Risk Calculation:**
```javascript
riskScore = {
  paymentHistory: calculatePaymentScore(customer),
  contractViolations: countViolations(customer),
  accidentHistory: countAccidents(customer),
  finesHistory: countFines(customer),
  licenseValidity: checkLicense(customer),
  identityVerification: verifyIdentity(customer),
  
  totalScore: SUM(all components),
  
  category: 
    totalScore <= 30 ? 'low' :
    totalScore <= 60 ? 'medium' :
    totalScore <= 80 ? 'high' : 'critical'
};
```

**Risk Categories:**
- **Low (0-30):** Minimal risk, standard terms
- **Medium (31-60):** Moderate risk, enhanced monitoring
- **High (61-80):** Significant risk, higher deposits required
- **Critical (81-100):** Severe risk, rental approval required

**Visual Components:**
- Risk score distribution histogram
- Risk category pie chart
- Customer risk ranking table
- Score component breakdown radar chart

**Actions:**
- Manual risk score recalculation
- Risk score override (with justification)
- Customer blacklist management
- Risk threshold configuration

**Filters:**
- Risk score range
- Risk category
- Active contracts only
- Blacklist status

**Export Formats:**
- CSV (all customer scores)
- PDF (high-risk customer list)

---

### 14. Customer Churn Risk Report
**File:** `client/src/pages/CustomerChurnRiskReport.tsx`  
**Access Level:** Admin, Manager

**Purpose:**  
Predictive analytics to identify customers at risk of churning based on behavioral patterns and engagement metrics.

**Data Sources:**
- **Primary Tables:** `customers`, `contracts`, `payments`

**Churn Indicators:**
1. **Rental Frequency Decline:**
   - Days since last rental
   - Rental count trend (last 6 months vs previous 6)
   - Decreasing rental duration

2. **Payment Behavior:**
   - Increasing payment delays
   - Partial payments frequency
   - Outstanding balance trend

3. **Service Issues:**
   - Complaint count
   - Unresolved issues
   - Negative feedback

4. **Engagement Level:**
   - Communication responsiveness
   - Campaign engagement rate
   - Account activity

**Churn Probability Calculation:**
```javascript
churnProbability = {
  daysSinceLastRental: TODAY - MAX(contract.rentalEndDate),
  rentalFrequencyDecline: (last6MonthsCount - previous6MonthsCount) / previous6MonthsCount,
  paymentDelayTrend: AVG(payment delays last 3 rentals),
  
  score: WEIGHTED_SUM(
    daysSinceLastRental × 0.3,
    rentalFrequencyDecline × 0.25,
    paymentDelayTrend × 0.20,
    complaintCount × 0.15,
    engagementScore × 0.10
  ),
  
  probability: SIGMOID(score),
  category: probability > 0.7 ? 'high' : probability > 0.4 ? 'medium' : 'low'
};
```

**Customer Value Metrics:**
1. **Lifetime Value (LTV)** = SUM(all contract revenue)
2. **Average Contract Value** = LTV / contract count
3. **Projected Annual Value** = Based on historical frequency
4. **Retention Value** = Potential revenue if retained

**Visual Components:**
- Churn probability distribution
- High-risk customers list (sorted by LTV)
- Churn factors breakdown
- Retention opportunity value

**Recommended Actions:**
- Automated win-back campaigns
- Personalized offers
- Account manager assignment
- Service quality review

**Filters:**
- Churn probability threshold
- Days since last rental
- Minimum lifetime value
- Branch

**Export Formats:**
- Excel (retention campaign list)
- PDF (executive churn summary)

---

### 15. Payment Default Prediction
**File:** `client/src/pages/PaymentDefaultPrediction.tsx`  
**Access Level:** Admin, Manager

**Purpose:**  
ML-based prediction of payment default risk for active and upcoming contracts to enable proactive collection strategies.

**Data Sources:**
- **Primary Tables:** `contracts`, `customers`, `payments`, `customerRiskScores`

**Default Risk Factors:**
1. **Historical Payment Behavior:**
   - Previous default history
   - Average payment delay
   - Partial payment frequency

2. **Current Contract Characteristics:**
   - Contract value vs customer history
   - Rental duration
   - Deposit amount

3. **Customer Financial Indicators:**
   - Outstanding balance
   - Payment method used
   - Sponsor/company backing

4. **External Factors:**
   - Customer risk score
   - Employment status
   - Time of year (seasonal patterns)

**Default Probability Model:**
```javascript
defaultProbability = {
  historicalDefault: COUNT(previous defaults) / COUNT(all contracts),
  avgPaymentDelay: AVG(payment.date - contract.rentalEndDate),
  contractRisk: contractValue / AVG(previous contract values),
  customerRisk: customerRiskScore / 100,
  depositRatio: securityDeposit / totalAmount,
  
  probability: ML_MODEL.predict([
    historicalDefault,
    avgPaymentDelay,
    contractRisk,
    customerRisk,
    depositRatio
  ]),
  
  category: probability > 0.6 ? 'high' : probability > 0.3 ? 'medium' : 'low'
};
```

**Visual Components:**
- Default risk distribution
- High-risk contracts table
- Risk factors contribution chart
- Projected collection rate

**Recommended Actions:**
- Increase deposit requirement
- Require sponsor/guarantor
- Shorten payment terms
- Enhanced monitoring
- Pre-emptive contact

**Filters:**
- Default probability threshold
- Customer ID
- Contract ID
- Branch

**Export Formats:**
- Excel (high-risk contracts action list)
- PDF (default risk summary)

---

## PREDICTIVE ANALYTICS REPORTS

### 16. Fleet Utilization Forecast
**File:** `client/src/pages/FleetUtilizationForecast.tsx`  
**Access Level:** Admin, Manager

**Purpose:**  
Predict future fleet utilization patterns to optimize fleet size, pricing, and vehicle allocation across branches.

**Data Sources:**
- **Primary Tables:** `vehicles`, `contracts` (historical data)
- **Time Range:** Last 12-24 months

**Forecasting Model:**
1. **Historical Utilization Analysis:**
   - Vehicle utilization rate by month
   - Seasonal patterns (summer/winter, weekdays/weekends)
   - Holiday period impacts
   - Branch-specific patterns

2. **Demand Drivers:**
   - Historical booking patterns
   - Marketing campaign effects
   - Pricing elasticity
   - Competitor activity (if available)

3. **Capacity Planning:**
   - Current fleet size
   - Maintenance schedule impacts
   - Vehicle transfers between branches
   - New vehicle acquisitions planned

**Utilization Forecast Calculation:**
```javascript
utilizationForecast = {
  historicalAvg: AVG(vehicle utilization last 12 months),
  seasonalFactor: SEASONAL_DECOMPOSITION(monthly utilization),
  trendComponent: LINEAR_REGRESSION(utilization over time),
  
  forecast: {
    next7Days: historicalAvg × seasonalFactor × trendComponent,
    next14Days: /* same calculation */,
    next30Days: /* same calculation */,
    next60Days: /* same calculation */
  },
  
  confidenceInterval: CALCULATE_CONFIDENCE(historical_variance, forecast_period)
};
```

**Branch-Level Forecasts:**
- Utilization rate by branch
- Recommended fleet size adjustments
- Inter-branch transfer recommendations
- Acquisition/disposal recommendations

**Visual Components:**
- Historical utilization with forecast overlay
- Confidence interval bands
- Branch comparison forecast
- Vehicle category utilization forecast

**Filters:**
- Forecast period (7/14/30/60 days)
- Branch
- Vehicle category
- Confidence interval (80%/90%/95%)
- Include seasonality toggle

**Export Formats:**
- PDF (fleet planning report)
- Excel (detailed forecast data)

---

### 17. Location Demand Forecast
**File:** `client/src/pages/LocationDemandForecast.tsx`  
**Access Level:** Admin, Manager

**Purpose:**  
Predict rental demand by emirate/location to optimize vehicle distribution and marketing spend allocation.

**Data Sources:**
- **Primary Tables:** `contracts`, `branches`
- **Geographic Data:** Pickup/dropoff locations by emirate

**Demand Factors:**
1. **Historical Patterns:**
   - Rental count by emirate
   - Seasonal variations
   - Special events calendar

2. **Geographic Insights:**
   - Tourist season impacts
   - Business district patterns
   - Residential area trends

3. **External Factors:**
   - Public holidays
   - Major events (Expo, conferences)
   - Weather patterns

**Demand Forecast Model:**
```javascript
locationDemand = {
  historicalDemand: GROUP_BY(contracts, emirate, MONTH),
  eventImpact: CALENDAR_EVENTS.map(event => ({
    emirate: event.location,
    expectedIncrease: event.attendance × conversionRate
  })),
  seasonalPattern: SEASONAL_DECOMPOSITION(demand by emirate),
  
  forecast: {
    dubai: BASE_DEMAND × SEASONAL_FACTOR × EVENT_FACTOR,
    abuDhabi: /* similar */,
    sharjah: /* similar */,
    // ... other emirates
  },
  
  rebalancingRecommendations: OPTIMIZE(forecast, current_distribution)
};
```

**Rebalancing Recommendations:**
- Vehicles to transfer from Branch A to Branch B
- Optimal fleet distribution by location
- Marketing budget allocation suggestions
- Pricing adjustment recommendations

**Visual Components:**
- UAE map heatmap (demand intensity)
- Demand forecast by emirate (line charts)
- Current vs optimal distribution comparison
- Transfer recommendation matrix

**Filters:**
- Forecast period (7/14/30/60 days)
- Emirate selection
- Granularity (daily/weekly)
- Include events toggle

**Export Formats:**
- PDF (geographic demand report)
- Excel (rebalancing action plan)

---

### 18. Maintenance Cost Forecast
**File:** `client/src/pages/MaintenanceCostForecast.tsx`  
**Access Level:** Admin, Manager

**Purpose:**  
Predict upcoming maintenance costs based on vehicle age, mileage, and historical maintenance patterns.

**Data Sources:**
- **Primary Tables:** `vehicles`, `vehicleMaintenance`, `contracts`

**Cost Prediction Factors:**
1. **Vehicle Characteristics:**
   - Age (years since manufacture)
   - Total mileage
   - Make/model maintenance patterns

2. **Usage Patterns:**
   - Average monthly mileage
   - Rental frequency
   - Driving conditions (city vs highway)

3. **Maintenance History:**
   - Past maintenance costs
   - Maintenance frequency
   - Parts replacement patterns

4. **Scheduled Maintenance:**
   - Upcoming service due dates
   - Recommended service intervals
   - Warranty coverage remaining

**Cost Forecast Calculation:**
```javascript
maintenanceForecast = {
  scheduledCosts: SUM(upcoming scheduled maintenance based on odometer/date),
  predictiveCosts: ML_MODEL.predict([
    vehicleAge,
    totalMileage,
    avgMonthlyMileage,
    historicalCostTrend,
    makeModelFactor
  ]),
  
  emergencyReserve: AVG(historical emergency repairs) × SAFETY_FACTOR,
  
  total: scheduledCosts + predictiveCosts + emergencyReserve,
  
  perVehicle: GROUP_BY(vehicles, calculate forecasted cost),
  perCategory: GROUP_BY(vehicles, category, SUM(forecasted costs))
};
```

**Maintenance Categories:**
- **Scheduled:** Oil changes, tire rotations, inspections
- **Predictive:** Based on wear patterns and ML models
- **Emergency:** Statistical allocation for unexpected repairs
- **Major Overhauls:** Timing belt, transmission, etc.

**Visual Components:**
- Monthly maintenance cost forecast (stacked bars)
- Cost by vehicle category pie chart
- High-cost vehicles list
- Maintenance schedule calendar

**Budget Planning:**
- 30-day maintenance budget
- 60-day maintenance budget
- 90-day maintenance budget
- Annual projection

**Filters:**
- Forecast period (30/60/90 days)
- Vehicle
- Branch
- Maintenance type
- Confidence interval

**Export Formats:**
- Excel (maintenance budget plan)
- PDF (cost forecast summary)

---

## AUDIT & COMPLIANCE REPORTS

### 19. Audit Reports Dashboard
**File:** `client/src/pages/AuditReports.tsx`  
**Access Level:** Admin only

**Purpose:**  
Centralized access to all compliance and audit trail reports for governance and regulatory requirements.

---

### 20. Access Report
**File:** `client/src/pages/AccessReport.tsx`  
**Access Level:** Admin only

**Purpose:**  
Track user access patterns, permission usage, and potential security concerns across the system.

**Data Sources:**
- **Primary Tables:** `auditLogs`, `users`

**Tracked Activities:**
1. **Login/Logout Events:**
   - User login times
   - Failed login attempts
   - Session duration
   - IP addresses

2. **Permission Usage:**
   - Resource access by role
   - Elevated privilege usage
   - Cross-branch access

3. **Sensitive Operations:**
   - Financial data access
   - Customer PII views
   - Configuration changes
   - Export operations

**Access Metrics:**
```javascript
accessMetrics = {
  totalLogins: COUNT(login events),
  failedAttempts: COUNT(failed logins),
  avgSessionDuration: AVG(logout time - login time),
  accessByRole: GROUP_BY(access logs, user.role),
  accessByResource: GROUP_BY(access logs, resourceType),
  suspiciousActivity: DETECT([
    multipleFailedLogins,
    unusualAccessTime,
    bulkDataExports,
    crossBranchAccess
  ])
};
```

**Visual Components:**
- Access frequency heatmap (user × time)
- Failed login attempts timeline
- Resource access distribution
- Role-based access patterns

**Security Alerts:**
- Multiple failed login attempts
- After-hours access to sensitive data
- Unusual export activity
- Role escalation attempts

**Filters:**
- Date range
- User
- Role
- Resource type
- Access result (granted/denied)

**Export Formats:**
- PDF (security audit report)
- CSV (detailed access log)

---

### 21. Approval Turnaround Report
**File:** `client/src/pages/reports/ApprovalTurnaroundReport.tsx`  
**Access Level:** Admin, Manager

**Purpose:**  
Track approval workflow performance, bottlenecks, and compliance with approval SLAs.

**Data Sources:**
- **Primary Tables:** `approvalWorkflows`, `contracts`, `campaigns`

**Turnaround Metrics:**
1. **Average Approval Time** = AVG(approval time - submission time)
2. **Approval SLA Compliance** = COUNT(within SLA) / COUNT(all) × 100
3. **Bottleneck Identification** = Longest average wait time by approver
4. **Rejection Rate** = COUNT(rejected) / COUNT(all) × 100

**Workflow Efficiency:**
```javascript
approvalMetrics = {
  avgTurnaround: AVG(approval.date - request.date),
  slaCompliance: COUNT(turnaround <= SLA) / COUNT(all) × 100,
  byApprover: GROUP_BY(approvals, approverId, {
    count: COUNT(approvals),
    avgTime: AVG(turnaround),
    rejectionRate: COUNT(rejected) / COUNT(all) × 100
  }),
  byWorkflowType: GROUP_BY(approvals, workflowType),
  escalations: COUNT(approvals WHERE escalated = true)
};
```

**Visual Components:**
- Turnaround time trend
- Approver performance comparison
- Workflow type analysis
- SLA compliance gauge

**Filters:**
- Date range
- Workflow type
- Approver
- Status (pending/approved/rejected)

**Export Formats:**
- PDF (workflow performance report)
- Excel (approval details)

---

### 22. Maintenance Compliance Report
**File:** `client/src/pages/reports/MaintenanceComplianceReport.tsx`  
**Access Level:** Admin, Manager

**Purpose:**  
Ensure fleet maintenance compliance with safety regulations and manufacturer recommendations.

**Data Sources:**
- **Primary Tables:** `vehicles`, `vehicleMaintenance`

**Compliance Checks:**
1. **Scheduled Maintenance:**
   - Services due vs completed
   - Overdue maintenance count
   - Compliance rate by vehicle

2. **Safety Inspections:**
   - Inspection frequency
   - Failed inspection items
   - Corrective action timeline

3. **Regulatory Compliance:**
   - Vehicle registration status
   - Insurance validity
   - Emission test status

**Compliance Calculation:**
```javascript
complianceMetrics = {
  scheduledCompliance: COUNT(on-time maintenance) / COUNT(all maintenance) × 100,
  overdueCount: COUNT(vehicles with overdue maintenance),
  avgDelayDays: AVG(completed date - due date) for overdue,
  safetyInspectionRate: COUNT(passed inspections) / COUNT(all inspections) × 100,
  documentCompliance: COUNT(all docs valid) / COUNT(all vehicles) × 100
};
```

**Visual Components:**
- Compliance rate by vehicle
- Overdue maintenance list
- Maintenance schedule calendar
- Compliance trend over time

**Filters:**
- Branch
- Vehicle
- Maintenance type
- Compliance status

**Export Formats:**
- PDF (compliance summary)
- Excel (overdue action list)

---

### 23. Traffic Fine Aging Report
**File:** `client/src/pages/reports/TrafficFineAgingReport.tsx`  
**Access Level:** Admin, Manager

**Purpose:**  
Track unpaid traffic fines by age to manage liability and implement collection strategies.

**Data Sources:**
- **Primary Tables:** `trafficFines`, `contracts`, `customers`

**Aging Analysis:**
1. **Fine Age Buckets:**
   - Current (0-30 days): Recent fines
   - 30-60 days: Approaching penalty
   - 60-90 days: Penalty risk
   - 90+ days: Critical/legal risk

2. **Financial Impact:**
   - Total unpaid fines
   - Potential penalties
   - Collection probability
   - Legal cost risk

**Aging Metrics:**
```javascript
fineAgingMetrics = {
  current: COUNT(age <= 30 days) + SUM(amounts),
  days30: COUNT(30 < age <= 60) + SUM(amounts),
  days60: COUNT(60 < age <= 90) + SUM(amounts),
  days90Plus: COUNT(age > 90) + SUM(amounts),
  
  totalUnpaid: SUM(all unpaid fines),
  estimatedPenalties: CALCULATE_PENALTIES(overdue fines),
  collectionProbability: ML_PREDICT(collection likelihood by age)
};
```

**Visual Components:**
- Aging pyramid chart
- Fine amount by age bucket
- Customer responsibility breakdown
- Collection priority ranking

**Actions:**
- Customer notification
- Penalty warning
- Legal escalation
- Payment plan offering

**Filters:**
- Age bucket
- Vehicle
- Contract
- Customer
- Fine type

**Export Formats:**
- Excel (fine collection action list)
- PDF (aging summary)

---

## RECOMMENDED NEW REPORTS

The following reports would add significant value to the KarāraOS system but are not currently implemented:

### 24. RECOMMENDED: Customer Lifetime Value (CLV) Report
**Recommended Priority:** HIGH  
**Business Value:** Revenue optimization, customer segmentation

**Purpose:**  
Calculate and segment customers by their lifetime value to enable targeted retention and growth strategies.

**Data Sources:**
- **Primary Tables:** `customers`, `contracts`, `payments`

**Key Metrics:**
1. **Historical CLV** = SUM(all customer revenue to date)
2. **Predicted CLV** = Historical × predicted future rentals
3. **CLV Segments:**
   - VIP (Top 10%): >$20,000
   - High Value (10-30%): $10,000-$20,000
   - Standard (30-70%): $2,000-$10,000
   - Low Value (70-100%): <$2,000

4. **Customer Profitability:**
   - Revenue per customer
   - Cost to serve
   - Net profit margin

**Calculation:**
```javascript
clvMetrics = {
  historicalValue: SUM(all contract revenue),
  avgContractValue: historicalValue / contractCount,
  rentalFrequency: contractCount / customerAgeInMonths,
  predictedLifetime: PREDICT(churn probability),
  
  predictedCLV: avgContractValue × rentalFrequency × predictedLifetime,
  
  segment: CLASSIFY(predictedCLV, [
    { min: 20000, label: 'VIP' },
    { min: 10000, label: 'High Value' },
    { min: 2000, label: 'Standard' },
    { min: 0, label: 'Low Value' }
  ])
};
```

**Recommended Actions:**
- VIP: Dedicated account manager, exclusive offers
- High Value: Priority service, loyalty rewards
- Standard: Upsell campaigns, satisfaction surveys
- Low Value: Win-back campaigns, value proposition review

**Visual Components:**
- CLV distribution histogram
- Segment composition pie chart
- CLV trend by cohort
- Top 100 customers table

**Export Formats:**
- Excel (customer segmentation list)
- PDF (CLV executive summary)

---

### 25. RECOMMENDED: Pricing Optimization Report
**Recommended Priority:** HIGH  
**Business Value:** Revenue maximization, competitive positioning

**Purpose:**  
Analyze pricing effectiveness and recommend optimal pricing strategies by vehicle category, season, and demand level.

**Data Sources:**
- **Primary Tables:** `contracts`, `vehicles`, `rentalRatePlans`
- **External Data:** Market pricing (if available)

**Key Metrics:**
1. **Price Elasticity** = % change in demand / % change in price
2. **Optimal Price Point** = Price that maximizes revenue
3. **Competitive Index** = Our price / market average price
4. **Revenue Impact** = Projected revenue change at different price points

**Calculation:**
```javascript
pricingOptimization = {
  currentAvgPrice: AVG(dailyRate by category),
  demandByPrice: GROUP_BY(contracts, price_bucket, COUNT),
  elasticity: CALCULATE_ELASTICITY(demandByPrice),
  
  optimalPrice: OPTIMIZE(price × demand, constraints: {
    minUtilization: 70%,
    maxPriceIncrease: 20%
  }),
  
  revenueImpact: (optimalPrice - currentPrice) × forecastedDemand
};
```

**Pricing Strategies:**
- **Dynamic Pricing:** Adjust by demand level
- **Seasonal Pricing:** Peak vs off-peak rates
- **Vehicle Category:** Premium pricing for luxury
- **Duration Discounts:** Weekly/monthly discounts
- **Early Bird:** Advanced booking discounts

**Visual Components:**
- Price-demand curve
- Competitive price comparison
- Revenue scenarios (price sensitivity)
- Optimal pricing recommendations

**Export Formats:**
- Excel (pricing strategy table)
- PDF (pricing recommendations)

---

### 26. RECOMMENDED: Branch Performance Comparison
**Recommended Priority:** MEDIUM  
**Business Value:** Operational efficiency, best practice sharing

**Purpose:**  
Compare performance metrics across all branches to identify high performers and opportunities for improvement.

**Data Sources:**
- **Primary Tables:** `branches`, `contracts`, `vehicles`, `users`

**Key Metrics by Branch:**
1. **Revenue:**
   - Total revenue
   - Revenue per vehicle
   - Revenue growth rate

2. **Operational Efficiency:**
   - Fleet utilization rate
   - Average contract duration
   - Staff productivity

3. **Customer Satisfaction:**
   - Return customer rate
   - Average customer rating
   - Complaint rate

4. **Financial Health:**
   - Collection rate
   - Outstanding balance %
   - Cost per rental

**Calculation:**
```javascript
branchComparison = {
  byBranch: branches.map(branch => ({
    revenue: SUM(contracts.totalAmount WHERE branchId = branch.id),
    utilization: AVG(vehicle utilization for branch),
    contractCount: COUNT(contracts for branch),
    revenuePerVehicle: revenue / vehicle count,
    staffProductivity: revenue / employee count,
    collectionRate: collected / total × 100
  })),
  
  rankings: RANK(branches by metric),
  bestPractices: IDENTIFY(top performers' differentiators)
};
```

**Visual Components:**
- Branch comparison radar chart
- Performance leaderboard
- Metric distribution by branch
- Growth trajectory lines

**Export Formats:**
- PDF (branch comparison report)
- Excel (detailed metrics)

---

### 27. RECOMMENDED: Vehicle Depreciation & ROI Report
**Recommended Priority:** MEDIUM  
**Business Value:** Fleet investment decisions, disposal planning

**Purpose:**  
Track vehicle depreciation, calculate ROI, and identify optimal disposal timing.

**Data Sources:**
- **Primary Tables:** `vehicles`, `contracts`, `vehicleMaintenance`

**Key Metrics:**
1. **Depreciation:**
   - Purchase price
   - Current market value
   - Depreciation rate
   - Book value

2. **ROI:**
   - Total revenue generated
   - Total costs (maintenance + operating)
   - Net profit
   - ROI percentage

3. **Disposal Optimization:**
   - Optimal disposal age
   - Residual value forecast
   - Replacement timing

**Calculation:**
```javascript
vehicleROI = {
  depreciation: purchasePrice - currentMarketValue,
  depreciationRate: depreciation / purchasePrice × 100,
  
  totalRevenue: SUM(all contract revenue),
  totalCosts: SUM(maintenance) + (depreciation / years owned),
  netProfit: totalRevenue - totalCosts,
  roi: (netProfit / purchasePrice) × 100,
  
  optimalDisposalAge: OPTIMIZE(
    roi over vehicle lifetime,
    considering: [depreciationCurve, maintenanceCostCurve, marketDemand]
  )
};
```

**Visual Components:**
- ROI by vehicle age scatter plot
- Depreciation curve by category
- Disposal recommendation list
- Fleet value trend

**Export Formats:**
- Excel (vehicle ROI scorecard)
- PDF (fleet investment summary)

---

### 28. RECOMMENDED: Campaign Effectiveness Report
**Recommended Priority:** MEDIUM  
**Business Value:** Marketing ROI, campaign optimization

**Purpose:**  
Measure marketing campaign performance including conversion rates, ROI, and customer acquisition cost.

**Data Sources:**
- **Primary Tables:** `campaigns`, `contracts`, `customers`
- **Attribution:** Campaign codes, referral sources

**Key Metrics:**
1. **Campaign Performance:**
   - Reach (messages sent)
   - Open rate (for email)
   - Click-through rate
   - Conversion rate

2. **Financial Impact:**
   - Revenue generated
   - Campaign cost
   - ROI
   - Customer acquisition cost (CAC)

3. **Effectiveness:**
   - New vs returning customers
   - Average contract value from campaign
   - Lifetime value of acquired customers

**Calculation:**
```javascript
campaignMetrics = {
  reach: COUNT(campaign recipients),
  openRate: COUNT(opened) / reach × 100,
  clickRate: COUNT(clicked) / COUNT(opened) × 100,
  conversions: COUNT(contracts with campaign attribution),
  conversionRate: conversions / reach × 100,
  
  revenue: SUM(contract revenue with attribution),
  cost: campaign.totalCost,
  roi: (revenue - cost) / cost × 100,
  cac: cost / conversions,
  
  clv: AVG(customer lifetime value for acquired customers)
};
```

**Visual Components:**
- Campaign funnel (reach → open → click → convert)
- ROI comparison by campaign
- Channel effectiveness comparison
- Time-to-conversion analysis

**Export Formats:**
- PDF (campaign performance report)
- Excel (campaign comparison matrix)

---

### 29. RECOMMENDED: Seasonal Trend Analysis
**Recommended Priority:** LOW  
**Business Value:** Demand forecasting, inventory planning

**Purpose:**  
Identify and quantify seasonal patterns in rental demand to optimize fleet size and pricing.

**Data Sources:**
- **Primary Tables:** `contracts`
- **Time Series:** 2-3 years of historical data

**Key Metrics:**
1. **Seasonal Indices:**
   - Monthly demand index (base = 100)
   - Day-of-week patterns
   - Holiday period impacts

2. **Pattern Recognition:**
   - Peak seasons
   - Off-peak periods
   - Trend vs seasonality separation

**Calculation:**
```javascript
seasonalAnalysis = {
  monthlyIndex: SEASONAL_DECOMPOSITION(monthly contract counts),
  weekdayIndex: AVG(contracts by day of week) / overall average × 100,
  holidayImpact: (holiday period demand / normal demand - 1) × 100,
  
  peakSeasons: IDENTIFY(months with index > 120),
  offPeakSeasons: IDENTIFY(months with index < 80),
  
  recommendations: {
    fleetSizing: OPTIMIZE(fleet by month, seasonalIndex),
    pricingStrategy: RECOMMEND(price adjustments by season)
  }
};
```

**Visual Components:**
- Seasonal index line chart
- Multi-year overlay comparison
- Peak period heatmap
- Demand forecast with seasonal adjustment

**Export Formats:**
- PDF (seasonal planning guide)
- Excel (seasonal indices table)

---

### 30. RECOMMENDED: Customer Satisfaction & NPS Report
**Recommended Priority:** MEDIUM  
**Business Value:** Service quality, customer retention

**Purpose:**  
Track customer satisfaction metrics including Net Promoter Score (NPS) to drive service improvements.

**Data Sources:**
- **Primary Tables:** `customerFeedback` (needs to be created), `contracts`, `customers`

**Key Metrics:**
1. **NPS Score:**
   - Promoters (9-10 rating): % of responses
   - Passives (7-8 rating): % of responses
   - Detractors (0-6 rating): % of responses
   - **NPS = % Promoters - % Detractors**

2. **Satisfaction Drivers:**
   - Vehicle condition
   - Staff service quality
   - Pricing fairness
   - Process efficiency

3. **Feedback Analysis:**
   - Common complaints
   - Improvement suggestions
   - Positive highlights

**Calculation:**
```javascript
npsMetrics = {
  promoters: COUNT(rating >= 9) / COUNT(all) × 100,
  passives: COUNT(rating 7-8) / COUNT(all) × 100,
  detractors: COUNT(rating <= 6) / COUNT(all) × 100,
  
  nps: promoters - detractors,
  
  satisfactionByCategory: {
    vehicleCondition: AVG(vehicle rating),
    staff: AVG(service rating),
    pricing: AVG(value rating),
    process: AVG(efficiency rating)
  },
  
  trendAnalysis: COMPARE(current NPS, previous period NPS)
};
```

**Visual Components:**
- NPS gauge chart
- Satisfaction category radar chart
- Feedback word cloud
- NPS trend over time

**Actions Required:**
- Implement customer feedback collection
- Add satisfaction survey to contract closure
- Enable post-rental email surveys

**Export Formats:**
- PDF (NPS summary report)
- Excel (feedback analysis)

---

### 31. RECOMMENDED: Competitor Benchmark Report
**Recommended Priority:** LOW  
**Business Value:** Market positioning, competitive strategy

**Purpose:**  
Compare KarāraOS performance against market competitors on key metrics.

**Data Sources:**
- **Internal:** All KarāraOS data
- **External:** Market research, competitor pricing (manual entry)

**Benchmark Metrics:**
1. **Pricing:**
   - Daily rates by category
   - Discount strategies
   - Ancillary fees

2. **Fleet Composition:**
   - Vehicle mix
   - Average vehicle age
   - Brand distribution

3. **Service Quality:**
   - Customer satisfaction
   - Digital experience
   - Service offerings

**Calculation:**
```javascript
competitiveBenchmark = {
  pricingIndex: ourPrice / marketAvgPrice × 100,
  marketShare: ourContracts / totalMarketContracts × 100,
  serviceGap: ourNPS - industryAvgNPS,
  
  competitivePosition: CLASSIFY([
    pricingIndex,
    marketShare,
    serviceGap,
    fleetQuality
  ])
};
```

**Visual Components:**
- Competitive positioning matrix
- Price comparison table
- Feature comparison grid
- Market share trend

**Export Formats:**
- PDF (competitive analysis)

---

### 32. RECOMMENDED: Sustainability & Environmental Report
**Recommended Priority:** LOW  
**Business Value:** ESG compliance, brand positioning

**Purpose:**  
Track environmental impact of fleet operations including fuel efficiency, emissions, and sustainability initiatives.

**Data Sources:**
- **Primary Tables:** `vehicles`, `contracts`
- **Vehicle Specs:** Fuel type, emissions rating

**Key Metrics:**
1. **Fleet Composition:**
   - % Electric vehicles
   - % Hybrid vehicles
   - % Conventional vehicles

2. **Environmental Impact:**
   - Estimated CO2 emissions
   - Fuel efficiency average
   - Miles per gallon equivalent

3. **Sustainability Goals:**
   - Progress toward EV targets
   - Emissions reduction trend
   - Green vehicle adoption rate

**Calculation:**
```javascript
sustainabilityMetrics = {
  fleetMix: {
    electric: COUNT(fuelType = 'electric') / COUNT(all) × 100,
    hybrid: COUNT(fuelType = 'hybrid') / COUNT(all) × 100,
    conventional: COUNT(fuelType != 'electric' && != 'hybrid') / COUNT(all) × 100
  },
  
  estimatedEmissions: SUM(
    contractDays × dailyMileageAvg × vehicleEmissionRate
  ),
  
  avgFuelEfficiency: WEIGHTED_AVG(vehicle.mpg, rental_days),
  
  sustainabilityScore: CALCULATE([
    fleetMix.electric × 1.0,
    fleetMix.hybrid × 0.5,
    avgFuelEfficiency × 0.3
  ])
};
```

**Visual Components:**
- Fleet composition pie chart
- Emissions trend line
- Sustainability score gauge
- EV adoption progress

**Export Formats:**
- PDF (ESG report)
- Excel (environmental metrics)

---

### 33. RECOMMENDED: SLA Compliance Report
**Recommended Priority:** MEDIUM  
**Business Value:** Service quality, process improvement

**Purpose:**  
Monitor compliance with internal SLAs for key processes including contract processing, vehicle delivery, and issue resolution.

**Data Sources:**
- **Primary Tables:** `contracts`, `driverAssignments`, `customerSupport` (to be created)

**SLA Metrics:**
1. **Contract Processing:**
   - Draft to Active: < 2 hours
   - Payment processing: < 1 hour
   - Contract modification: < 30 minutes

2. **Vehicle Operations:**
   - Delivery time: < 1 hour from scheduled
   - Return processing: < 30 minutes
   - Vehicle preparation: < 2 hours

3. **Customer Support:**
   - First response: < 15 minutes
   - Issue resolution: < 24 hours
   - Escalation handling: < 4 hours

**Calculation:**
```javascript
slaMetrics = {
  contractProcessing: {
    avgTime: AVG(activated_at - created_at),
    withinSLA: COUNT(time < 2 hours) / COUNT(all) × 100,
    breaches: COUNT(time >= 2 hours)
  },
  
  delivery: {
    avgDelay: AVG(actual_delivery - scheduled_delivery),
    onTimeRate: COUNT(delay <= 0) / COUNT(all) × 100
  },
  
  support: {
    avgFirstResponse: AVG(first_response - ticket_created),
    avgResolution: AVG(resolved - ticket_created),
    slaCompliance: COUNT(within_sla) / COUNT(all) × 100
  }
};
```

**Visual Components:**
- SLA compliance dashboard
- Breach analysis by type
- Trend over time
- Team/branch comparison

**Export Formats:**
- PDF (SLA performance report)
- Excel (breach details)

---

### 34. RECOMMENDED: Revenue Leakage Report
**Recommended Priority:** HIGH  
**Business Value:** Revenue recovery, process improvement

**Purpose:**  
Identify and quantify revenue loss due to process gaps, uncaptured charges, and billing errors.

**Data Sources:**
- **Primary Tables:** `contracts`, `payments`, `trafficFines`, `tollCharges`, `vehicleMaintenance`

**Leakage Sources:**
1. **Unbilled Charges:**
   - Extra kilometers not charged
   - Late return fees not applied
   - Damage charges not billed
   - Toll/fine charges not recovered

2. **Payment Gaps:**
   - Uncollected balances
   - Write-offs
   - Waived fees (without approval)

3. **System Errors:**
   - Calculation errors
   - Missing charges
   - Duplicate discounts

**Calculation:**
```javascript
revenueLeakage = {
  unbilledKm: SUM(
    (actual_odometer - expected_odometer) × extraKmRate
    WHERE actual > expected AND charge = 0
  ),
  
  unbilledLateFees: SUM(
    days_overdue × late_fee_per_day
    WHERE days_overdue > 0 AND late_fee_charged = 0
  ),
  
  unrecoveredFines: SUM(fine.amount WHERE fine.recovered = false),
  unrecoveredTolls: SUM(toll.amount WHERE toll.recovered = false),
  
  totalLeakage: SUM(all unbilled charges),
  leakageRate: totalLeakage / total_revenue × 100
};
```

**Visual Components:**
- Leakage by type pie chart
- Monthly leakage trend
- Branch leakage comparison
- Recovery opportunity ranking

**Recommended Actions:**
- Automated charge calculation
- Mandatory damage inspection
- Toll/fine auto-recovery
- Exception approval workflow

**Export Formats:**
- Excel (recovery action list)
- PDF (leakage summary)

---

### 35. RECOMMENDED: Staff Productivity Report
**Recommended Priority:** MEDIUM  
**Business Value:** Workforce optimization, training needs

**Purpose:**  
Measure staff productivity and efficiency across key metrics to optimize staffing levels and identify training needs.

**Data Sources:**
- **Primary Tables:** `users`, `contracts`, `payments`, `auditLogs`

**Productivity Metrics:**
1. **Contract Processing:**
   - Contracts processed per user
   - Average processing time
   - Error rate

2. **Customer Service:**
   - Customers served
   - Average service time
   - Customer satisfaction rating

3. **Financial Operations:**
   - Payments processed
   - Collection efficiency
   - Refund processing time

**Calculation:**
```javascript
staffProductivity = {
  contractsPerUser: COUNT(contracts) / COUNT(active_users),
  avgProcessingTime: AVG(contract processing duration by user),
  errorRate: COUNT(contracts with corrections) / COUNT(all) × 100,
  
  revenuePerUser: SUM(contract revenue) / COUNT(users),
  customersPerUser: COUNT(DISTINCT customers) / COUNT(users),
  
  performanceScore: WEIGHTED_AVG([
    contractsPerUser × 0.3,
    (1 - errorRate) × 0.3,
    revenuePerUser × 0.4
  ])
};
```

**Visual Components:**
- Staff performance ranking
- Productivity trend by user
- Team comparison
- Training needs heatmap

**Export Formats:**
- Excel (staff scorecard)
- PDF (productivity summary)

---

## REPORT INFRASTRUCTURE

### Universal Report Features

All reports in KarāraOS share common infrastructure components:

#### 1. Export Capabilities
**Formats Supported:**
- **CSV:** Raw data export with RFC 4180 compliance
  - Bilingual headers (EN/AR)
  - Configurable date formats
  - Automatic field encoding

- **PDF:** Professional formatted reports
  - Embedded charts (via html2canvas)
  - Multi-page support
  - Header/footer with branding
  - Landscape/portrait orientation

- **Excel:** Advanced spreadsheets
  - Multiple worksheets
  - Formatted cells
  - Chart embeddings
  - Formula support

**Export Functions:**
```javascript
// CSV Export
import { generateCSV, downloadCSV } from '@/utils/csvExport';

// PDF Export (with charts)
import { captureMultipleCharts } from '@/utils/chartExport';
const chartImages = await captureMultipleCharts([
  { elementId: 'chart-1', chartName: 'Revenue Trend' }
]);
```

#### 2. Filtering System
**Common Filters:**
- Date range picker (with presets)
- Branch selector (multi-select)
- Status filters
- Custom field filters

**Filter Implementation:**
```javascript
const { data } = useQuery({
  queryKey: ['/api/reports/financial', { startDate, endDate, branchId }],
  enabled: Boolean(startDate && endDate)
});
```

#### 3. Data Visualization
**Chart Types Used:**
- **Line Charts:** Trends over time (Recharts)
- **Bar Charts:** Comparisons (Recharts)
- **Pie Charts:** Distributions (Recharts)
- **Area Charts:** Cumulative trends (Recharts)
- **Scatter Plots:** Correlations (Recharts)
- **Heatmaps:** Intensity/frequency (Custom)

**Chart Configuration:**
```javascript
<LineChart data={trendData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="month" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="revenue" stroke="#0891b2" />
</LineChart>
```

#### 4. Performance Optimization
**Query Optimization:**
- Server-side aggregation
- Indexed database queries
- Result caching (TanStack Query)
- Pagination for large datasets

**Frontend Optimization:**
- Lazy loading components
- Virtual scrolling for tables
- Chart data sampling
- Debounced filters

#### 5. Access Control
**Permission Levels:**
- **Admin:** All reports access
- **Manager:** Most reports (exclude sensitive audit)
- **User:** Limited operational reports only

**Implementation:**
```javascript
const { isAdmin, isManager } = useAuth();

if (!isAdmin && !isManager) {
  return <AccessDenied />;
}
```

#### 6. Bilingual Support
**Translation Keys:**
All reports use i18next for bilingual labels:
```javascript
const { t, i18n } = useTranslation();

<CardTitle>{t('reports.revenue.title')}</CardTitle>
```

**RTL Support:**
- Auto-direction switching
- RTL-aware chart labels
- Mirrored layouts for Arabic

#### 7. Scheduling & Automation
**Report Scheduling (Recommended):**
- Daily/weekly/monthly automated reports
- Email delivery to stakeholders
- Saved filter configurations
- Report templates

**Implementation Needed:**
```javascript
// To be implemented
interface ScheduledReport {
  reportType: string;
  filters: Record<string, any>;
  schedule: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
}
```

---

## TECHNICAL SPECIFICATIONS

### Database Tables Used in Reports

| Table Name | Used By Reports | Key Fields |
|------------|----------------|------------|
| `contracts` | All financial, operational, customer reports | totalAmount, totalDays, status, rentalStartDate, rentalEndDate |
| `payments` | Financial, collection reports | amount, paymentDate, paymentMethod |
| `customers` | Customer analytics, risk reports | nameEn, nameAr, nationality, phone, email |
| `vehicles` | Fleet performance, utilization | registration, make, model, year, dailyRate, status |
| `drivers` | Driver reports | nameEn, type, dailyRate, assignedEmirate |
| `driverAssignments` | Driver utilization, revenue | startDateTime, endDateTime, status |
| `insuranceClaims` | Insurance reports | estimatedCost, actualCost, claimType, status |
| `vehicleMaintenance` | Maintenance, cost forecast | cost, maintenanceType, scheduledDate |
| `trafficFines` | Fine aging, revenue leakage | amount, fineDate, isPaid |
| `tollCharges` | Operational, revenue leakage | amount, tollDate, isPaid |
| `customerRiskScores` | Risk scoring, churn prediction | riskScore, riskCategory, calculatedDate |
| `auditLogs` | Access report, compliance | action, userId, timestamp, resourceType |
| `branches` | All reports (filtering) | nameEn, nameAr, code |

### API Endpoints

| Endpoint | Method | Purpose | Response |
|----------|--------|---------|----------|
| `/api/reports/financial` | GET | Financial dashboard data | FinancialReport object |
| `/api/analytics/revenue-trend` | GET | Revenue trends time series | Array<MonthlyRevenue> |
| `/api/analytics/fleet-performance` | GET | Fleet metrics | Array<VehiclePerformance> |
| `/api/customer-risk-scores` | GET | Risk scores list | Array<CustomerRiskScore> |
| `/api/reports/churn-prediction` | GET | Churn risk data | Array<ChurnPrediction> |
| `/api/reports/export` | POST | Generate exports | Blob (PDF/Excel) |

### Calculation Standards

All financial calculations follow these standards:

1. **Decimal Precision:** 2 decimal places for currency
2. **Rounding:** Standard rounding (0.5 rounds up)
3. **Date Calculations:** Inclusive of start date, exclusive of end date
4. **Percentage:** Multiply by 100, show 1-2 decimal places
5. **Currency Format:** `{amount} {currency}` (e.g., "1,250.00 AED")

---

**Document Status:** Complete  
**Coverage:** 23 existing reports + 12 recommended reports documented  
**Last Verified:** November 23, 2025  
**Maintainer:** KarāraOS Development Team
