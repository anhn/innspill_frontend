// Activity logger for frontend → backend action logs
// Tracks login and logout actions to backend

import API_ENDPOINTS from "@/config/api";

export type LogActionParams = {
  action: string; // e.g., 'login' | 'logout'
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  coursePlanName?: string;
  userInfo?: Record<string, unknown>;
  success?: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  processingTimeMs?: number;
};

function getSessionId(): string {
  try {
    const key = 'ai4edu_session_id';
    let sid = sessionStorage.getItem(key);
    if (!sid) {
      sid = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(key, sid);
    }
    return sid;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function getUserName(): string | undefined {
  try {
    return localStorage.getItem('ai4edu_user') || undefined;
  } catch {
    return undefined;
  }
}

export async function logAction(params: LogActionParams): Promise<void> {
  const {
    action,
    endpoint,
    method,
    coursePlanName,
    userInfo,
    success = true,
    errorMessage,
    metadata,
    processingTimeMs,
  } = params;

  // Only track login and logout actions
  if (action !== 'login' && action !== 'logout') {
    console.debug('[logAction] Skipping non-login/logout action:', action);
    return;
  }

  const body = {
    // Schema-aligned fields
    userId: getUserName(),
    sessionId: getSessionId(),
    // ipAddress will be inferred by backend
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    timestamp: new Date().toISOString(),
    action,
    endpoint,
    method,
    userInfo,
    coursePlanName,
    requestSize: undefined,
    responseSize: undefined,
    tokenUsageInternal: undefined,
    processingTime: processingTimeMs,
    success,
    errorMessage,
    metadata,
  };

  try {
    // POST to backend tracking endpoint
    const response = await fetch(API_ENDPOINTS.logs.track, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (response.ok) {
      console.debug('[logAction] Successfully logged action:', action);
    } else {
      // Don't throw - logging failures shouldn't block user actions
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.warn('[logAction] Failed to log action:', {
        action,
        status: response.status,
        error: errorData
      });
    }
  } catch (error) {
    // Don't throw - logging failures shouldn't block user actions
    console.warn('[logAction] Error logging action (non-blocking):', {
      action,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}


