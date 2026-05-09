export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const random = Math.random().toString(16).slice(2).padEnd(12, "0");
  return `${Date.now().toString(16)}-${random.slice(0, 4)}-${random.slice(4, 8)}-${random.slice(8, 12)}`;
}
