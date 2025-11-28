import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { MaterialSymbol } from "@/components/MaterialSymbol";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { DateSelector } from "@/components/ui/date-selector";
import { useErrorDisplay } from "@/components/design-system";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  insertDriverScheduleSchema, 
  insertDriverAttendanceSchema,
  type DriverSchedule,
  type DriverAttendance,
  type InsertDriverSchedule,
  type InsertDriverAttendance
} from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, differenceInHours } from "date-fns";

export default function DriverScheduling() {
  const { t } = useTranslation();
  const { showError, showSuccess } = useErrorDisplay();
  const [activeTab, setActiveTab] = useState("schedules");
  
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<DriverSchedule | null>(null);
  
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<DriverAttendance | null>(null);

  const { data: schedules = [], isLoading: schedulesLoading } = useQuery<DriverSchedule[]>({
    queryKey: ["/api/driver-schedules"],
  });

  const { data: attendance = [], isLoading: attendanceLoading } = useQuery<DriverAttendance[]>({
    queryKey: ["/api/driver-attendance"],
  });

  const { data: drivers = [] } = useQuery<any[]>({
    queryKey: ["/api/drivers"],
  });

  const { data: branches = [] } = useQuery<any[]>({
    queryKey: ["/api/branches"],
  });

  const { data: vehicles = [] } = useQuery<any[]>({
    queryKey: ["/api/vehicles"],
  });

  const scheduleForm = useForm<InsertDriverSchedule>({
    resolver: zodResolver(insertDriverScheduleSchema),
    defaultValues: {
      driverId: "",
      scheduleDate: new Date(),
      shiftStart: new Date(),
      shiftEnd: new Date(),
      breakDuration: 60,
      branchId: "",
      vehicleAssigned: undefined,
      taskType: "rental_driver",
      status: "scheduled",
      notes: "",
    },
  });

  const attendanceForm = useForm<InsertDriverAttendance>({
    resolver: zodResolver(insertDriverAttendanceSchema),
    defaultValues: {
      driverId: "",
      scheduleId: undefined,
      checkIn: new Date(),
      checkOut: undefined,
      hoursWorked: undefined,
      overtimeHours: "0",
      location: "",
      notes: "",
    },
  });

  const createScheduleMutation = useMutation({
    mutationFn: (data: InsertDriverSchedule) => apiRequest("POST", "/api/driver-schedules", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver-schedules"] });
      showSuccess(t("success"), "Driver schedule created successfully");
      setScheduleDialogOpen(false);
      scheduleForm.reset();
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  const updateScheduleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertDriverSchedule> }) =>
      apiRequest("PATCH", `/api/driver-schedules/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver-schedules"] });
      showSuccess(t("success"), "Driver schedule updated successfully");
      setScheduleDialogOpen(false);
      setEditingSchedule(null);
      scheduleForm.reset();
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  const createAttendanceMutation = useMutation({
    mutationFn: (data: InsertDriverAttendance) => apiRequest("POST", "/api/driver-attendance", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver-attendance"] });
      showSuccess(t("success"), "Attendance record created successfully");
      setAttendanceDialogOpen(false);
      attendanceForm.reset();
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  const updateAttendanceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertDriverAttendance> }) =>
      apiRequest("PATCH", `/api/driver-attendance/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver-attendance"] });
      showSuccess(t("success"), "Attendance record updated successfully");
      setAttendanceDialogOpen(false);
      setEditingAttendance(null);
      attendanceForm.reset();
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  const checkoutMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/driver-attendance/${id}/checkout`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver-attendance"] });
      showSuccess(t("success"), "Driver checked out successfully");
    },
    onError: (error: Error) => showError(error, t("error")),
  });

  const handleCreateSchedule = () => {
    setEditingSchedule(null);
    scheduleForm.reset({
      driverId: "",
      scheduleDate: new Date(),
      shiftStart: new Date(),
      shiftEnd: new Date(),
      breakDuration: 60,
      branchId: "",
      vehicleAssigned: undefined,
      taskType: "rental_driver",
      status: "scheduled",
      notes: "",
    });
    setScheduleDialogOpen(true);
  };

  const handleEditSchedule = (schedule: DriverSchedule) => {
    setEditingSchedule(schedule);
    scheduleForm.reset({
      driverId: schedule.driverId,
      scheduleDate: schedule.scheduleDate,
      shiftStart: schedule.shiftStart,
      shiftEnd: schedule.shiftEnd,
      breakDuration: schedule.breakDuration || 60,
      branchId: schedule.branchId || "",
      vehicleAssigned: schedule.vehicleAssigned || undefined,
      taskType: schedule.taskType as any,
      status: schedule.status as any,
      notes: schedule.notes || "",
    });
    setScheduleDialogOpen(true);
  };

  const handleCreateAttendance = () => {
    setEditingAttendance(null);
    attendanceForm.reset({
      driverId: "",
      scheduleId: undefined,
      checkIn: new Date(),
      checkOut: undefined,
      hoursWorked: undefined,
      overtimeHours: "0",
      location: "",
      notes: "",
    });
    setAttendanceDialogOpen(true);
  };

  const handleEditAttendance = (record: DriverAttendance) => {
    setEditingAttendance(record);
    attendanceForm.reset({
      driverId: record.driverId,
      scheduleId: record.scheduleId || undefined,
      checkIn: record.checkIn,
      checkOut: record.checkOut || undefined,
      hoursWorked: record.hoursWorked || undefined,
      overtimeHours: record.overtimeHours || "0",
      location: record.location || "",
      notes: record.notes || "",
    });
    setAttendanceDialogOpen(true);
  };

  const handleCheckout = (id: string) => {
    checkoutMutation.mutate(id);
  };

  const onSubmitSchedule = (data: InsertDriverSchedule) => {
    if (editingSchedule) {
      updateScheduleMutation.mutate({ id: editingSchedule.id, data });
    } else {
      createScheduleMutation.mutate(data);
    }
  };

  const onSubmitAttendance = (data: InsertDriverAttendance) => {
    if (editingAttendance) {
      updateAttendanceMutation.mutate({ id: editingAttendance.id, data });
    } else {
      createAttendanceMutation.mutate(data);
    }
  };

  const getDriverName = (driverId: string) => {
    return drivers.find(d => d.id === driverId)?.nameEn || "N/A";
  };

  const getBranchName = (branchId: string) => {
    return branches.find(b => b.id === branchId)?.nameEn || "N/A";
  };

  const safeFormatDate = (dateValue: string | Date | null | undefined, formatStr: string) => {
    if (!dateValue) return "—";
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return "—";
      return format(date, formatStr);
    } catch {
      return "—";
    }
  };

  const getScheduleText = (scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return "N/A";
    return `${safeFormatDate(schedule.scheduleDate, "PP")} - ${getDriverName(schedule.driverId)}`;
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "scheduled":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  const totalHoursWorked = attendance.reduce((sum, record) => {
    return sum + parseFloat(record.hoursWorked || "0");
  }, 0);

  const totalOvertime = attendance.reduce((sum, record) => {
    return sum + parseFloat(record.overtimeHours || "0");
  }, 0);

  const attendanceRate = schedules.length > 0 
    ? ((attendance.length / schedules.length) * 100).toFixed(1)
    : "0";

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Driver Scheduling & Attendance
          </h1>
          <p className="text-muted-foreground mt-1">Manage driver schedules and track attendance</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schedules" data-testid="tab-schedules" className="gap-2">
            <MaterialSymbol name="event" size="sm" />
            Driver Schedules
          </TabsTrigger>
          <TabsTrigger value="attendance" data-testid="tab-attendance" className="gap-2">
            <MaterialSymbol name="schedule" size="sm" />
            Attendance Records
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleCreateSchedule} className="gap-2" data-testid="button-create-schedule">
              <MaterialSymbol name="add_circle" size="sm" />
              Add Schedule
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MaterialSymbol name="groups" size="md" className="text-primary" />
                Driver Schedules
              </CardTitle>
            </CardHeader>
            <CardContent>
              {schedulesLoading ? (
                <div className="flex justify-center py-12">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MaterialSymbol name="progress_activity" className="animate-spin" />
                    Loading...
                  </div>
                </div>
              ) : schedules.length === 0 ? (
                <div className="p-12 text-center">
                  <MaterialSymbol name="event" size="2xl" className="text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No schedules found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Shift Date</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Break (min)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((schedule) => (
                      <TableRow key={schedule.id} data-testid={`table-row-schedule-${schedule.id}`}>
                        <TableCell className="font-medium">{getDriverName(schedule.driverId)}</TableCell>
                        <TableCell>{getBranchName(schedule.branchId || "")}</TableCell>
                        <TableCell>{safeFormatDate(schedule.scheduleDate, "PP")}</TableCell>
                        <TableCell>{safeFormatDate(schedule.shiftStart, "p")}</TableCell>
                        <TableCell>{safeFormatDate(schedule.shiftEnd, "p")}</TableCell>
                        <TableCell>{schedule.breakDuration || 0}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(schedule.status)}>
                            {schedule.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditSchedule(schedule)}
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            data-testid={`button-edit-schedule-${schedule.id}`}
                          >
                            <MaterialSymbol name="edit" size="sm" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Hours Worked</CardTitle>
                <MaterialSymbol name="schedule" size="sm" className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalHoursWorked.toFixed(1)} hrs</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Overtime</CardTitle>
                <MaterialSymbol name="more_time" size="sm" className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOvertime.toFixed(1)} hrs</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                <MaterialSymbol name="check_circle" size="sm" className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attendanceRate}%</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleCreateAttendance} className="gap-2" data-testid="button-create-attendance">
              <MaterialSymbol name="add_circle" size="sm" />
              Add Attendance
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MaterialSymbol name="schedule" size="md" className="text-primary" />
                Attendance Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attendanceLoading ? (
                <div className="flex justify-center py-12">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MaterialSymbol name="progress_activity" className="animate-spin" />
                    Loading...
                  </div>
                </div>
              ) : attendance.length === 0 ? (
                <div className="p-12 text-center">
                  <MaterialSymbol name="schedule" size="2xl" className="text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No attendance records found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Check-In Time</TableHead>
                      <TableHead>Check-Out Time</TableHead>
                      <TableHead>Hours Worked</TableHead>
                      <TableHead>Overtime</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.map((record) => (
                      <TableRow key={record.id} data-testid={`table-row-attendance-${record.id}`}>
                        <TableCell className="font-medium">{getDriverName(record.driverId)}</TableCell>
                        <TableCell>{getScheduleText(record.scheduleId || "")}</TableCell>
                        <TableCell>{safeFormatDate(record.checkIn, "PPp")}</TableCell>
                        <TableCell>
                          {safeFormatDate(record.checkOut, "PPp")}
                        </TableCell>
                        <TableCell>{record.hoursWorked || "—"}</TableCell>
                        <TableCell>{record.overtimeHours || "0"}</TableCell>
                        <TableCell>{record.location || "—"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditAttendance(record)}
                              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                              data-testid={`button-edit-attendance-${record.id}`}
                            >
                              <MaterialSymbol name="edit" size="sm" />
                            </Button>
                            {!record.checkOut && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCheckout(record.id)}
                                data-testid={`button-checkout-${record.id}`}
                              >
                                Check Out
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSchedule ? "Edit Schedule" : "Create Schedule"}</DialogTitle>
          </DialogHeader>
          <Form {...scheduleForm}>
            <form onSubmit={scheduleForm.handleSubmit(onSubmitSchedule)} className="space-y-4">
              <FormField
                control={scheduleForm.control}
                name="driverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Driver</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-driverId">
                          <SelectValue placeholder="Select driver" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {drivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={scheduleForm.control}
                name="branchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-branchId">
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={scheduleForm.control}
                  name="scheduleDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift Date *</FormLabel>
                      <FormControl>
                        <DateSelector
                          value={field.value}
                          onChange={field.onChange}
                          data-testid="input-scheduleDate"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={scheduleForm.control}
                  name="breakDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Break Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? 60}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          data-testid="input-breakDuration"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={scheduleForm.control}
                  name="shiftStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift Start Time</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ""}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                          data-testid="input-shiftStart"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={scheduleForm.control}
                  name="shiftEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift End Time</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ""}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                          data-testid="input-shiftEnd"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={scheduleForm.control}
                name="vehicleAssigned"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Vehicle (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-vehicleAssigned">
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.registration} - {vehicle.make} {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={scheduleForm.control}
                name="taskType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-taskType">
                          <SelectValue placeholder="Select task type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="rental_driver">Rental Driver</SelectItem>
                        <SelectItem value="delivery">Delivery</SelectItem>
                        <SelectItem value="standby">Standby</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={scheduleForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={scheduleForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} data-testid="input-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-submit-schedule">
                  {editingSchedule ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={attendanceDialogOpen} onOpenChange={setAttendanceDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAttendance ? "Edit Attendance" : "Create Attendance"}</DialogTitle>
          </DialogHeader>
          <Form {...attendanceForm}>
            <form onSubmit={attendanceForm.handleSubmit(onSubmitAttendance)} className="space-y-4">
              <FormField
                control={attendanceForm.control}
                name="scheduleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-scheduleId">
                          <SelectValue placeholder="Select schedule" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {schedules
                          .filter(s => s.status === "confirmed" || s.status === "in_progress")
                          .map((schedule) => (
                            <SelectItem key={schedule.id} value={schedule.id}>
                              {getScheduleText(schedule.id)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={attendanceForm.control}
                name="driverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Driver</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-driverId-attendance">
                          <SelectValue placeholder="Select driver" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {drivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={attendanceForm.control}
                  name="checkIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-In Time</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ""}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                          data-testid="input-checkIn"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={attendanceForm.control}
                  name="checkOut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-Out Time (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ""}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          data-testid="input-checkOut"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={attendanceForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} data-testid="input-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={attendanceForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} data-testid="input-notes-attendance" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setAttendanceDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-submit-attendance">
                  {editingAttendance ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
