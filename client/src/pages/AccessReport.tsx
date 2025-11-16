import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Icon } from "@/components/Icon";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

type AccessLog = {
  id: string;
  outcome: 'success' | 'failure';
  username: string;
  userId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  country: string | null;
  city: string | null;
  failureReason: string | null;
  createdAt: string;
};

type AccessLogsResponse = {
  logs: AccessLog[];
  total: number;
};

export default function AccessReport() {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // Filter states
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all");
  const [usernameFilter, setUsernameFilter] = useState<string>("");
  const [ipAddressFilter, setIpAddressFilter] = useState<string>("");
  const [countryFilter, setCountryFilter] = useState<string>("");
  
  // Pagination
  const [page, setPage] = useState(1);
  const limit = 50;
  
  // Build query params for API call
  const buildQueryParams = () => {
    const params: Record<string, string> = {
      limit: limit.toString(),
      offset: ((page - 1) * limit).toString(),
    };
    
    if (startDate) params.startDate = new Date(startDate).toISOString();
    if (endDate) params.endDate = new Date(endDate).toISOString();
    if (outcomeFilter !== 'all') params.outcome = outcomeFilter;
    if (usernameFilter) params.username = usernameFilter;
    if (ipAddressFilter) params.ipAddress = ipAddressFilter;
    if (countryFilter) params.country = countryFilter;
    
    return params;
  };

  // Fetch access logs using default fetcher
  const params = buildQueryParams();
  const queryString = new URLSearchParams(params).toString();
  const { data, isLoading } = useQuery<AccessLogsResponse>({
    queryKey: [`/api/access-logs?${queryString}`],
  });

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [startDate, endDate, outcomeFilter, usernameFilter, ipAddressFilter, countryFilter]);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setOutcomeFilter("all");
    setUsernameFilter("");
    setIpAddressFilter("");
    setCountryFilter("");
    setPage(1);
  };

  const handleExportExcel = () => {
    if (!data || data.logs.length === 0) {
      toast({
        title: t('common.error'),
        description: 'No data to export',
        variant: 'destructive',
      });
      return;
    }

    try {
      const exportData = data.logs.map(log => ({
        'Date & Time': format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        'Outcome': log.outcome,
        'Username': log.username,
        'IP Address': log.ipAddress || '-',
        'Country': log.country || '-',
        'City': log.city || '-',
        'User Agent': log.userAgent || '-',
        'Failure Reason': log.failureReason || '-',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Access Logs');
      
      // Auto-size columns
      const maxWidth = 50;
      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.min(
          maxWidth,
          Math.max(
            key.length,
            ...exportData.map(row => String(row[key as keyof typeof row]).length)
          )
        )
      }));
      worksheet['!cols'] = colWidths;

      XLSX.writeFile(workbook, `access-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      
      toast({
        title: t('common.success'),
        description: 'Report exported successfully',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to export report',
        variant: 'destructive',
      });
    }
  };

  const getOutcomeBadge = (outcome: string) => {
    if (outcome === 'success') {
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-600 text-white" data-testid={`badge-outcome-${outcome}`}>
          <Icon name="check_circle" className="mr-1 text-sm" />
          Success
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-red-600 hover:bg-red-600 text-white" data-testid={`badge-outcome-${outcome}`}>
        <Icon name="cancel" className="mr-1 text-sm" />
        Failed
      </Badge>
    );
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-access-report-title">
            App Access Report
          </h1>
          <p className="text-muted-foreground mt-1">
            Track all login attempts with IP geolocation
          </p>
        </div>
        <Button
          onClick={handleExportExcel}
          disabled={!data || data.logs.length === 0}
          data-testid="button-export-excel"
        >
          <Icon name="download" className="mr-2" />
          Export Excel
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="filter_list" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium block">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                data-testid="input-start-date"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium block">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                data-testid="input-end-date"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium block">Outcome</label>
              <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                <SelectTrigger data-testid="select-outcome-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium block">Username</label>
              <Input
                placeholder="Filter by username"
                value={usernameFilter}
                onChange={(e) => setUsernameFilter(e.target.value)}
                data-testid="input-username-filter"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium block">IP Address</label>
              <Input
                placeholder="Filter by IP"
                value={ipAddressFilter}
                onChange={(e) => setIpAddressFilter(e.target.value)}
                data-testid="input-ip-filter"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium block">Country</label>
              <Input
                placeholder="Filter by country"
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                data-testid="input-country-filter"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={clearFilters}
              data-testid="button-clear-filters"
            >
              <Icon name="clear" className="mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Access Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Access Logs</span>
            <span className="text-sm font-normal text-muted-foreground">
              {data && `${data.total} total records`}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">{t('common.loading')}</div>
          ) : !data || data.logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No access logs found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Failure Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.logs.map((log) => (
                      <TableRow key={log.id} data-testid={`row-access-log-${log.id}`}>
                        <TableCell className="font-mono text-sm" data-testid={`cell-created-at-${log.id}`}>
                          {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                        </TableCell>
                        <TableCell data-testid={`cell-outcome-${log.id}`}>{getOutcomeBadge(log.outcome)}</TableCell>
                        <TableCell className="font-medium" data-testid={`cell-username-${log.id}`}>{log.username}</TableCell>
                        <TableCell className="font-mono text-sm" data-testid={`cell-ip-${log.id}`}>
                          {log.ipAddress || '-'}
                        </TableCell>
                        <TableCell data-testid={`cell-country-${log.id}`}>
                          {log.country ? (
                            <Badge variant="outline" data-testid={`badge-country-${log.id}`}>
                              {log.country}
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground" data-testid={`cell-city-${log.id}`}>
                          {log.city || '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate" data-testid={`cell-failure-reason-${log.id}`}>
                          {log.failureReason || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      data-testid="button-prev-page"
                    >
                      <Icon name="chevron_left" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      data-testid="button-next-page"
                    >
                      Next
                      <Icon name="chevron_right" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
