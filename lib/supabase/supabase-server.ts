// Comprehensive mock Supabase client for server-side usage
// This prevents browser-only dependencies from being bundled

export interface MockSupabaseError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

// Match the User interface from guard.ts
export interface MockUser {
  id: string;
  email?: string;
  user_metadata?: {
    roles?: string[];
    [key: string]: unknown;
  };
  app_metadata?: {
    roles?: string[];
    [key: string]: unknown;
  };
}

export interface MockSupabaseAuth {
  getUser: () => Promise<{ data: { user: MockUser | null }; error: MockSupabaseError | null }>;
  getSession: () => Promise<{ data: { session: unknown }; error: MockSupabaseError | null }>;
}

export interface MockSupabaseQueryBuilder<T = unknown> {
  // Query methods
  select: (columns?: string | string[] | { count: string; head?: boolean }, options?: { count: string; head?: boolean }) => MockSupabaseQueryBuilder<T>;
  eq: (column: string, value: unknown) => MockSupabaseQueryBuilder<T>;
  neq: (column: string, value: unknown) => MockSupabaseQueryBuilder<T>;
  gt: (column: string, value: unknown) => MockSupabaseQueryBuilder<T>;
  gte: (column: string, value: unknown) => MockSupabaseQueryBuilder<T>;
  lt: (column: string, value: unknown) => MockSupabaseQueryBuilder<T>;
  lte: (column: string, value: unknown) => MockSupabaseQueryBuilder<T>;
  like: (column: string, value: string) => MockSupabaseQueryBuilder<T>;
  ilike: (column: string, value: string) => MockSupabaseQueryBuilder<T>;
  in: (column: string, values: unknown[]) => MockSupabaseQueryBuilder<T>;
  not: (column: string, values: unknown[]) => MockSupabaseQueryBuilder<T>;
  is: (column: string, value: unknown) => MockSupabaseQueryBuilder<T>;
  
  // Ordering and pagination
  order: (column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) => MockSupabaseQueryBuilder<T>;
  limit: (count: number) => MockSupabaseQueryBuilder<T>;
  range: (from: number, to: number) => MockSupabaseQueryBuilder<T>;
  
  // Result methods
  single: () => Promise<{ data: T | null; error: MockSupabaseError | null }>;
  maybeSingle: () => Promise<{ data: T | null; error: MockSupabaseError | null }>;
  
  // Insert methods
  insert: (values: T | T[], options?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }) => MockSupabaseQueryBuilder<T>;
  
  // Update methods
  update: (updates: unknown) => MockSupabaseQueryBuilder<T>;
  
  // Delete methods
  delete: (options?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }) => MockSupabaseQueryBuilder<T>;
  
  // Additional methods for compatibility
  upsert: (values: T | T[], options?: { onConflict?: string }) => MockSupabaseQueryBuilder<T>;
  
  // Make it awaitable - implement proper Promise interface
  then: (resolve: (value: { data: T[]; error: MockSupabaseError | null; count?: number }) => void) => void;
  
  // Count property
  get count(): number;
  
  // Symbol.iterator for array-like behavior
  [Symbol.iterator]: () => Iterator<{ data: T[] | null; error: MockSupabaseError | null; count?: number }>;
}

export interface MockSupabaseClient {
  auth: MockSupabaseAuth;
  from: <T = unknown>(table: string) => MockSupabaseQueryBuilder<T>;
  rpc: <T = unknown>(functionName: string, _params?: Record<string, unknown>) => Promise<{ data: T | null; error: MockSupabaseError | null }>;
  storage: {
    from: (bucket: string) => {
      createSignedUrl: (path: string, expiresIn: number) => Promise<{ data: { signedUrl: string }; error: MockSupabaseError | null }>;
      createSignedUploadUrl: (path: string) => Promise<{ data: { signedUrl: string; token: string }; error: MockSupabaseError | null }>;
    };
  };
}

// Mock data store for testing
const mockDataStore: Record<string, unknown[]> = {
  trainers: [],
  weekly_plans: [
    {
      id: 'mock-plan-1',
      client_id: 'mock-client-1',
      coach_id: 'mock-coach-1',
      week_start_date: '[RELATIVE: 2 years from now]',
      week_end_date: '[RELATIVE: 2 years from now]',
      title: 'Mock Weekly Plan',
      description: 'A mock weekly plan for testing',
      plan_json: {
        tasks: [
          {
            id: 'mock-task-1',
            title: 'Mock Task 1',
            description: 'A mock task for testing',
            completed: false,
            order: 1,
            category: 'workout',
            frequency: 'daily'
          }
        ],
        goals: [
          {
            id: 'mock-goal-1',
            title: 'Mock Goal 1',
            description: 'A mock goal for testing',
            completed: false,
            order: 1
          }
        ]
      },
      status: 'active',
      created_at: '[RELATIVE: 2 years from now]',
      updated_at: '[RELATIVE: 2 years from now]'
    }
  ],
  clients: [
    {
      id: 'mock-client-1',
      coach_id: 'mock-coach-1',
      full_name: 'Mock Client',
      email: 'mock@example.com',
      first_name: 'Mock',
      last_name: 'Client',
      created_at: '[RELATIVE: 2 years from now]'
    }
  ],
  coaches: [{ id: 'mock-coach-id' }],
  check_ins: [
    {
      id: 'mock-checkin-1',
      coach_id: 'mock-coach-1',
      client_id: 'mock-client-1',
      week_start_date: '[RELATIVE: 2 years from now]',
      check_in_date: '[RELATIVE: 2 years from now]',
      adherence_pct: 85,
      mood_rating: 8,
      energy_level: 7,
      created_at: '[RELATIVE: 2 years from now]'
    }
  ],
  progress_metrics: [
    {
      id: 'mock-metric-1',
      coach_id: 'mock-coach-1',
      client_id: 'mock-client-1',
      key: 'compliance7',
      value: 85,
      metric_date: '[RELATIVE: 2 years from now]',
      created_at: '[RELATIVE: 2 years from now]'
    }
  ],
  media: []
};

// Helper to generate mock IDs
const generateMockId = () => `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Create a comprehensive mock query builder
function createMockQueryBuilder<T = unknown>(table: string): MockSupabaseQueryBuilder<T> {
  const queryState = {
    table,
    selectColumns: '*' as string | string[] | { count: string; head?: boolean },
    whereConditions: [] as Array<{ column: string; operator: string; value: unknown }>,
    orderBy: null as { column: string; ascending: boolean } | null,
    limitCount: null as number | null,
    rangeFrom: null as number | null,
    rangeTo: null as number | null,
    insertData: null as T | T[] | null,
    updateData: null as unknown | null,
    deleteMode: false,
    countMode: false,
    headMode: false
  };

  // Create a promise that will be resolved when the query is executed
  let resolvePromise: ((value: { data: T[] | null; error: MockSupabaseError | null; count?: number }) => void) | null = null;
  let rejectPromise: ((reason: unknown) => void) | null = null;
  
  const promise = new Promise<{ data: T[] | null; error: MockSupabaseError | null; count?: number }>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  const builder: MockSupabaseQueryBuilder<T> = {
    select: (columns = '*', options?: { count?: string; head?: boolean }) => {
      if (typeof columns === 'string') {
        queryState.selectColumns = columns;
      } else if (Array.isArray(columns)) {
        queryState.selectColumns = columns;
      } else if (columns && typeof columns === 'object' && 'count' in columns) {
        queryState.countMode = columns.count === 'exact';
        queryState.headMode = columns.head === true;
        queryState.selectColumns = '*';
      }
      
      if (options && typeof options === 'object') {
        queryState.countMode = queryState.countMode || options.count === 'exact';
        queryState.headMode = queryState.headMode || options.head === true;
      }
      
      return builder;
    },

    eq: (column: string, value: unknown) => {
      queryState.whereConditions.push({ column, operator: 'eq', value });
      return builder;
    },

    neq: (column: string, value: unknown) => {
      queryState.whereConditions.push({ column, operator: 'neq', value });
      return builder;
    },

    gt: (column: string, value: unknown) => {
      queryState.whereConditions.push({ column, operator: 'gt', value });
      return builder;
    },

    gte: (column: string, value: unknown) => {
      queryState.whereConditions.push({ column, operator: 'gte', value });
      return builder;
    },

    lt: (column: string, value: unknown) => {
      queryState.whereConditions.push({ column, operator: 'lt', value });
      return builder;
    },

    lte: (column: string, value: unknown) => {
      queryState.whereConditions.push({ column, operator: 'lte', value });
      return builder;
    },

    like: (column: string, value: string) => {
      queryState.whereConditions.push({ column, operator: 'like', value });
      return builder;
    },

    ilike: (column: string, value: string) => {
      queryState.whereConditions.push({ column, operator: 'ilike', value });
      return builder;
    },

    in: (column: string, values: unknown[]) => {
      queryState.whereConditions.push({ column, operator: 'in', value: values });
      return builder;
    },

    not: (column: string, values: unknown[]) => {
      queryState.whereConditions.push({ column, operator: 'not', value: values });
      return builder;
    },

    is: (column: string, value: unknown) => {
      queryState.whereConditions.push({ column, operator: 'is', value });
      return builder;
    },

    order: (column: string, options = {}) => {
      queryState.orderBy = { column, ascending: options.ascending !== false };
      return builder;
    },

    limit: (count: number) => {
      queryState.limitCount = count;
      return builder;
    },

    range: (from: number, to: number) => {
      queryState.rangeFrom = from;
      queryState.rangeTo = to;
      return builder;
    },

    single: async () => {
      const result = await executeQuery();
      if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        // For single() calls, return the first item with proper typing
        const item = result.data[0];
        
        // Handle specific column selection cases
        if (queryState.selectColumns === 'id') {
          return { data: { id: (item as Record<string, unknown>).id ?? 'mock-id' } as T, error: null };
        }
        
        if (Array.isArray(queryState.selectColumns) && queryState.selectColumns.length === 1 && queryState.selectColumns[0] === 'id') {
          return { data: { id: (item as Record<string, unknown>).id ?? 'mock-id' } as T, error: null };
        }
        
        // For other cases, return the item as-is
        return { data: item as T, error: null };
      }
      return { data: null, error: { message: 'No rows returned', code: 'PGRST116' } };
    },

    maybeSingle: async () => {
      const result = await executeQuery();
      if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        const item = result.data[0];
        
        // Handle specific column selection cases
        if (queryState.selectColumns === 'id') {
          return { data: { id: (item as Record<string, unknown>).id ?? 'mock-id' } as T, error: null };
        }
        
        if (Array.isArray(queryState.selectColumns) && queryState.selectColumns.length === 1 && queryState.selectColumns[0] === 'id') {
          return { data: { id: (item as Record<string, unknown>).id ?? 'mock-id' } as T, error: null };
        }
        
        // For other cases, return the item as-is
        return { data: item as T, error: null };
      }
      return { data: null, error: null };
    },

    insert: (values: T | T[], options?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }) => {
      queryState.insertData = values;
      queryState.countMode = options?.count === 'exact';
      queryState.headMode = options?.head === true;
      return builder;
    },

    update: (updates: unknown) => {
      queryState.updateData = updates;
      queryState.countMode = false;
      queryState.headMode = false;
      return builder;
    },

    delete: (options?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }) => {
      queryState.deleteMode = true;
      queryState.countMode = options?.count === 'exact';
      queryState.headMode = options?.head === true;
      return builder;
    },

    upsert: (values: T | T[], _options?: { onConflict?: string }) => {
      queryState.insertData = values;
      queryState.updateData = values;
      return builder;
    },

    get count() {
      const matchingData = (mockDataStore[queryState.table] || []).filter(item => {
        return queryState.whereConditions.every(condition => {
          const itemValue = (item as Record<string, unknown>)[condition.column];
          switch (condition.operator) {
            case 'eq':
              return itemValue === condition.value;
            case 'neq':
              return itemValue !== condition.value;
            case 'gt':
              return typeof itemValue === 'number' && typeof condition.value === 'number' ? itemValue > condition.value : false;
            case 'gte':
              return typeof itemValue === 'number' && typeof condition.value === 'number' ? itemValue >= condition.value : false;
            case 'lt':
              return typeof itemValue === 'number' && typeof condition.value === 'number' ? itemValue < condition.value : false;
            case 'lte':
              return typeof itemValue === 'number' && typeof condition.value === 'number' ? itemValue <= condition.value : false;
            case 'like':
              return String(itemValue).includes(String(condition.value));
            case 'ilike':
              return String(itemValue).toLowerCase().includes(String(condition.value).toLowerCase());
            case 'in':
              return Array.isArray(condition.value) && condition.value.includes(itemValue);
            case 'not':
              return Array.isArray(condition.value) && !condition.value.includes(itemValue);
            case 'is':
              return itemValue === condition.value;
            default:
              return true;
          }
        });
      });
      return matchingData.length;
    },

    // Proper Promise implementation
    then: (resolve: (value: { data: T[]; error: MockSupabaseError | null; count?: number }) => void) => {
      promise.then(result => {
        // Ensure data is never null to match the expected interface
        const safeResult = {
          data: result.data ?? [],
          error: result.error,
          count: result.count
        };
        resolve(safeResult);
      });
    },



    // Symbol.iterator for array-like behavior
    [Symbol.iterator]: () => {
      return {
        next: () => promise.then(result => ({ value: result, done: false }))
      } as unknown as Iterator<{ data: T[] | null; error: MockSupabaseError | null; count?: number }>;
    }
  };

  // Execute the query and resolve the promise
  async function executeQuery() {
    try {
      let data = mockDataStore[table] || [];

      // Apply where conditions
      data = data.filter(item => {
        return queryState.whereConditions.every(condition => {
          const itemValue = (item as Record<string, unknown>)[condition.column];
          switch (condition.operator) {
            case 'eq':
              return itemValue === condition.value;
            case 'neq':
              return itemValue !== condition.value;
            case 'gt':
              return typeof itemValue === 'number' && typeof condition.value === 'number' ? itemValue > condition.value : false;
            case 'gte':
              return typeof itemValue === 'number' && typeof condition.value === 'number' ? itemValue >= condition.value : false;
            case 'lt':
              return typeof itemValue === 'number' && typeof condition.value === 'number' ? itemValue < condition.value : false;
            case 'lte':
              return typeof itemValue === 'number' && typeof condition.value === 'number' ? itemValue <= condition.value : false;
            case 'like':
              return String(itemValue).includes(String(condition.value));
            case 'ilike':
              return String(itemValue).toLowerCase().includes(String(condition.value).toLowerCase());
            case 'in':
              return Array.isArray(condition.value) && condition.value.includes(itemValue);
            case 'not':
              return Array.isArray(condition.value) && !condition.value.includes(itemValue);
            case 'is':
              return itemValue === condition.value;
            default:
              return true;
          }
        });
      });

      // Apply ordering
      if (queryState.orderBy) {
        data.sort((a, b) => {
          const aVal = (a as Record<string, unknown>)[queryState.orderBy!.column];
          const bVal = (b as Record<string, unknown>)[queryState.orderBy!.column];
          
          // Handle different types for comparison
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            if (aVal < bVal) return queryState.orderBy!.ascending ? -1 : 1;
            if (aVal > bVal) return queryState.orderBy!.ascending ? 1 : -1;
            return 0;
          }
          
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            if (aVal < bVal) return queryState.orderBy!.ascending ? -1 : 1;
            if (aVal > bVal) return queryState.orderBy!.ascending ? 1 : -1;
            return 0;
          }
          
          // For other types, maintain original order
          return 0;
        });
      }

      // Handle insert
      if (queryState.insertData) {
        const insertData = Array.isArray(queryState.insertData) ? queryState.insertData : [queryState.insertData];
        const newItems = insertData.map(item => ({
          ...item,
          id: generateMockId(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        mockDataStore[table] = [...(mockDataStore[table] || []), ...newItems];
        
        if (queryState.headMode) {
          return { data: null, error: null, count: newItems.length };
        }
        
        if (queryState.selectColumns === 'id' || (Array.isArray(queryState.selectColumns) && queryState.selectColumns.length === 1 && queryState.selectColumns[0] === 'id')) {
          return { data: newItems.map(item => ({ id: item.id })), error: null, count: newItems.length };
        }
        
        return { data: newItems, error: null, count: newItems.length };
      }

      // Handle update
      if (queryState.updateData) {
        const updatedItems = data.map(item => ({
          ...(item as Record<string, unknown>),
          ...(queryState.updateData as Record<string, unknown>),
          updated_at: new Date().toISOString()
        }));
        
        // Update the mock store
        mockDataStore[table] = (mockDataStore[table] || []).map(item => {
          const shouldUpdate = queryState.whereConditions.every(condition => {
            const itemValue = (item as Record<string, unknown>)[condition.column];
            switch (condition.operator) {
              case 'eq':
                return itemValue === condition.value;
              default:
                return true;
            }
          });
          return shouldUpdate ? { ...(item as Record<string, unknown>), ...(queryState.updateData as Record<string, unknown>), updated_at: new Date().toISOString() } : item;
        });

        if (queryState.headMode) {
          return { data: null, error: null, count: updatedItems.length };
        }
        
        if (queryState.selectColumns === 'id' || (Array.isArray(queryState.selectColumns) && queryState.selectColumns.length === 1 && queryState.selectColumns[0] === 'id')) {
          return { data: updatedItems.map(item => ({ id: (item as Record<string, unknown>).id })), error: null, count: updatedItems.length };
        }
        
        return { data: updatedItems, error: null, count: updatedItems.length };
      }

      // Handle delete
      if (queryState.deleteMode) {
        const deletedCount = data.length;
        // Remove items from mock store
        mockDataStore[table] = (mockDataStore[table] || []).filter(item => {
          return !queryState.whereConditions.every(condition => {
            const itemValue = (item as Record<string, unknown>)[condition.column];
            switch (condition.operator) {
              case 'eq':
                return itemValue === condition.value;
              default:
                return true;
            }
          });
        });
        
        if (queryState.headMode) {
          return { data: null, error: null, count: deletedCount };
        }
        
        return { data: null, error: null, count: deletedCount };
      }

      // Apply pagination
      if (queryState.rangeFrom !== null && queryState.rangeTo !== null) {
        data = data.slice(queryState.rangeFrom, queryState.rangeTo + 1);
      } else if (queryState.limitCount !== null) {
        data = data.slice(0, queryState.limitCount);
      }

      // Handle count mode
      if (queryState.countMode) {
        return { data: null, error: null, count: data.length };
      }

      // Handle head mode
      if (queryState.headMode) {
        return { data: null, error: null };
      }

      // Apply column selection
      if (queryState.selectColumns !== '*') {
        if (Array.isArray(queryState.selectColumns)) {
          data = data.map(item => {
            const selectedItem: Record<string, unknown> = {};
            (queryState.selectColumns as string[]).forEach(col => {
              if (typeof col === 'string' && col in (item as Record<string, unknown>)) {
                selectedItem[col] = (item as Record<string, unknown>)[col];
              }
            });
            return selectedItem;
          });
        } else if (typeof queryState.selectColumns === 'string') {
          // Handle comma-separated string like "client_id, plan_json"
          const columns = queryState.selectColumns.split(',').map(col => col.trim()).filter(Boolean);
          data = data.map(item => {
            const selectedItem: Record<string, unknown> = {};
            columns.forEach(col => {
              if (col in (item as Record<string, unknown>)) {
                selectedItem[col] = (item as Record<string, unknown>)[col];
              }
            });
            return selectedItem;
          });
        }
      }

      // Special handling for single column selection like "id"
      if (typeof queryState.selectColumns === 'string' && queryState.selectColumns === 'id') {
        data = data.map(item => ({ id: (item as Record<string, unknown>).id ?? 'mock-id' }));
      }

      return { data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: { 
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'MOCK_ERROR'
        } 
      };
    }
  }

  // Execute the query and resolve the promise when the builder is awaited
  executeQuery().then(result => {
    if (resolvePromise) {
      // Ensure the result matches the expected type
      const typedResult: { data: T[] | null; error: MockSupabaseError | null; count?: number } = {
        data: result.data as T[] | null,
        error: result.error,
        count: result.count
      };
      resolvePromise(typedResult);
    }
  }).catch(error => {
    if (rejectPromise) {
      rejectPromise(error);
    }
  });

  return builder;
}

// Create mock Supabase client
function createMockSupabaseClient(): MockSupabaseClient {
  return {
    auth: {
      getUser: async () => ({ 
        data: { 
          user: { 
            id: 'mock-user-id',
            email: 'mock@example.com',
            user_metadata: { roles: ['dev'] },
            app_metadata: { roles: ['dev'] }
          } 
        }, 
        error: null 
      }),
      getSession: async () => ({ 
        data: { 
          session: { 
            user: { 
              id: 'mock-user-id',
              email: 'mock@example.com',
              user_metadata: { roles: ['dev'] },
              app_metadata: { roles: ['dev'] }
            } 
          } 
        }, 
        error: null 
      })
    },
    from: <T = unknown>(table: string) => createMockQueryBuilder<T>(table),
    rpc: async <T = unknown>(functionName: string, _params: Record<string, unknown> = {}) => {
      // Mock RPC responses
      if (functionName === 'create_client_intake') {
        return { data: { success: true } as T, error: null };
      }
      return { data: null, error: null };
    },
    storage: {
      from: (bucket: string) => ({
        createSignedUrl: async (path: string, expiresIn: number) => ({
          data: { signedUrl: `https://mock-storage.com/${bucket}/${path}?expires=${expiresIn}` },
          error: null
        }),
        createSignedUploadUrl: async (path: string) => ({
          data: { 
            signedUrl: `https://mock-storage.com/${bucket}/${path}/upload`,
            token: 'mock-upload-token'
          },
          error: null
        })
      })
    }
  };
}

// Export mock clients
export function getSupabaseServer(): MockSupabaseClient {
  return createMockSupabaseClient();
}

export function getSupabaseServiceRole(): MockSupabaseClient {
  return createMockSupabaseClient();
}
