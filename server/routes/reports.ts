import express, { Request, Response } from "express";
import { ReportingService } from "../services/reportingService";
import {
  advancedReports,
  reportExecutions,
  reportSnapshots,
  reportExports,
  reportBookmarks,
  reportFavorites,
  reportSchedules
} from "../db";

export const reportsRouter = express.Router();

// RBAC Helper
function checkReportsPermission(permission: string) {
  return (req: Request, res: Response, next: express.NextFunction) => {
    const userRole = req.headers["x-user-role"] || "Enterprise Admin";
    if (userRole === "Enterprise Admin" || userRole === "Admin" || userRole === "AI Analytics Advisor") {
      return next();
    }

    const permitted: Record<string, string[]> = {
      "reports.read": ["AI Employee", "AI CEO", "Department Manager"],
      "reports.create": ["Department Manager"],
      "reports.execute": ["AI Employee", "AI CEO", "Department Manager"],
      "reports.export": ["AI Employee", "AI CEO", "Department Manager"],
      "reports.schedule": ["Department Manager"],
      "reports.admin": []
    };

    const rolesWithPermission = permitted[permission] || [];
    if (rolesWithPermission.includes(userRole as string)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied: Missing required permission '${permission}' for role '${userRole}'`
    });
  };
}

// 1. Create Designed Custom Report
reportsRouter.post("/", checkReportsPermission("reports.create"), (req: Request, res: Response) => {
  try {
    const { categoryId, title, description, type, layoutJson, sections } = req.body;
    if (!categoryId || !title || !description || !type) {
      return res.status(400).json({ success: false, message: "Missing required meta fields." });
    }

    const report = ReportingService.createCustomReport({
      categoryId: parseInt(categoryId),
      title,
      description,
      type,
      layoutJson: layoutJson || "{}",
      sections: sections || []
    });

    return res.status(201).json({ success: true, data: report });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 2. Query Reports
reportsRouter.get("/", checkReportsPermission("reports.read"), (req: Request, res: Response) => {
  const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
  const isCustom = req.query.isCustom === "true";

  let list = [...advancedReports];
  if (categoryId) list = list.filter(r => r.categoryId === categoryId);
  if (req.query.isCustom !== undefined) list = list.filter(r => r.isCustom === isCustom);

  return res.json({ success: true, count: list.length, data: list });
});

// 3. Execute Report
reportsRouter.post("/:id/execute", checkReportsPermission("reports.execute"), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { params } = req.body;
    const execution = await ReportingService.executeReport(id, "user_trigger", params || {});
    return res.json({ success: true, data: execution });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 4. Export Executed Output
reportsRouter.post("/executions/:id/export", checkReportsPermission("reports.export"), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { format } = req.body;
    if (!format) return res.status(400).json({ success: false, message: "Required export format is missing." });

    const exp = await ReportingService.exportExecutedReport(id, format);
    return res.json({ success: true, data: exp });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 5. Bookmark Custom Params
reportsRouter.post("/:id/bookmark", checkReportsPermission("reports.read"), (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { name, paramsJson } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Bookmark name is required." });

    const bk = ReportingService.bookmarkReport(id, 1, name, paramsJson || "{}");
    return res.status(201).json({ success: true, data: bk });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 6. Toggle Favorites Status
reportsRouter.post("/:id/favorite", checkReportsPermission("reports.read"), (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = ReportingService.toggleFavorite(id, 1);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 7. Schedule Delivery
reportsRouter.post("/:id/schedule", checkReportsPermission("reports.schedule"), (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { frequency, cron } = req.body;
    if (!frequency) return res.status(400).json({ success: false, message: "Schedule frequency is required." });

    const sched = ReportingService.createSchedule(id, frequency, cron);
    return res.json({ success: true, data: sched });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 8. Translate Natural Language Report Prompt
reportsRouter.post("/interpret", checkReportsPermission("reports.read"), (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: "Natural language prompt is required." });

    const result = ReportingService.interpretNaturalLanguageReport(prompt);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 9. Get Executions list
reportsRouter.get("/:id/executions", checkReportsPermission("reports.read"), (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const execs = reportExecutions.filter(e => e.reportId === id);
  return res.json({ success: true, data: execs });
});

// 10. Get Snapshots list
reportsRouter.get("/:id/snapshots", checkReportsPermission("reports.read"), (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const snaps = reportSnapshots.filter(s => s.reportId === id);
  return res.json({ success: true, data: snaps });
});
