import { useEffect, useState } from "react";
import { syncService } from "../services/syncService";
import type { SyncStatusSnapshot } from "../types";

export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatusSnapshot>(syncService.getSyncStatus());

  useEffect(() => {
    const unsubscribe = syncService.subscribe(setStatus);
    return () => {
      unsubscribe();
    };
  }, []);

  return status;
}
