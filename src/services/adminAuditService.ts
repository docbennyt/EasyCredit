import { db } from "./db";
import { getCurrentTimestamp } from "../lib/dates";
import type { AdminAuditLog } from "../types";
import { generateId } from "../lib/ids";
import { supabase } from "../lib/supabaseClient";

export async function logAdminAction(input: {
  adminUserId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const entry: AdminAuditLog = {
    id: generateId(),
    adminUserId: input.adminUserId,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    metadata: input.metadata,
    createdAt: getCurrentTimestamp(),
  };

  await db.adminAuditLogs.add(entry);

  if (supabase) {
    const { error } = await supabase.from("admin_audit_logs").insert({
      id: entry.id,
      admin_user_id: entry.adminUserId,
      action: entry.action,
      target_type: entry.targetType ?? null,
      target_id: entry.targetId ?? null,
      metadata: entry.metadata ?? null,
      created_at: entry.createdAt,
    });

    if (error) {
      console.warn("Admin audit log sync failed:", error.message);
    }
  }
}

export async function getRecentAdminAuditLogs(limit = 20): Promise<AdminAuditLog[]> {
  return db.adminAuditLogs.orderBy("createdAt").reverse().limit(limit).toArray();
}
