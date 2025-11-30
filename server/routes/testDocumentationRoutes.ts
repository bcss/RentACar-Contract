/**
 * Test Documentation Routes
 * API routes for managing testing sessions and entries with screenshot support
 */
import { Router } from "express";
import { db } from "../db";
import { testSessions, testEntries } from "@shared/schema";
import { eq, desc, asc } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// ===========================
// Test Sessions
// ===========================

// Get all test sessions
router.get("/sessions", async (req, res) => {
  try {
    const sessions = await db
      .select()
      .from(testSessions)
      .orderBy(desc(testSessions.startedAt));
    res.json(sessions);
  } catch (error) {
    console.error("Error fetching test sessions:", error);
    res.status(500).json({ message: "Failed to fetch test sessions" });
  }
});

// Get single test session with entries
router.get("/sessions/:id", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    if (isNaN(sessionId)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    const [session] = await db
      .select()
      .from(testSessions)
      .where(eq(testSessions.id, sessionId));

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const entries = await db
      .select()
      .from(testEntries)
      .where(eq(testEntries.sessionId, sessionId))
      .orderBy(asc(testEntries.orderIndex));

    res.json({ ...session, entries });
  } catch (error) {
    console.error("Error fetching test session:", error);
    res.status(500).json({ message: "Failed to fetch test session" });
  }
});

// Create new test session
router.post("/sessions", async (req, res) => {
  try {
    const schema = z.object({
      sessionName: z.string().min(1),
      description: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const userId = (req as any).user?.id || null;

    const [session] = await db
      .insert(testSessions)
      .values({
        sessionName: data.sessionName,
        description: data.description,
        createdBy: userId,
        status: "in_progress",
      })
      .returning();

    res.status(201).json(session);
  } catch (error) {
    console.error("Error creating test session:", error);
    res.status(500).json({ message: "Failed to create test session" });
  }
});

// Update test session status
router.patch("/sessions/:id", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    if (isNaN(sessionId)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    const schema = z.object({
      status: z.enum(["in_progress", "completed", "exported"]).optional(),
      sessionName: z.string().optional(),
      description: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const updateData: any = { ...data };

    if (data.status === "completed") {
      updateData.completedAt = new Date();
    } else if (data.status === "exported") {
      updateData.exportedAt = new Date();
    }

    const [session] = await db
      .update(testSessions)
      .set(updateData)
      .where(eq(testSessions.id, sessionId))
      .returning();

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    console.error("Error updating test session:", error);
    res.status(500).json({ message: "Failed to update test session" });
  }
});

// Delete test session
router.delete("/sessions/:id", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    if (isNaN(sessionId)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    await db.delete(testSessions).where(eq(testSessions.id, sessionId));
    res.json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Error deleting test session:", error);
    res.status(500).json({ message: "Failed to delete test session" });
  }
});

// ===========================
// Test Entries
// ===========================

// Add entry to session
router.post("/sessions/:id/entries", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    if (isNaN(sessionId)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    const schema = z.object({
      subject: z.string().min(1),
      remarks: z.string().optional(),
      status: z.enum(["documented", "passed", "failed", "blocked"]).optional(),
      screenshotData: z.string().optional(), // Base64 encoded
      screenshotMimeType: z.string().optional(),
      screenshotFileName: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Get current max order index for this session
    const existingEntries = await db
      .select({ orderIndex: testEntries.orderIndex })
      .from(testEntries)
      .where(eq(testEntries.sessionId, sessionId))
      .orderBy(desc(testEntries.orderIndex))
      .limit(1);

    const nextOrderIndex = existingEntries.length > 0 
      ? existingEntries[0].orderIndex + 1 
      : 1;

    const [entry] = await db
      .insert(testEntries)
      .values({
        sessionId,
        orderIndex: nextOrderIndex,
        subject: data.subject,
        remarks: data.remarks,
        status: data.status || "documented",
        screenshotData: data.screenshotData,
        screenshotMimeType: data.screenshotMimeType,
        screenshotFileName: data.screenshotFileName,
      })
      .returning();

    // Update session entry count
    await db
      .update(testSessions)
      .set({ totalEntries: nextOrderIndex })
      .where(eq(testSessions.id, sessionId));

    res.status(201).json(entry);
  } catch (error) {
    console.error("Error creating test entry:", error);
    res.status(500).json({ message: "Failed to create test entry" });
  }
});

// Update entry
router.patch("/entries/:id", async (req, res) => {
  try {
    const entryId = parseInt(req.params.id);
    if (isNaN(entryId)) {
      return res.status(400).json({ message: "Invalid entry ID" });
    }

    const schema = z.object({
      subject: z.string().optional(),
      remarks: z.string().optional(),
      status: z.enum(["documented", "passed", "failed", "blocked"]).optional(),
      screenshotData: z.string().optional(),
      screenshotMimeType: z.string().optional(),
      screenshotFileName: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const [entry] = await db
      .update(testEntries)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(testEntries.id, entryId))
      .returning();

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.json(entry);
  } catch (error) {
    console.error("Error updating test entry:", error);
    res.status(500).json({ message: "Failed to update test entry" });
  }
});

// Delete entry
router.delete("/entries/:id", async (req, res) => {
  try {
    const entryId = parseInt(req.params.id);
    if (isNaN(entryId)) {
      return res.status(400).json({ message: "Invalid entry ID" });
    }

    // Get the entry's session before deleting
    const [entry] = await db
      .select()
      .from(testEntries)
      .where(eq(testEntries.id, entryId));

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    await db.delete(testEntries).where(eq(testEntries.id, entryId));

    // Update session entry count
    const remainingEntries = await db
      .select()
      .from(testEntries)
      .where(eq(testEntries.sessionId, entry.sessionId));

    await db
      .update(testSessions)
      .set({ totalEntries: remainingEntries.length })
      .where(eq(testSessions.id, entry.sessionId));

    res.json({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting test entry:", error);
    res.status(500).json({ message: "Failed to delete test entry" });
  }
});

// ===========================
// Export
// ===========================

// Generate HTML export for session
router.get("/sessions/:id/export", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    if (isNaN(sessionId)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    const [session] = await db
      .select()
      .from(testSessions)
      .where(eq(testSessions.id, sessionId));

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const entries = await db
      .select()
      .from(testEntries)
      .where(eq(testEntries.sessionId, sessionId))
      .orderBy(asc(testEntries.orderIndex));

    // Generate HTML with embedded screenshots
    const html = generateExportHtml(session, entries);

    // Update session as exported
    await db
      .update(testSessions)
      .set({
        status: "exported",
        exportedAt: new Date(),
        exportFileName: `test-report-${session.sessionName.replace(/\s+/g, "-")}-${Date.now()}.html`,
      })
      .where(eq(testSessions.id, sessionId));

    res.setHeader("Content-Type", "text/html");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="test-report-${session.sessionName.replace(/\s+/g, "-")}.html"`
    );
    res.send(html);
  } catch (error) {
    console.error("Error exporting test session:", error);
    res.status(500).json({ message: "Failed to export test session" });
  }
});

// Helper function to generate HTML export
function generateExportHtml(session: any, entries: any[]): string {
  const statusColors: Record<string, string> = {
    documented: "#6b7280",
    passed: "#22c55e",
    failed: "#ef4444",
    blocked: "#f97316",
  };

  const entriesHtml = entries
    .map(
      (entry, index) => `
    <div class="entry" style="margin-bottom: 2rem; padding: 1.5rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid ${statusColors[entry.status] || "#6b7280"};">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 style="margin: 0; color: #101922; font-size: 1.125rem;">
          <span style="color: #137fec; font-weight: 600;">#${index + 1}</span> ${escapeHtml(entry.subject)}
        </h3>
        <span style="padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.875rem; font-weight: 500; background: ${statusColors[entry.status]}20; color: ${statusColors[entry.status]};">
          ${entry.status.toUpperCase()}
        </span>
      </div>
      ${entry.remarks ? `<div style="margin-bottom: 1rem; color: #4b5563; line-height: 1.6;">${escapeHtml(entry.remarks)}</div>` : ""}
      ${
        entry.screenshotData
          ? `<div style="margin-top: 1rem;">
              <img src="data:${entry.screenshotMimeType || "image/png"};base64,${entry.screenshotData}" 
                   alt="Screenshot for ${escapeHtml(entry.subject)}"
                   style="max-width: 100%; border: 1px solid #e5e7eb; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" />
              ${entry.screenshotFileName ? `<p style="margin-top: 0.5rem; font-size: 0.75rem; color: #6b7280;">${escapeHtml(entry.screenshotFileName)}</p>` : ""}
            </div>`
          : ""
      }
      <div style="margin-top: 1rem; font-size: 0.75rem; color: #9ca3af;">
        Created: ${new Date(entry.createdAt).toLocaleString()}
      </div>
    </div>
  `
    )
    .join("");

  const statusSummary = {
    total: entries.length,
    passed: entries.filter((e) => e.status === "passed").length,
    failed: entries.filter((e) => e.status === "failed").length,
    blocked: entries.filter((e) => e.status === "blocked").length,
    documented: entries.filter((e) => e.status === "documented").length,
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Report - ${escapeHtml(session.sessionName)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.5;
      color: #101922;
      background: #ffffff;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 3rem;
      padding-bottom: 2rem;
      border-bottom: 2px solid #e5e7eb;
    }
    .header h1 {
      color: #137fec;
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    .header p {
      color: #6b7280;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      margin-bottom: 3rem;
    }
    .summary-card {
      padding: 1rem;
      background: #f6f7f8;
      border-radius: 8px;
      text-align: center;
    }
    .summary-card .number {
      font-size: 2rem;
      font-weight: 700;
    }
    .summary-card .label {
      font-size: 0.875rem;
      color: #6b7280;
    }
    .entries { margin-top: 2rem; }
    .footer {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 0.875rem;
    }
    @media print {
      body { padding: 1rem; }
      .entry { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(session.sessionName)}</h1>
    ${session.description ? `<p style="margin-top: 0.5rem;">${escapeHtml(session.description)}</p>` : ""}
    <p style="margin-top: 1rem; font-size: 0.875rem;">
      Started: ${new Date(session.startedAt).toLocaleString()}
      ${session.completedAt ? ` | Completed: ${new Date(session.completedAt).toLocaleString()}` : ""}
    </p>
  </div>

  <div class="summary">
    <div class="summary-card">
      <div class="number" style="color: #137fec;">${statusSummary.total}</div>
      <div class="label">Total Tests</div>
    </div>
    <div class="summary-card">
      <div class="number" style="color: #22c55e;">${statusSummary.passed}</div>
      <div class="label">Passed</div>
    </div>
    <div class="summary-card">
      <div class="number" style="color: #ef4444;">${statusSummary.failed}</div>
      <div class="label">Failed</div>
    </div>
    <div class="summary-card">
      <div class="number" style="color: #f97316;">${statusSummary.blocked}</div>
      <div class="label">Blocked</div>
    </div>
    <div class="summary-card">
      <div class="number" style="color: #6b7280;">${statusSummary.documented}</div>
      <div class="label">Documented</div>
    </div>
  </div>

  <h2 style="margin-bottom: 1.5rem; color: #101922;">Test Entries</h2>
  <div class="entries">
    ${entriesHtml || '<p style="color: #6b7280; text-align: center;">No test entries recorded.</p>'}
  </div>

  <div class="footer">
    <p>Generated by KarāraOS Testing Documentation Tool</p>
    <p>Export Date: ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
  `;
}

function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default router;
