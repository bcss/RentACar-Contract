/**
 * Test Documentation Page
 * A comprehensive UI for capturing manual testing with screenshots and remarks
 * Supports: Drag & drop, paste, browse file upload
 * Features: Full lifecycle view, HTML export with embedded images
 */
import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Upload,
  Image as ImageIcon,
  Clipboard,
  Trash2,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Clock,
  FolderOpen,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface TestSession {
  id: number;
  sessionName: string;
  description?: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  totalEntries: number;
  exportedAt?: string;
}

interface TestEntry {
  id: number;
  sessionId: number;
  orderIndex: number;
  subject: string;
  remarks?: string;
  status: string;
  screenshotData?: string;
  screenshotMimeType?: string;
  screenshotFileName?: string;
  createdAt: string;
  updatedAt: string;
}

interface SessionWithEntries extends TestSession {
  entries: TestEntry[];
}

export default function TestDocumentation() {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // State
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [newSessionName, setNewSessionName] = useState("");
  const [newSessionDescription, setNewSessionDescription] = useState("");
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
  const [showNewEntryDialog, setShowNewEntryDialog] = useState(false);
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set());
  
  // New entry form state
  const [entrySubject, setEntrySubject] = useState("");
  const [entryRemarks, setEntryRemarks] = useState("");
  const [entryStatus, setEntryStatus] = useState<string>("documented");
  const [entryScreenshot, setEntryScreenshot] = useState<string | null>(null);
  const [entryScreenshotName, setEntryScreenshotName] = useState<string>("");
  const [entryScreenshotMime, setEntryScreenshotMime] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Fetch all sessions
  const { data: sessions, isLoading: loadingSessions } = useQuery<TestSession[]>({
    queryKey: ["/api/test-documentation/sessions"],
  });

  // Fetch active session with entries
  const { data: activeSession, isLoading: loadingSession } = useQuery<SessionWithEntries>({
    queryKey: ["/api/test-documentation/sessions", activeSessionId],
    enabled: !!activeSessionId,
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: { sessionName: string; description?: string }) => {
      const res = await apiRequest("POST", "/api/test-documentation/sessions", data);
      return res.json() as Promise<TestSession>;
    },
    onSuccess: (data: TestSession) => {
      queryClient.invalidateQueries({ queryKey: ["/api/test-documentation/sessions"] });
      setActiveSessionId(data.id);
      setShowNewSessionDialog(false);
      setNewSessionName("");
      setNewSessionDescription("");
      toast({ title: "Session created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create session", variant: "destructive" });
    },
  });

  // Create entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (data: {
      subject: string;
      remarks?: string;
      status?: string;
      screenshotData?: string;
      screenshotMimeType?: string;
      screenshotFileName?: string;
    }) => {
      const res = await apiRequest("POST", `/api/test-documentation/sessions/${activeSessionId}/entries`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/test-documentation/sessions", activeSessionId] });
      queryClient.invalidateQueries({ queryKey: ["/api/test-documentation/sessions"] });
      resetEntryForm();
      setShowNewEntryDialog(false);
      toast({ title: "Test entry added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add test entry", variant: "destructive" });
    },
  });

  // Update session status mutation
  const updateSessionMutation = useMutation({
    mutationFn: async (data: { status: string }) => {
      const res = await apiRequest("PATCH", `/api/test-documentation/sessions/${activeSessionId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/test-documentation/sessions", activeSessionId] });
      queryClient.invalidateQueries({ queryKey: ["/api/test-documentation/sessions"] });
      toast({ title: "Session updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update session", variant: "destructive" });
    },
  });

  // Delete entry mutation
  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId: number) => {
      const res = await apiRequest("DELETE", `/api/test-documentation/entries/${entryId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/test-documentation/sessions", activeSessionId] });
      queryClient.invalidateQueries({ queryKey: ["/api/test-documentation/sessions"] });
      toast({ title: "Entry deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete entry", variant: "destructive" });
    },
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const res = await apiRequest("DELETE", `/api/test-documentation/sessions/${sessionId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/test-documentation/sessions"] });
      if (activeSessionId) {
        setActiveSessionId(null);
      }
      toast({ title: "Session deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete session", variant: "destructive" });
    },
  });

  const resetEntryForm = () => {
    setEntrySubject("");
    setEntryRemarks("");
    setEntryStatus("documented");
    setEntryScreenshot(null);
    setEntryScreenshotName("");
    setEntryScreenshotMime("");
  };

  // Handle file to base64
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      setEntryScreenshot(base64);
      setEntryScreenshotName(file.name);
      setEntryScreenshotMime(file.type);
    };
    reader.readAsDataURL(file);
  }, [toast]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!showNewEntryDialog) return;
      
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            handleFile(file);
            break;
          }
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [showNewEntryDialog, handleFile]);

  // Handle browse file
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  // Handle export
  const handleExport = async () => {
    if (!activeSessionId) return;

    try {
      const response = await fetch(`/api/test-documentation/sessions/${activeSessionId}/export`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `test-report-${activeSession?.sessionName.replace(/\s+/g, "-") || "session"}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      queryClient.invalidateQueries({ queryKey: ["/api/test-documentation/sessions", activeSessionId] });
      toast({ title: "Report exported successfully" });
    } catch {
      toast({ title: "Failed to export report", variant: "destructive" });
    }
  };

  const handleFinishSession = () => {
    updateSessionMutation.mutate({ status: "completed" });
  };

  const handleCreateEntry = () => {
    if (!entrySubject.trim()) {
      toast({ title: "Please enter a subject", variant: "destructive" });
      return;
    }

    createEntryMutation.mutate({
      subject: entrySubject,
      remarks: entryRemarks || undefined,
      status: entryStatus,
      screenshotData: entryScreenshot || undefined,
      screenshotMimeType: entryScreenshotMime || undefined,
      screenshotFileName: entryScreenshotName || undefined,
    });
  };

  const toggleEntryExpanded = (id: number) => {
    const newSet = new Set(expandedEntries);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedEntries(newSet);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "blocked":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      passed: "default",
      failed: "destructive",
      blocked: "secondary",
      documented: "outline",
    };
    return (
      <Badge variant={variants[status] || "outline"} className="uppercase text-xs">
        {status}
      </Badge>
    );
  };

  return (
    <div className="flex h-full">
      {/* Left Panel - Session List */}
      <div className="w-80 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold mb-3">Test Sessions</h2>
          <Dialog open={showNewSessionDialog} onOpenChange={setShowNewSessionDialog}>
            <DialogTrigger asChild>
              <Button className="w-full rounded-none" data-testid="button-new-session">
                <Plus className="w-4 h-4 mr-2" />
                New Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Test Session</DialogTitle>
                <DialogDescription>
                  Start a new testing session to document your manual testing workflow.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Session Name *</label>
                  <Input
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    placeholder="e.g., Contract Lifecycle Test"
                    data-testid="input-session-name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <Textarea
                    value={newSessionDescription}
                    onChange={(e) => setNewSessionDescription(e.target.value)}
                    placeholder="Describe what you're testing..."
                    rows={3}
                    data-testid="input-session-description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewSessionDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createSessionMutation.mutate({
                    sessionName: newSessionName,
                    description: newSessionDescription || undefined,
                  })}
                  disabled={!newSessionName.trim() || createSessionMutation.isPending}
                  data-testid="button-create-session"
                >
                  Create Session
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingSessions ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : sessions?.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No test sessions yet</p>
              <p className="text-sm">Create one to start documenting</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {sessions?.map((session) => (
                <Card
                  key={session.id}
                  className={`cursor-pointer transition-colors rounded-none ${
                    activeSessionId === session.id
                      ? "border-primary bg-primary/5"
                      : "hover-elevate"
                  }`}
                  onClick={() => setActiveSessionId(session.id)}
                  data-testid={`session-card-${session.id}`}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium text-sm truncate flex-1">{session.sessionName}</h3>
                      <Badge
                        variant={session.status === "completed" ? "default" : "secondary"}
                        className="text-xs ml-2"
                      >
                        {session.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(session.startedAt).toLocaleDateString()}</span>
                      <span className="ml-auto">{session.totalEntries} entries</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Active Session Details */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!activeSessionId ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Select a Session</h3>
              <p className="text-sm">Choose a test session from the left panel or create a new one</p>
            </div>
          </div>
        ) : loadingSession ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </div>
        ) : activeSession ? (
          <>
            {/* Session Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h1 className="text-xl font-semibold">{activeSession.sessionName}</h1>
                  {activeSession.description && (
                    <p className="text-sm text-muted-foreground mt-1">{activeSession.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {activeSession.status === "in_progress" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFinishSession}
                      className="rounded-none"
                      data-testid="button-finish-session"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Finish Session
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleExport}
                    className="rounded-none"
                    data-testid="button-export"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export HTML
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm("Delete this session and all its entries?")) {
                        deleteSessionMutation.mutate(activeSession.id);
                      }
                    }}
                    className="rounded-none"
                    data-testid="button-delete-session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{activeSession.status.toUpperCase()}</Badge>
                </div>
                <span className="text-muted-foreground">
                  Started: {new Date(activeSession.startedAt).toLocaleString()}
                </span>
                {activeSession.completedAt && (
                  <span className="text-muted-foreground">
                    Completed: {new Date(activeSession.completedAt).toLocaleString()}
                  </span>
                )}
                <span className="text-muted-foreground">
                  {activeSession.entries.length} entries
                </span>
              </div>
            </div>

            {/* Add Entry Button */}
            <div className="p-4 border-b border-border">
              <Dialog open={showNewEntryDialog} onOpenChange={(open) => {
                setShowNewEntryDialog(open);
                if (!open) resetEntryForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="rounded-none" data-testid="button-add-entry">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Test Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Test Entry</DialogTitle>
                    <DialogDescription>
                      Document a test step with remarks and optional screenshot
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Subject / Test Step *</label>
                      <Input
                        value={entrySubject}
                        onChange={(e) => setEntrySubject(e.target.value)}
                        placeholder="e.g., Login with valid credentials"
                        data-testid="input-entry-subject"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Status</label>
                      <Select value={entryStatus} onValueChange={setEntryStatus}>
                        <SelectTrigger data-testid="select-entry-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="documented">Documented</SelectItem>
                          <SelectItem value="passed">Passed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Remarks</label>
                      <Textarea
                        value={entryRemarks}
                        onChange={(e) => setEntryRemarks(e.target.value)}
                        placeholder="Describe what happened, observations, issues found..."
                        rows={4}
                        data-testid="input-entry-remarks"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Screenshot</label>
                      <div
                        ref={dropZoneRef}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-none p-6 text-center transition-colors ${
                          isDragOver
                            ? "border-primary bg-primary/5"
                            : entryScreenshot
                            ? "border-green-500 bg-green-500/5"
                            : "border-border"
                        }`}
                        data-testid="dropzone-screenshot"
                      >
                        {entryScreenshot ? (
                          <div className="space-y-3">
                            <img
                              src={`data:${entryScreenshotMime};base64,${entryScreenshot}`}
                              alt="Screenshot preview"
                              className="max-h-48 mx-auto border border-border rounded"
                            />
                            <p className="text-sm text-muted-foreground">{entryScreenshotName}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEntryScreenshot(null);
                                setEntryScreenshotName("");
                                setEntryScreenshotMime("");
                              }}
                              className="rounded-none"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex justify-center gap-4">
                              <div className="flex flex-col items-center">
                                <Upload className="w-8 h-8 mb-1 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Drag & Drop</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <Clipboard className="w-8 h-8 mb-1 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Ctrl+V Paste</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <ImageIcon className="w-8 h-8 mb-1 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Browse</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Drop an image, paste from clipboard, or click to browse
                            </p>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                              data-testid="input-file-screenshot"
                            />
                            <Button
                              variant="outline"
                              onClick={handleBrowseClick}
                              className="rounded-none"
                              data-testid="button-browse-file"
                            >
                              Browse Files
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewEntryDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateEntry}
                      disabled={!entrySubject.trim() || createEntryMutation.isPending}
                      data-testid="button-save-entry"
                    >
                      {createEntryMutation.isPending ? "Saving..." : "Save Entry"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Entries List - Full Lifecycle View */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeSession.entries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No test entries yet</p>
                  <p className="text-sm">Click "Add Test Entry" to start documenting</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeSession.entries.map((entry, index) => (
                    <Card key={entry.id} className="rounded-none" data-testid={`entry-card-${entry.id}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-semibold text-primary">#{index + 1}</span>
                            {getStatusIcon(entry.status)}
                            <CardTitle className="text-base">{entry.subject}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(entry.status)}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleEntryExpanded(entry.id)}
                              data-testid={`button-toggle-entry-${entry.id}`}
                            >
                              {expandedEntries.has(entry.id) ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm("Delete this entry?")) {
                                  deleteEntryMutation.mutate(entry.id);
                                }
                              }}
                              data-testid={`button-delete-entry-${entry.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription className="text-xs">
                          {new Date(entry.createdAt).toLocaleString()}
                        </CardDescription>
                      </CardHeader>
                      
                      {(expandedEntries.has(entry.id) || entry.screenshotData) && (
                        <CardContent className="pt-2">
                          {entry.remarks && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium mb-1">Remarks:</h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {entry.remarks}
                              </p>
                            </div>
                          )}
                          {entry.screenshotData && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Screenshot:</h4>
                              <img
                                src={`data:${entry.screenshotMimeType || "image/png"};base64,${entry.screenshotData}`}
                                alt={`Screenshot for ${entry.subject}`}
                                className="max-w-full border border-border rounded"
                              />
                              {entry.screenshotFileName && (
                                <p className="text-xs text-muted-foreground mt-1">{entry.screenshotFileName}</p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
