// Tables registry - All database table names and helpers
export const tables = {
  // Core entities
  clients: 'clients',
  sessions: 'sessions',
  trainers: 'trainers',
  
  // Planning & Progress
  'weekly_plans': 'weekly_plans',
  check_ins: 'check_ins',
  'progress_metrics': 'progress_metrics',
  
  // Communication
  invites: 'invites',
  attendance: 'attendance',
  'email_logs': 'email_logs',
  
  // Media
  media: 'media',
} as const;

export type TableName = keyof typeof tables;
export type TableValue = typeof tables[TableName];

// Helper functions
export function getTable(name: TableName): TableValue {
  return tables[name];
}

export function isTable(name: string): name is TableValue {
  return Object.values(tables).includes(name as TableValue);
}

export function getTableKey(name: string): TableName | null {
  const entry = Object.entries(tables).find(([_, tableName]) => tableName === name);
  return entry ? (entry[0] as TableName) : null;
}

// Common table operations
export const tableOperations = {
  select: 'SELECT',
  insert: 'INSERT',
  update: 'UPDATE',
  delete: 'DELETE',
  upsert: 'UPSERT',
} as const;
