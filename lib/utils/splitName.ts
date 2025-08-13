export function splitName(full: string): { first_name: string; last_name: string | null } {
  const trimmed = full.trim();
  if (!trimmed) return { first_name: "", last_name: null };
  
  const parts = trimmed.split(/\s+/);
  const first_name = parts[0] || "";
  const last_name = parts.length > 1 ? parts.slice(1).join(" ") : null;
  
  return { first_name, last_name };
}
