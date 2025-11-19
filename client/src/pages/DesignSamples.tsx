import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, FileText, Car, Users, Bell, CheckCircle, AlertCircle, XCircle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DesignSamples() {
  const { t } = useTranslation();

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto" data-testid="page-design-samples">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold" data-testid="text-design-samples-title">
          {t("designSamples.title")}
        </h1>
        <p className="text-muted-foreground" data-testid="text-design-samples-subtitle">
          {t("designSamples.subtitle")}
        </p>
      </div>

      <Tabs defaultValue="dashboards" className="w-full" data-testid="tabs-design-samples">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboards" data-testid="tab-dashboards">
            {t("designSamples.dashboards")}
          </TabsTrigger>
          <TabsTrigger value="forms" data-testid="tab-forms">
            {t("designSamples.forms")}
          </TabsTrigger>
          <TabsTrigger value="tables" data-testid="tab-tables">
            {t("designSamples.tables")}
          </TabsTrigger>
          <TabsTrigger value="cards" data-testid="tab-cards">
            {t("designSamples.cards")}
          </TabsTrigger>
          <TabsTrigger value="components" data-testid="tab-components">
            {t("designSamples.components")}
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Samples */}
        <TabsContent value="dashboards" className="space-y-6" data-testid="content-dashboards">
          <h2 className="text-2xl font-semibold" data-testid="heading-dashboard-layouts">
            {t("designSamples.dashboardLayouts")}
          </h2>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium" data-testid="heading-executive-dashboard">
              {t("designSamples.executiveDashboard")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="hover-elevate" data-testid="card-metric-revenue">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("designSamples.totalRevenue")}</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-revenue-value">AED 245,680</div>
                  <p className="text-xs text-muted-foreground" data-testid="text-revenue-growth">
                    {t("designSamples.vsLastMonth")}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-metric-contracts">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("designSamples.activeContracts")}</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-contracts-value">142</div>
                  <p className="text-xs text-muted-foreground" data-testid="text-contracts-growth">
                    {t("designSamples.activeContractsGrowth")}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-metric-utilization">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("designSamples.fleetUtilization")}</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-utilization-value">87%</div>
                  <Progress value={87} className="mt-2" data-testid="progress-utilization" />
                  <p className="text-xs text-muted-foreground mt-2" data-testid="text-utilization-desc">
                    {t("designSamples.fleetUtilizationValue")}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-metric-satisfaction">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("designSamples.customerSatisfaction")}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-satisfaction-value">4.8/5</div>
                  <p className="text-xs text-muted-foreground" data-testid="text-satisfaction-desc">
                    {t("designSamples.customerSatisfactionValue")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Form Samples */}
        <TabsContent value="forms" className="space-y-6" data-testid="content-forms">
          <h2 className="text-2xl font-semibold" data-testid="heading-form-layouts">
            {t("designSamples.formLayouts")}
          </h2>
          
          <Card data-testid="card-customer-registration-form">
            <CardHeader>
              <CardTitle data-testid="heading-customer-registration">
                {t("designSamples.customerRegistration")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" data-testid="label-full-name">
                    {t("designSamples.fullName")}
                  </Label>
                  <Input 
                    id="fullName" 
                    placeholder={t("designSamples.fullNamePlaceholder")}
                    data-testid="input-full-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" data-testid="label-email">
                    {t("designSamples.emailAddress")}
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder={t("designSamples.emailPlaceholder")}
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" data-testid="label-phone">
                    {t("designSamples.phoneNumber")}
                  </Label>
                  <Input 
                    id="phone" 
                    placeholder={t("designSamples.phonePlaceholder")}
                    data-testid="input-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality" data-testid="label-nationality">
                    {t("designSamples.nationality")}
                  </Label>
                  <Select>
                    <SelectTrigger id="nationality" data-testid="select-nationality">
                      <SelectValue placeholder={t("designSamples.selectNationality")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uae" data-testid="option-uae">
                        {t("designSamples.uae")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full md:w-auto" data-testid="button-register-customer">
                {t("designSamples.registerCustomer")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Table Samples */}
        <TabsContent value="tables" className="space-y-6" data-testid="content-tables">
          <h2 className="text-2xl font-semibold" data-testid="heading-table-layouts">
            {t("designSamples.dataTableLayouts")}
          </h2>
          
          <Card data-testid="card-contracts-table">
            <CardHeader>
              <CardTitle data-testid="heading-contracts-table">
                {t("designSamples.activeContractsTable")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead data-testid="header-contract-id">{t("designSamples.contractId")}</TableHead>
                    <TableHead data-testid="header-customer">{t("designSamples.customer")}</TableHead>
                    <TableHead data-testid="header-vehicle">{t("designSamples.vehicle")}</TableHead>
                    <TableHead data-testid="header-amount">{t("designSamples.amount")}</TableHead>
                    <TableHead data-testid="header-status">{t("designSamples.status")}</TableHead>
                    <TableHead data-testid="header-actions">{t("designSamples.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow data-testid="row-contract-1">
                    <TableCell data-testid="cell-contract-id-1">RC-2024-001</TableCell>
                    <TableCell data-testid="cell-customer-1">Ahmed Ali</TableCell>
                    <TableCell data-testid="cell-vehicle-1">{t("designSamples.toyotaCamry")}</TableCell>
                    <TableCell data-testid="cell-amount-1">AED 3,500</TableCell>
                    <TableCell data-testid="cell-status-1">
                      <Badge variant="default" data-testid="badge-active">
                        {t("designSamples.active")}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid="cell-actions-1">
                      <Button variant="ghost" size="sm" data-testid="button-view-details-1">
                        {t("designSamples.viewDetails")}
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow data-testid="row-contract-2">
                    <TableCell data-testid="cell-contract-id-2">RC-2024-002</TableCell>
                    <TableCell data-testid="cell-customer-2">Sara Mohammed</TableCell>
                    <TableCell data-testid="cell-vehicle-2">{t("designSamples.nissanAltima")}</TableCell>
                    <TableCell data-testid="cell-amount-2">AED 2,800</TableCell>
                    <TableCell data-testid="cell-status-2">
                      <Badge variant="default" data-testid="badge-active-2">
                        {t("designSamples.active")}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid="cell-actions-2">
                      <Button variant="ghost" size="sm" data-testid="button-view-details-2">
                        {t("designSamples.viewDetails")}
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Card Samples */}
        <TabsContent value="cards" className="space-y-6" data-testid="content-cards">
          <h2 className="text-2xl font-semibold" data-testid="heading-card-components">
            {t("designSamples.cardComponents")}
          </h2>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium" data-testid="heading-notification-cards">
              {t("designSamples.notificationCards")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-l-4 border-l-green-500 hover-elevate" data-testid="card-notification-payment">
                <CardHeader className="flex flex-row items-start gap-4">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <CardTitle className="text-base" data-testid="heading-payment-received">
                      {t("designSamples.paymentReceived")}
                    </CardTitle>
                    <CardDescription data-testid="text-payment-received-desc">
                      {t("designSamples.paymentReceivedDesc")}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-l-4 border-l-yellow-500 hover-elevate" data-testid="card-notification-maintenance">
                <CardHeader className="flex flex-row items-start gap-4">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div className="flex-1">
                    <CardTitle className="text-base" data-testid="heading-maintenance-due">
                      {t("designSamples.maintenanceDue")}
                    </CardTitle>
                    <CardDescription data-testid="text-maintenance-due-desc">
                      {t("designSamples.maintenanceDueDesc")}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-l-4 border-l-red-500 hover-elevate" data-testid="card-notification-overdue">
                <CardHeader className="flex flex-row items-start gap-4">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <CardTitle className="text-base" data-testid="heading-payment-overdue">
                      {t("designSamples.paymentOverdue")}
                    </CardTitle>
                    <CardDescription data-testid="text-payment-overdue-desc">
                      {t("designSamples.paymentOverdueDesc")}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-l-4 border-l-blue-500 hover-elevate" data-testid="card-notification-booking">
                <CardHeader className="flex flex-row items-start gap-4">
                  <Bell className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <CardTitle className="text-base" data-testid="heading-new-booking">
                      {t("designSamples.newBookingRequest")}
                    </CardTitle>
                    <CardDescription data-testid="text-new-booking-desc">
                      {t("designSamples.newBookingDesc")}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium" data-testid="heading-customer-profiles">
              {t("designSamples.customerProfiles")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="hover-elevate" data-testid="card-customer-premium">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar data-testid="avatar-premium-customer">
                    <AvatarFallback className="bg-primary text-primary-foreground">AM</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base" data-testid="text-premium-customer-name">Ahmed Mohammed</CardTitle>
                    <CardDescription data-testid="text-premium-customer-type">
                      {t("designSamples.premiumCustomer")}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm" data-testid="info-total-rentals">
                    <span className="text-muted-foreground">{t("designSamples.totalRentals")}</span>
                    <span className="font-medium">24</span>
                  </div>
                  <div className="flex justify-between text-sm" data-testid="info-lifetime-value">
                    <span className="text-muted-foreground">{t("designSamples.lifetimeValue")}</span>
                    <span className="font-medium">AED 82,400</span>
                  </div>
                  <div className="flex justify-between text-sm" data-testid="info-risk-score">
                    <span className="text-muted-foreground">{t("designSamples.riskScore")}</span>
                    <Badge variant="default" size="sm" data-testid="badge-risk-low">
                      {t("designSamples.lowRisk")}
                    </Badge>
                  </div>
                  <Button variant="outline" className="w-full mt-4" data-testid="button-view-profile-premium">
                    {t("designSamples.viewProfile")}
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-customer-regular">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar data-testid="avatar-regular-customer">
                    <AvatarFallback>SM</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base" data-testid="text-regular-customer-name">Sara Mohammed</CardTitle>
                    <CardDescription data-testid="text-regular-customer-type">
                      {t("designSamples.regularCustomer")}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("designSamples.totalRentals")}</span>
                    <span className="font-medium">8</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("designSamples.lifetimeValue")}</span>
                    <span className="font-medium">AED 24,500</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("designSamples.riskScore")}</span>
                    <Badge variant="secondary" size="sm" data-testid="badge-risk-medium">
                      {t("designSamples.mediumRisk")}
                    </Badge>
                  </div>
                  <Button variant="outline" className="w-full mt-4" data-testid="button-view-profile-regular">
                    {t("designSamples.viewProfile")}
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-customer-new">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar data-testid="avatar-new-customer">
                    <AvatarFallback>FA</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base" data-testid="text-new-customer-name">Fatima Ali</CardTitle>
                    <CardDescription data-testid="text-new-customer-type">
                      {t("designSamples.newCustomer")}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("designSamples.totalRentals")}</span>
                    <span className="font-medium">1</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("designSamples.lifetimeValue")}</span>
                    <span className="font-medium">AED 3,200</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("designSamples.riskScore")}</span>
                    <Badge variant="secondary" size="sm" data-testid="badge-risk-medium-2">
                      {t("designSamples.mediumRisk")}
                    </Badge>
                  </div>
                  <Button variant="outline" className="w-full mt-4" data-testid="button-view-profile-new">
                    {t("designSamples.viewProfile")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Component Library */}
        <TabsContent value="components" className="space-y-6" data-testid="content-components">
          <h2 className="text-2xl font-semibold" data-testid="heading-component-library">
            {t("designSamples.componentLibrary")}
          </h2>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium" data-testid="heading-buttons">
              {t("designSamples.buttons")}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button data-testid="button-primary">
                {t("designSamples.primaryButton")}
              </Button>
              <Button variant="secondary" data-testid="button-secondary">
                {t("designSamples.secondaryButton")}
              </Button>
              <Button variant="outline" data-testid="button-outline">
                {t("designSamples.outlineButton")}
              </Button>
              <Button variant="ghost" data-testid="button-ghost">
                {t("designSamples.ghostButton")}
              </Button>
              <Button variant="destructive" data-testid="button-destructive">
                {t("designSamples.destructiveButton")}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium" data-testid="heading-badges">
              {t("designSamples.badges")}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default" data-testid="badge-confirmed">
                {t("designSamples.confirmed")}
              </Badge>
              <Badge variant="secondary" data-testid="badge-pending">
                {t("designSamples.pending")}
              </Badge>
              <Badge variant="default" data-testid="badge-completed">
                <CheckCircle className="w-3 h-3 mr-1" />
                {t("designSamples.completed")}
              </Badge>
              <Badge variant="destructive" data-testid="badge-cancelled">
                {t("designSamples.cancelled")}
              </Badge>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
