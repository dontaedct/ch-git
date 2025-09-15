/**
 * @fileoverview HT-008.6.3: State Management Patterns
 * @module lib/architecture/state-management
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.6.3 - Implement proper state management patterns
 * Focus: Microservice-ready architecture with scalable state management
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (architecture refactoring)
 */

/**
 * State Management System
 * 
 * Implements comprehensive state management patterns including:
 * - Redux-style state management with immutability
 * - Context-based state management for React
 * - Event-driven state updates
 * - State persistence and hydration
 * - State synchronization across components
 * - Time-travel debugging capabilities
 */

import { container, Injectable, Inject } from './dependency-injection';

// ============================================================================
// CORE STATE TYPES
// ============================================================================

export interface StateAction<T = any> {
  type: string;
  payload?: T;
  meta?: Record<string, any>;
  timestamp: number;
}

export interface StateReducer<TState = any, TAction = StateAction> {
  (state: TState, action: TAction): TState;
}

export interface StateStore<TState = any> {
  getState(): TState;
  dispatch(action: StateAction): void;
  subscribe(listener: StateListener): () => void;
  replaceReducer(reducer: StateReducer<TState>): void;
}

export type StateListener = () => void;
export type StateSelector<TState, TResult> = (state: TState) => TResult;

export interface StateMiddleware<TState = any> {
  (store: StateStore<TState>): (next: (action: StateAction) => void) => (action: StateAction) => void;
}

// ============================================================================
// STATE STORE IMPLEMENTATION
// ============================================================================

@Injectable('StateStore')
export class StateStoreImpl<TState = any> implements StateStore<TState> {
  private state: TState;
  private listeners: Set<StateListener> = new Set();
  private reducer: StateReducer<TState>;
  private middleware: StateMiddleware<TState>[] = [];
  private isDispatching = false;

  constructor(
    reducer: StateReducer<TState>,
    initialState: TState,
    middleware: StateMiddleware<TState>[] = []
  ) {
    this.reducer = reducer;
    this.state = initialState;
    this.middleware = middleware;
  }

  getState(): TState {
    if (this.isDispatching) {
      throw new Error('Cannot access state while dispatching');
    }
    return this.state;
  }

  dispatch(action: StateAction): void {
    if (this.isDispatching) {
      throw new Error('Cannot dispatch while already dispatching');
    }

    this.isDispatching = true;

    try {
      // Apply middleware
      let finalAction = action;
      for (const middleware of this.middleware) {
        const middlewareFn = middleware(this);
        const result = middlewareFn((nextAction: StateAction) => {
          this.state = this.reducer(this.state, nextAction);
          return nextAction;
        })(finalAction);
        if (result !== undefined && result !== null) {
          finalAction = result;
        }
      }

      // Apply reducer
      this.state = this.reducer(this.state, finalAction);

      // Notify listeners
      this.listeners.forEach(listener => {
        try {
          listener();
        } catch (error) {
          console.error('State listener error:', error);
        }
      });
    } finally {
      this.isDispatching = false;
    }
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  replaceReducer(reducer: StateReducer<TState>): void {
    this.reducer = reducer;
  }

  // ============================================================================
  // STATE PERSISTENCE
  // ============================================================================

  saveToStorage(key: string): void {
    try {
      const serialized = JSON.stringify(this.state);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Failed to save state to storage:', error);
    }
  }

  loadFromStorage(key: string): boolean {
    try {
      const serialized = localStorage.getItem(key);
      if (serialized) {
        this.state = JSON.parse(serialized);
        return true;
      }
    } catch (error) {
      console.error('Failed to load state from storage:', error);
    }
    return false;
  }

  // ============================================================================
  // TIME TRAVEL DEBUGGING
  // ============================================================================

  private history: TState[] = [];
  private historyIndex = -1;
  private maxHistorySize = 50;

  enableTimeTravel(): void {
    this.history = [this.state];
    this.historyIndex = 0;
  }

  saveSnapshot(): void {
    if (this.history.length >= this.maxHistorySize) {
      this.history.shift();
      this.historyIndex--;
    }
    this.history.push({ ...this.state });
    this.historyIndex++;
  }

  goToSnapshot(index: number): boolean {
    if (index >= 0 && index < this.history.length) {
      this.state = { ...this.history[index] };
      this.historyIndex = index;
      this.listeners.forEach(listener => listener());
      return true;
    }
    return false;
  }

  undo(): boolean {
    return this.goToSnapshot(this.historyIndex - 1);
  }

  redo(): boolean {
    return this.goToSnapshot(this.historyIndex + 1);
  }
}

// ============================================================================
// REACT STATE MANAGEMENT
// ============================================================================

import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';

export interface StateContextValue<TState = any> {
  state: TState;
  dispatch: (action: StateAction) => void;
  store: StateStore<TState>;
}

export function createStateContext<TState = any>() {
  return createContext<StateContextValue<TState> | null>(null);
}

export interface StateProviderProps<TState = any> {
  children: React.ReactNode;
  store: StateStore<TState>;
}

export function StateProvider<TState = any>({ children, store }: StateProviderProps<TState>) {
  const Context = createStateContext<TState>();
  
  const [state, dispatch] = useReducer(
    (state: TState, action: StateAction) => {
      store.dispatch(action);
      return store.getState();
    },
    store.getState()
  );

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      // Force re-render when state changes
      dispatch({ type: '__FORCE_UPDATE__', timestamp: Date.now() });
    });

    return unsubscribe;
  }, [store]);

  const value = useMemo(() => ({
    state,
    dispatch,
    store
  }), [state, store]);

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}

export function useStateContext<TState = any>(context: React.Context<StateContextValue<TState> | null>) {
  const value = useContext(context);
  if (!value) {
    throw new Error('useStateContext must be used within a StateProvider');
  }
  return value;
}

// ============================================================================
// STATE SELECTORS AND MEMOIZATION
// ============================================================================

export function createSelector<TState, TResult>(
  selector: StateSelector<TState, TResult>,
  equalityFn?: (a: TResult, b: TResult) => boolean
) {
  let lastResult: TResult;
  let lastState: TState;

  return (state: TState): TResult => {
    if (state === lastState) {
      return lastResult;
    }

    const result = selector(state);
    
    if (equalityFn && lastResult !== undefined) {
      if (equalityFn(result, lastResult)) {
        return lastResult;
      }
    }

    lastResult = result;
    lastState = state;
    return result;
  };
}

export function useMemoizedSelector<TState, TResult>(
  selector: StateSelector<TState, TResult>,
  state: TState,
  deps: React.DependencyList = []
): TResult {
  return useMemo(() => selector(state), [state, ...deps]);
}

// ============================================================================
// EVENT-DRIVEN STATE MANAGEMENT
// ============================================================================

export interface StateEvent {
  type: string;
  data: any;
  timestamp: number;
  source: string;
}

export interface StateEventHandler<TState = any> {
  (state: TState, event: StateEvent): TState;
}

@Injectable('EventDrivenStateManager')
export class EventDrivenStateManager<TState = any> {
  private store: StateStore<TState>;
  private eventHandlers = new Map<string, StateEventHandler<TState>[]>();
  private eventQueue: StateEvent[] = [];
  private isProcessing = false;

  constructor(store: StateStore<TState>) {
    this.store = store;
  }

  registerEventHandler(eventType: string, handler: StateEventHandler<TState>): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  emitEvent(event: StateEvent): void {
    this.eventQueue.push(event);
    this.processEventQueue();
  }

  private async processEventQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift()!;
        await this.processEvent(event);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processEvent(event: StateEvent): Promise<void> {
    const handlers = this.eventHandlers.get(event.type) || [];
    
    for (const handler of handlers) {
      try {
        const currentState = this.store.getState();
        const newState = handler(currentState, event);
        
        if (newState !== currentState) {
          this.store.dispatch({
            type: `EVENT_${event.type}`,
            payload: { event, newState },
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.error(`Error processing event ${event.type}:`, error);
      }
    }
  }
}

// ============================================================================
// STATE SYNCHRONIZATION
// ============================================================================

export interface StateSyncConfig {
  key: string;
  storage: 'localStorage' | 'sessionStorage' | 'indexedDB';
  debounceMs?: number;
  transform?: {
    serialize?: (state: any) => any;
    deserialize?: (data: any) => any;
  };
}

@Injectable('StateSynchronizer')
export class StateSynchronizer<TState = any> {
  private config: StateSyncConfig;
  private store: StateStore<TState>;
  private syncTimeout?: NodeJS.Timeout;

  constructor(
    store: StateStore<TState>,
    config: StateSyncConfig
  ) {
    this.store = store;
    this.config = config;
    this.setupSync();
  }

  private setupSync(): void {
    this.store.subscribe(() => {
      this.scheduleSync();
    });
  }

  private scheduleSync(): void {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }

    this.syncTimeout = setTimeout(() => {
      this.syncToStorage();
    }, this.config.debounceMs || 100);
  }

  public syncToStorage(): void {
    try {
      const state = this.store.getState();
      const data = this.config.transform?.serialize 
        ? this.config.transform.serialize(state)
        : state;

      const serialized = JSON.stringify(data);
      
      switch (this.config.storage) {
        case 'localStorage':
          localStorage.setItem(this.config.key, serialized);
          break;
        case 'sessionStorage':
          sessionStorage.setItem(this.config.key, serialized);
          break;
        case 'indexedDB':
          this.syncToIndexedDB(serialized);
          break;
      }
    } catch (error) {
      console.error('Failed to sync state to storage:', error);
    }
  }

  private async syncToIndexedDB(data: string): Promise<void> {
    // Implementation would use IndexedDB
    console.log('IndexedDB sync not implemented:', data);
  }

  async loadFromStorage(): Promise<boolean> {
    try {
      let serialized: string | null = null;
      
      switch (this.config.storage) {
        case 'localStorage':
          serialized = localStorage.getItem(this.config.key);
          break;
        case 'sessionStorage':
          serialized = sessionStorage.getItem(this.config.key);
          break;
        case 'indexedDB':
          serialized = await this.loadFromIndexedDB();
          break;
      }

      if (serialized) {
        const data = JSON.parse(serialized);
        const state = this.config.transform?.deserialize 
          ? this.config.transform.deserialize(data)
          : data;

        this.store.dispatch({
          type: '__HYDRATE_STATE__',
          payload: state,
          timestamp: Date.now()
        });

        return true;
      }
    } catch (error) {
      console.error('Failed to load state from storage:', error);
    }
    return false;
  }

  private async loadFromIndexedDB(): Promise<string | null> {
    // Implementation would use IndexedDB
    return null;
  }
}

// ============================================================================
// STATE MANAGEMENT UTILITIES
// ============================================================================

export function createAction<T = any>(type: string, payload?: T): StateAction<T> {
  return {
    type,
    payload,
    timestamp: Date.now()
  };
}

export function createAsyncAction<T = any>(
  type: string,
  asyncFn: () => Promise<T>
): (dispatch: (action: StateAction) => void) => Promise<void> {
  return async (dispatch) => {
    dispatch(createAction(`${type}_START`));
    
    try {
      const result = await asyncFn();
      dispatch(createAction(`${type}_SUCCESS`, result));
    } catch (error) {
      dispatch(createAction(`${type}_ERROR`, error));
    }
  };
}

export function combineReducers<TState>(
  reducers: Record<string, StateReducer<any>>
): StateReducer<TState> {
  return (state: TState, action: StateAction) => {
    const newState = { ...state } as any;
    
    for (const [key, reducer] of Object.entries(reducers)) {
      (newState as any)[key] = reducer((state as any)[key], action);
    }
    
    return newState;
  };
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

export function createLoggerMiddleware<TState = any>(): StateMiddleware<TState> {
  return (store) => (next) => (action) => {
    console.group(`Action: ${action.type}`);
    console.log('Previous State:', store.getState());
    console.log('Action:', action);
    
    const result = next(action);
    
    console.log('Next State:', store.getState());
    console.groupEnd();
    
    return result;
  };
}

export function createThunkMiddleware<TState = any>(): StateMiddleware<TState> {
  return (store) => (next) => (action) => {
    if (typeof action === 'function') {
      return (action as any)(store.dispatch, store.getState);
    }
    return next(action);
  };
}

export function createPersistMiddleware<TState = any>(
  config: StateSyncConfig
): StateMiddleware<TState> {
  return (store) => (next) => (action) => {
    const result = next(action);
    
    // Persist state after action
    const synchronizer = new StateSynchronizer(store, config);
    synchronizer.syncToStorage();
    
    return result;
  };
}

export default {
  StateStoreImpl,
  EventDrivenStateManager,
  StateSynchronizer,
  createStateContext,
  StateProvider,
  useStateContext,
  createSelector,
  createAction,
  createAsyncAction,
  combineReducers,
  createLoggerMiddleware,
  createThunkMiddleware,
  createPersistMiddleware
};
