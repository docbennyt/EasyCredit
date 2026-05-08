import { db } from "./db";
import { getCurrentTimestamp } from "../lib/dates";
import type { AppErrorLog } from "../types";
import { generateId } from "../lib/ids";

export async function logAppError(
  severity: AppErrorLog["severity"],
  message: string,
  metadata?: Record<string, unknown>,
  userId?: string
): Promise<void> {
  try {
    await db.appErrorLogs.add({
      id: generateId(),
      userId,
      severity,
      message,
      metadata,
      createdAt: getCurrentTimestamp(),
    });
  } catch (error) {
    console.error("Failed to persist app error log:", error);
  }
}

export async function getRecentAppErrors(limit = 10): Promise<AppErrorLog[]> {
  return db.appErrorLogs.orderBy("createdAt").reverse().limit(limit).toArray();
}
