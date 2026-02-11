import { logger } from './logger';

export type User = {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
  };
};

export type Session = {
  access_token: string;
  user: User;
};

type AuthEvent = 'INITIAL_SESSION' | 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED';

type AuthStateCallback = (event: AuthEvent, session: Session | null) => void;

const SESSION_STORAGE_KEY = 'nectar_convex_session';

const getConvexSiteUrl = (): string => {
  const processEnvSiteUrl =
    typeof process !== 'undefined' && process.env ? process.env.VITE_CONVEX_SITE_URL : undefined;
  const processEnvGenerateUrl =
    typeof process !== 'undefined' && process.env ? process.env.VITE_CONVEX_GENERATE_HUSTLES_URL : undefined;
  const fromEnv =
    import.meta.env.VITE_CONVEX_SITE_URL ||
    processEnvSiteUrl ||
    import.meta.env.VITE_CONVEX_GENERATE_HUSTLES_URL ||
    processEnvGenerateUrl ||
    'https://quaint-lion-604.convex.site/api/generate-hustles';

  if (fromEnv.endsWith('/api/generate-hustles')) {
    return fromEnv.replace(/\/api\/generate-hustles$/, '');
  }

  return fromEnv.replace(/\/$/, '');
};

const listeners = new Set<AuthStateCallback>();

let currentSession: Session | null = (() => {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
})();

const emitAuthState = (event: AuthEvent) => {
  listeners.forEach((listener) => {
    try {
      listener(event, currentSession);
    } catch (error) {
      logger.error('Auth state listener error:', error);
    }
  });
};

const saveSession = (session: Session | null) => {
  currentSession = session;
  try {
    if (session) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (error) {
    logger.error('Failed to persist session:', error);
  }
};

const authError = (message: string) => ({ message });

const callConvexApi = async <T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    includeAuth?: boolean;
  } = {}
): Promise<{ data: T | null; error: { message: string } | null; status: number }> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.includeAuth && currentSession?.access_token) {
      headers.Authorization = `Bearer ${currentSession.access_token}`;
    }

    const response = await fetch(`${getConvexSiteUrl()}${path}`, {
      method: options.method || 'POST',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    const result = await response.json();
    if (!response.ok) {
      const message =
        result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
          ? result.error
          : `Request failed (${response.status})`;
      return { data: null, error: authError(message), status: response.status };
    }

    return { data: result as T, error: null, status: response.status };
  } catch (error: any) {
    return {
      data: null,
      error: authError(error?.message || 'Network request failed'),
      status: 0,
    };
  }
};

const refreshSession = async (): Promise<Session | null> => {
  if (!currentSession?.access_token) return null;

  const { data, error } = await callConvexApi<{ session: Session | null }>('/api/auth/session', {
    method: 'POST',
    includeAuth: true,
  });

  if (error || !data) {
    saveSession(null);
    emitAuthState('SIGNED_OUT');
    return null;
  }

  if (!data.session) {
    saveSession(null);
    emitAuthState('SIGNED_OUT');
    return null;
  }

  saveSession(data.session);
  return data.session;
};

type SelectFilter = { column: string; value: unknown };

const selectFromTable = async (
  table: string,
  columns: string,
  filters: SelectFilter[]
): Promise<{ data: any; error: { message: string } | null }> => {
  const { data, error } = await callConvexApi<{ data: any; error?: string }>('/api/db/select', {
    method: 'POST',
    body: {
      table,
      columns,
      filters,
    },
    includeAuth: true,
  });

  if (error) return { data: null, error };
  return { data: data?.data ?? null, error: null };
};

const updateTable = async (
  table: string,
  values: Record<string, unknown>,
  filters: SelectFilter[]
): Promise<{ data: null; error: { message: string } | null }> => {
  const { error } = await callConvexApi<{ data: null; error?: string }>('/api/db/update', {
    method: 'POST',
    body: {
      table,
      values,
      filters,
    },
    includeAuth: true,
  });
  return { data: null, error };
};

const upsertTable = async (
  table: string,
  values: Record<string, unknown>
): Promise<{ data: any; error: { message: string } | null }> => {
  const { data, error } = await callConvexApi<{ data: any; error?: string }>('/api/db/upsert', {
    method: 'POST',
    body: {
      table,
      values,
    },
    includeAuth: true,
  });
  if (error) return { data: null, error };
  return { data: data?.data ?? null, error: null };
};

const auth = {
  signUp: async (params: {
    email: string;
    password: string;
    options?: { data?: { full_name?: string }; emailRedirectTo?: string };
  }) => {
    const { data, error } = await callConvexApi<{ user: User | null; session: Session | null }>(
      '/api/auth/sign-up',
      {
        method: 'POST',
        body: params,
      }
    );

    return {
      data: data ? { user: data.user, session: data.session } : { user: null, session: null },
      error,
    };
  },

  signInWithPassword: async (params: { email: string; password: string }) => {
    const { data, error } = await callConvexApi<{ user: User; session: Session }>('/api/auth/sign-in', {
      method: 'POST',
      body: params,
    });

    if (!error && data?.session) {
      saveSession(data.session);
      emitAuthState('SIGNED_IN');
    }

    return {
      data: data ? { user: data.user, session: data.session } : { user: null, session: null },
      error,
    };
  },

  signInWithOAuth: async (_params: { provider: string; options?: { redirectTo?: string } }) => {
    return {
      data: null,
      error: authError('missing OAuth secret'),
    };
  },

  getSession: async () => {
    const session = await refreshSession();
    return {
      data: { session },
      error: null,
    };
  },

  getUser: async () => {
    const session = await refreshSession();
    return {
      data: { user: session?.user ?? null },
      error: null,
    };
  },

  signOut: async () => {
    await callConvexApi('/api/auth/sign-out', {
      method: 'POST',
      includeAuth: true,
    });
    saveSession(null);
    emitAuthState('SIGNED_OUT');
    return { error: null };
  },

  updateUser: async (params: { email?: string; data?: { full_name?: string } }) => {
    const { data, error } = await callConvexApi<{ user: User | null }>('/api/auth/update-user', {
      method: 'POST',
      includeAuth: true,
      body: params,
    });

    if (!error && data?.user && currentSession) {
      const updatedSession: Session = {
        ...currentSession,
        user: data.user,
      };
      saveSession(updatedSession);
      emitAuthState('USER_UPDATED');
    }

    return {
      data: { user: data?.user ?? null },
      error,
    };
  },

  onAuthStateChange: (callback: AuthStateCallback) => {
    listeners.add(callback);
    setTimeout(() => {
      callback('INITIAL_SESSION', currentSession);
    }, 0);
    return {
      data: {
        subscription: {
          unsubscribe: () => listeners.delete(callback),
        },
      },
    };
  },
};

const functions = {
  invoke: async (
    name: string,
    options: { method?: string; body?: unknown } = {}
  ): Promise<{ data: any; error: { message: string } | null }> => {
    if (name === 'delete-user') {
      const { data, error } = await callConvexApi('/api/user/delete', {
        method: options.method || 'POST',
        includeAuth: true,
      });
      return { data, error };
    }

    if (name === 'send-email') {
      const { data, error } = await callConvexApi('/api/send-email', {
        method: options.method || 'POST',
        body: options.body,
        includeAuth: true,
      });
      return { data, error };
    }

    return { data: null, error: authError(`Function "${name}" not found`) };
  },
};

const from = (table: string) => ({
  select: (columns: string) => {
    const filters: SelectFilter[] = [];
    const builder = {
      eq: (column: string, value: unknown) => {
        filters.push({ column, value });
        return builder;
      },
      single: async () => {
        return await selectFromTable(table, columns, filters);
      },
      maybeSingle: async () => {
        return await selectFromTable(table, columns, filters);
      },
    };
    return builder;
  },

  update: (values: Record<string, unknown>) => ({
    eq: async (column: string, value: unknown) => {
      return await updateTable(table, values, [{ column, value }]);
    },
  }),

  upsert: async (values: Record<string, unknown>, _options?: unknown) => {
    return await upsertTable(table, values);
  },
});

export const convexClient = {
  auth,
  functions,
  from,
};
