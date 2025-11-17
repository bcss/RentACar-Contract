import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Calendar, Clock, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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

  const getScheduleText = (scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return "N/A";
    return `${format(new Date(schedule.scheduleDate), "PP")} - ${getDriverName(schedule.driverId)}`;
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
          <TabsTrigger value="schedules" data-testid="tab-schedules">
            <Calendar className="w-4 h-4 mr-2" />
            Driver Schedules
          </TabsTrigger>
          <TabsTrigger value="attendance" data-testid="tab-attendance">
            <Clock className="w-4 h-4 mr-2" />
            Attendance Records
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleCreateSchedule} data-testid="button-create-schedule">
              <Plus className="w-4 h-4 mr-2" />
              Add Schedule
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Driver Schedules
              </CardTitle>
            </CardHeader>
            <CardContent>
              {schedulesLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : schedules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No schedules found</p>
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
                        <TableCell>{format(new Date(schedule.scheduleDate), "PP")}</TableCell>
                        <TableCell>{format(new Date(schedule.shiftStart), "p")}</TableCell>
                        <TableCell>{format(new Date(schedule.shiftEnd), "p")}</TableCell>
                        <TableCell>{schedule.breakDuration || 0}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(schedule.status)}>
                            {schedule.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditSchedule(schedule)}
                            data-testid={`button-edit-schedule-${schedule.id}`}
                          >
                            <Edit className="w-4 h-4" />
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
                <Clock className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalHoursWorked.toFixed(1)} hrs</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Overtime</CardTitle>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOvertime.toFixed(1)} hrs</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                <CheckCircle className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attendanceRate}%</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleCreateAttendance} data-testid="button-create-attendance">
              <Plus className="w-4 h-4 mr-2" />
              Add Attendance
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Attendance Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attendanceLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : attendance.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No attendance records found</p>
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
                        <TableCell>{format(new Date(record.checkIn), "PPp")}</TableCell>
                        <TableCell>
                          {record.checkOut ? format(new Date(record.checkOut), "PPp") : "—"}
                        </TableCell>
                        <TableCell>{record.hoursWorked || "—"}</TableCell>
                        <TableCell>{record.overtimeHours || "0"}</TableCell>
                        <TableCell>{record.location || "—"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditAttendance(record)}
                              data-testid={`button-edit-attendance-${record.id}`}
                            >
                              <Edit className="w-4 h-4" />
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
                      <FormLabel>Shift Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
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
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
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
