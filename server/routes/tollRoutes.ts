/**
 * Toll & Traffic Routes Module
 * UAE toll systems (Salik, Darb), toll gates, passes, traffic fines, incidents
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { isAuthenticated, requireManagerOrAdmin, requireAdmin } from "../auth/localAuth";
import type { User } from "@shared/schema";
import { createAuditLog } from "../utils/routeHelpers";

const router = Router();

// ==================== TOLL SYSTEMS ====================

router.get("/systems", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      emirate: req.query.emirate as string | undefined,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
    };
    const systems = await storage.getTollSystems(filters);
    res.json(systems);
  } catch (error) {
    next(error);
  }
});

router.get("/systems/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const system = await storage.getTollSystemById(req.params.id);
    if (!system) {
      return res.status(404).json({ message: "Toll system not found" });
    }
    res.json(system);
  } catch (error) {
    next(error);
  }
});

router.post("/systems", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const system = await storage.createTollSystem({ ...req.body, createdBy: user.id });
    await createAuditLog(user.id, 'toll_system_created', undefined, req, `Created toll system: ${system.systemName}`);
    res.status(201).json(system);
  } catch (error) {
    next(error);
  }
});

router.patch("/systems/:id", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const system = await storage.updateTollSystem(req.params.id, req.body);
    await createAuditLog(user.id, 'toll_system_updated', undefined, req, `Updated toll system: ${system.systemName}`);
    res.json(system);
  } catch (error) {
    next(error);
  }
});

router.delete("/systems/:id", isAuthenticated, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    await storage.deleteTollSystem(req.params.id);
    await createAuditLog(user.id, 'toll_system_deleted', undefined, req, `Deleted toll system`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ==================== TOLL GATES ====================

router.get("/gates", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      tollSystemId: req.query.tollSystemId as string | undefined,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
    };
    const gates = await storage.getTollGates(filters);
    res.json(gates);
  } catch (error) {
    next(error);
  }
});

router.get("/gates/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gate = await storage.getTollGateById(req.params.id);
    if (!gate) {
      return res.status(404).json({ message: "Toll gate not found" });
    }
    res.json(gate);
  } catch (error) {
    next(error);
  }
});

router.post("/gates", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const gate = await storage.createTollGate({ ...req.body, createdBy: user.id });
    await createAuditLog(user.id, 'toll_gate_created', undefined, req, `Created toll gate: ${gate.gateName}`);
    res.status(201).json(gate);
  } catch (error) {
    next(error);
  }
});

router.patch("/gates/:id", isAuthenticated, requireManagerOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const gate = await storage.updateTollGate(req.params.id, req.body);
    await createAuditLog(user.id, 'toll_gate_updated', undefined, req, `Updated toll gate: ${gate.gateName}`);
    res.json(gate);
  } catch (error) {
    next(error);
  }
});

router.delete("/gates/:id", isAuthenticated, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    await storage.deleteTollGate(req.params.id);
    await createAuditLog(user.id, 'toll_gate_deleted', undefined, req, `Deleted toll gate`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ==================== TOLL PASSES ====================

router.get("/passes", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      vehicleId: req.query.vehicleId as string | undefined,
      contractId: req.query.contractId as string | undefined,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    };
    const passes = await storage.getTollPasses(filters);
    res.json(passes);
  } catch (error) {
    next(error);
  }
});

router.get("/passes/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pass = await storage.getTollPassById(req.params.id);
    if (!pass) {
      return res.status(404).json({ message: "Toll pass not found" });
    }
    res.json(pass);
  } catch (error) {
    next(error);
  }
});

router.post("/passes", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const pass = await storage.createTollPass({ ...req.body, createdBy: user.id });
    await createAuditLog(user.id, 'toll_pass_created', pass.contractId, req, `Created toll pass`);
    res.status(201).json(pass);
  } catch (error) {
    next(error);
  }
});

router.patch("/passes/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const pass = await storage.updateTollPass(req.params.id, req.body);
    await createAuditLog(user.id, 'toll_pass_updated', pass.contractId, req, `Updated toll pass`);
    res.json(pass);
  } catch (error) {
    next(error);
  }
});

router.delete("/passes/:id", isAuthenticated, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const pass = await storage.getTollPassById(req.params.id);
    if (pass) {
      await storage.deleteTollPass(req.params.id);
      await createAuditLog(user.id, 'toll_pass_deleted', pass.contractId, req, `Deleted toll pass`);
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ==================== TRAFFIC FINES ====================

router.get("/traffic-fines", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      vehicleId: req.query.vehicleId as string | undefined,
      contractId: req.query.contractId as string | undefined,
      status: req.query.status as string | undefined,
    };
    const fines = await storage.getTrafficFines(filters);
    res.json(fines);
  } catch (error) {
    next(error);
  }
});

router.get("/traffic-fines/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fine = await storage.getTrafficFineById(req.params.id);
    if (!fine) {
      return res.status(404).json({ message: "Traffic fine not found" });
    }
    res.json(fine);
  } catch (error) {
    next(error);
  }
});

router.post("/traffic-fines", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const fine = await storage.createTrafficFine({ ...req.body, createdBy: user.id });
    await createAuditLog(user.id, 'traffic_fine_created', fine.contractId, req, `Created traffic fine`);
    res.status(201).json(fine);
  } catch (error) {
    next(error);
  }
});

router.patch("/traffic-fines/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const fine = await storage.updateTrafficFine(req.params.id, req.body);
    await createAuditLog(user.id, 'traffic_fine_updated', fine.contractId, req, `Updated traffic fine`);
    res.json(fine);
  } catch (error) {
    next(error);
  }
});

router.delete("/traffic-fines/:id", isAuthenticated, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const fine = await storage.getTrafficFineById(req.params.id);
    if (fine) {
      await storage.deleteTrafficFine(req.params.id);
      await createAuditLog(user.id, 'traffic_fine_deleted', fine.contractId, req, `Deleted traffic fine`);
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ==================== INCIDENTS ====================

router.get("/incidents", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      vehicleId: req.query.vehicleId as string | undefined,
      contractId: req.query.contractId as string | undefined,
      status: req.query.status as string | undefined,
    };
    const incidents = await storage.getIncidents(filters);
    res.json(incidents);
  } catch (error) {
    next(error);
  }
});

router.get("/incidents/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const incident = await storage.getIncidentById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }
    res.json(incident);
  } catch (error) {
    next(error);
  }
});

router.post("/incidents", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const incident = await storage.createIncident({ ...req.body, createdBy: user.id });
    await createAuditLog(user.id, 'incident_created', incident.contractId, req, `Created incident: ${incident.incidentType}`);
    res.status(201).json(incident);
  } catch (error) {
    next(error);
  }
});

router.patch("/incidents/:id", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const incident = await storage.updateIncident(req.params.id, req.body);
    await createAuditLog(user.id, 'incident_updated', incident.contractId, req, `Updated incident`);
    res.json(incident);
  } catch (error) {
    next(error);
  }
});

router.delete("/incidents/:id", isAuthenticated, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as User;
    const incident = await storage.getIncidentById(req.params.id);
    if (incident) {
      await storage.deleteIncident(req.params.id);
      await createAuditLog(user.id, 'incident_deleted', incident.contractId, req, `Deleted incident`);
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
