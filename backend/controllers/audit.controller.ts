import { Request, Response } from "express";
import AuditLog from "../models/audit_log.model";
import User from "../models/user.model";
import { Op, fn, col } from "sequelize";

const AUDIT_COLUMNS = [
  "log_id",
  "user_id",
  "action",
  "ip_address",
  "target_table",
  "target_id",
  "timestamp",
];

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      target_table,
      user_id,
      start_date,
      end_date,
      ip_address
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};

    if (action) {
      whereClause.action = { [Op.like]: `%${action}%` };
    }

    if (target_table) {
      whereClause.target_table = { [Op.like]: `%${target_table}%` };
    }

    if (user_id) {
      whereClause.user_id = Number(user_id);
    }

    if (ip_address) {
      whereClause.ip_address = { [Op.like]: `%${ip_address}%` };
    }

    if (start_date || end_date) {
      whereClause.timestamp = {};
      if (start_date) {
        whereClause.timestamp[Op.gte] = new Date(start_date as string);
      }
      if (end_date) {
        whereClause.timestamp[Op.lte] = new Date(end_date as string);
      }
    }

    const { count, rows: logs } = await AuditLog.findAndCountAll({
      where: whereClause,
      attributes: AUDIT_COLUMNS, // force only existing columns
      order: [["timestamp", "DESC"]],
      limit: Number(limit),
      offset,
    });

    const logsWithUsers = await Promise.all(
      logs.map(async (log) => {
        const user = log.getDataValue("user_id")
          ? await User.findByPk(log.getDataValue("user_id"), {
              attributes: ["full_name", "email"],
            })
          : null;

        return {
          ...log.toJSON(),
          User: user
            ? {
                full_name: user.getDataValue("full_name"),
                email: user.getDataValue("email"),
              }
            : null,
        };
      })
    );

    const totalPages = Math.ceil(count / Number(limit));

    res.json({
      logs: logsWithUsers,
      pagination: {
        current_page: Number(page),
        total_pages: totalPages,
        total_records: count,
        records_per_page: Number(limit),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching audit logs:", error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
};

export const getAuditLogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const log = await AuditLog.findByPk(id, {
      attributes: AUDIT_COLUMNS, // force only existing columns
    });

    if (!log) {
      return res.status(404).json({ error: "Audit log not found" });
    }

    const user = log.getDataValue("user_id")
      ? await User.findByPk(log.getDataValue("user_id"), {
          attributes: ["full_name", "email"],
        })
      : null;

    const logWithUser = {
      ...log.toJSON(),
      User: user
        ? { full_name: user.getDataValue("full_name"), email: user.getDataValue("email") }
        : null,
    };

    res.json(logWithUser);
  } catch (error) {
    console.error("❌ Error fetching audit log:", error);
    res.status(500).json({ error: "Failed to fetch audit log" });
  }
};

export const getAuditStats = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;

    const whereClause: any = {};
    if (start_date || end_date) {
      whereClause.timestamp = {};
      if (start_date) {
        whereClause.timestamp[Op.gte] = new Date(start_date as string);
      }
      if (end_date) {
        whereClause.timestamp[Op.lte] = new Date(end_date as string);
      }
    }

    const actionStats = await AuditLog.findAll({
      where: whereClause,
      attributes: ["action", [fn("COUNT", col("log_id")), "count"]],
      group: ["action"],
      order: [[fn("COUNT", col("log_id")), "DESC"]],
      limit: 10,
    });

    const tableStats = await AuditLog.findAll({
      where: whereClause,
      attributes: ["target_table", [fn("COUNT", col("log_id")), "count"]],
      group: ["target_table"],
      order: [[fn("COUNT", col("log_id")), "DESC"]],
    });

    const userStats = await AuditLog.findAll({
      where: whereClause,
      attributes: ["user_id", [fn("COUNT", col("log_id")), "count"]],
      group: ["user_id"],
      order: [[fn("COUNT", col("log_id")), "DESC"]],
      limit: 10,
    });

    const userStatsWithUsers = await Promise.all(
      userStats.map(async (stat) => {
        const user = stat.getDataValue("user_id")
          ? await User.findByPk(stat.getDataValue("user_id"), {
              attributes: ["full_name", "email"],
            })
          : null;

        return {
          user_id: stat.getDataValue("user_id"),
          count: stat.getDataValue("count"),
          User: user
            ? {
                full_name: user.getDataValue("full_name"),
                email: user.getDataValue("email"),
              }
            : null,
        };
      })
    );

    const recentActivity = await AuditLog.count({
      where: {
        timestamp: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    res.json({
      action_stats: actionStats,
      table_stats: tableStats,
      user_stats: userStatsWithUsers,
      recent_activity: recentActivity,
    });
  } catch (error) {
    console.error("❌ Error fetching audit stats:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    res.status(500).json({ error: "Failed to fetch audit statistics", details: error });
  }
};

export const exportAuditLogs = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date, format = "csv" } = req.query;

    const whereClause: any = {};
    if (start_date || end_date) {
      whereClause.timestamp = {};
      if (start_date) {
        whereClause.timestamp[Op.gte] = new Date(start_date as string);
      }
      if (end_date) {
        whereClause.timestamp[Op.lte] = new Date(end_date as string);
      }
    }

    const logs = await AuditLog.findAll({
      where: whereClause,
      attributes: AUDIT_COLUMNS, // force only existing columns
      order: [["timestamp", "DESC"]],
    });

    if (format === "csv") {
      const csvHeaders = "Timestamp,User,Action,Target Table,Target ID,IP Address\n";
      const userMap = new Map<number, { full_name: string; email: string }>();

      // lazy-load user names
      for (const log of logs) {
        const uid = log.getDataValue("user_id");
        if (uid && !userMap.has(uid)) {
          const user = await User.findByPk(uid, { attributes: ["full_name", "email"] });
          if (user) userMap.set(uid, { full_name: user.getDataValue("full_name"), email: user.getDataValue("email") });
        }
      }

      const csvData = logs
        .map((log: any) => {
          const usr = userMap.get(log.user_id);
          return `${log.timestamp},${usr?.full_name || "Unknown"},${log.action},${log.target_table},${log.target_id || ""},${log.ip_address}`;
        })
        .join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=audit-logs.csv");
      res.send(csvHeaders + csvData);
    } else {
      res.json(logs);
    }
  } catch (error) {
    console.error("❌ Error exporting audit logs:", error);
    res.status(500).json({ error: "Failed to export audit logs" });
  }
};