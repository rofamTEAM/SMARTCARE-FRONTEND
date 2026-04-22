/**
 * Central API client — Bearer token auth, no cookies.
 * All components import from here. One source of truth.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApiError {
  message: string;
  status: number;
}

// ---------------------------------------------------------------------------
// Token helpers (localStorage — client-side only)
// ---------------------------------------------------------------------------

const getToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

const getRefreshToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

const setTokens = (access: string, refresh?: string): void => {
  localStorage.setItem('auth_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
};

export const clearTokens = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
};

// ---------------------------------------------------------------------------
// Token refresh (called once on 401, queues concurrent requests)
// ---------------------------------------------------------------------------

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

const runRefresh = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const data = await res.json();
    const newAccess: string | undefined =
      data?.tokens?.accessToken ?? data?.data?.tokens?.accessToken;

    if (!newAccess) {
      clearTokens();
      return null;
    }

    setTokens(newAccess, data?.tokens?.refreshToken ?? data?.data?.tokens?.refreshToken);
    return newAccess;
  } catch {
    clearTokens();
    return null;
  }
};

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Remove Content-Type for FormData so browser sets boundary automatically
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers,
      credentials: 'omit',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle 401 — attempt token refresh once
    if (res.status === 401 && retry) {
      if (!isRefreshing) {
        isRefreshing = true;
        const newToken = await runRefresh();
        isRefreshing = false;
        refreshQueue.forEach(cb => cb(newToken));
        refreshQueue = [];

        if (newToken) {
          return request<T>(path, options, false);
        }
        // Refresh failed — clear tokens, throw so UI can redirect to login
        clearTokens();
        throw { message: 'Session expired. Please log in again.', status: 401 } as ApiError;
      }

      // Another request is already refreshing — queue this one
      return new Promise<T>((resolve, reject) => {
        refreshQueue.push((newToken) => {
          if (newToken) {
            resolve(request<T>(path, options, false));
          } else {
            reject({ message: 'Session expired. Please log in again.', status: 401 } as ApiError);
          }
        });
      });
    }

    if (!res.ok) {
      let message = `Request failed (${res.status})`;
      try {
        const body = await res.json();
        message = body?.message ?? message;
      } catch { /* non-JSON error body */ }
      throw { message, status: res.status } as ApiError;
    }

    // Empty body (e.g. 204 No Content)
    const text = await res.text();
    if (!text) return {} as T;

    const json = JSON.parse(text);
    // Unwrap { success, data } envelope when present
    return (json?.data !== undefined ? json.data : json) as T;
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err?.status !== undefined) throw err; // already an ApiError

    if (err instanceof DOMException && err.name === 'AbortError') {
      throw { message: 'Request timed out. Please try again.', status: 408 } as ApiError;
    }

    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw {
        message: 'Cannot connect to server. Please check your connection.',
        status: 0,
      } as ApiError;
    }

    throw { message: err?.message ?? 'An unexpected error occurred.', status: 0 } as ApiError;
  }
}

const get  = <T>(path: string) => request<T>(path, { method: 'GET' });
const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) });
const put  = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
const del  = <T>(path: string) => request<T>(path, { method: 'DELETE' });

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface AuthTokens { accessToken: string; refreshToken?: string }
export interface AuthUser   { id: number; email: string; name: string; role: string }
export interface AuthResponse { user: AuthUser; tokens: AuthTokens }

export const authApi = {
  login: (body: { email: string; password: string }) =>
    post<AuthResponse>('/auth/login', { email: body.email, password: body.password }),
  register: (body: { email: string; password: string; name: string; roleEnum?: string }) =>
    post<{ user: AuthUser }>('/auth/register', body),
  logout: () => post<void>('/auth/logout', {}),
  me: () => get<{ user: AuthUser }>('/auth/me'),
};

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export const dashboardApi = {
  getStats:    () => get<any>('/dashboard/stats'),
  getOverview: () => get<any>('/dashboard/overview'),
};

// ---------------------------------------------------------------------------
// Patients
// ---------------------------------------------------------------------------

export const patientsApi = {
  getAll:  (params?: string) => get<any[]>(`/patients${params ? `?${params}` : ''}`),
  getById: (id: string | number) => get<any>(`/patients/${id}`),
  create:  (body: any) => post<any>('/patients', body),
  update:  (id: string | number, body: any) => put<any>(`/patients/${id}`, body),
  delete:  (id: string | number) => del<any>(`/patients/${id}`),
  search:  (q: string) => get<any[]>(`/patients/search?q=${encodeURIComponent(q)}`),
};

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

export const appointmentsApi = {
  getAll:  (params?: string) => get<any[]>(`/appointments${params ? `?${params}` : ''}`),
  getById: (id: string | number) => get<any>(`/appointments/${id}`),
  create:  (body: any) => post<any>('/appointments', body),
  update:  (id: string | number, body: any) => put<any>(`/appointments/${id}`, body),
  delete:  (id: string | number) => del<any>(`/appointments/${id}`),
};

// ---------------------------------------------------------------------------
// Staff / Doctors
// ---------------------------------------------------------------------------

export const staffApi = {
  getAll:     (params?: string) => get<any[]>(`/staff${params ? `?${params}` : ''}`),
  getById:    (id: string | number) => get<any>(`/staff/${id}`),
  create:     (body: any) => post<any>('/staff', body),
  update:     (id: string | number, body: any) => put<any>(`/staff/${id}`, body),
  delete:     (id: string | number) => del<any>(`/staff/${id}`),
  getDoctors: () => get<any[]>('/staff?role=doctor'),
};

// ---------------------------------------------------------------------------
// OPD / IPD
// ---------------------------------------------------------------------------

export const opdApi = {
  getAll:  (params?: string) => get<any[]>(`/opd${params ? `?${params}` : ''}`),
  getById: (id: string | number) => get<any>(`/opd/${id}`),
  create:  (body: any) => post<any>('/opd', body),
  update:  (id: string | number, body: any) => put<any>(`/opd/${id}`, body),
  delete:  (id: string | number) => del<any>(`/opd/${id}`),
};

export const ipdApi = {
  getAll:     (params?: string) => get<any[]>(`/ipd${params ? `?${params}` : ''}`),
  getById:    (id: string | number) => get<any>(`/ipd/${id}`),
  create:     (body: any) => post<any>('/ipd', body),
  update:     (id: string | number, body: any) => put<any>(`/ipd/${id}`, body),
  discharge:  (id: string | number, body: any) => put<any>(`/ipd/${id}/discharge`, body),
};

// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------

export const billingApi = {
  getAll:  (params?: string) => get<any[]>(`/billing${params ? `?${params}` : ''}`),
  getById: (id: string | number) => get<any>(`/billing/${id}`),
  create:  (body: any) => post<any>('/billing', body),
  update:  (id: string | number, body: any) => put<any>(`/billing/${id}`, body),
  delete:  (id: string | number) => del<any>(`/billing/${id}`),
};

// ---------------------------------------------------------------------------
// Pharmacy
// ---------------------------------------------------------------------------

export const pharmacyApi = {
  getMedicines:          (params?: string) => get<any[]>(`/pharmacy/medicines${params ? `?${params}` : ''}`),
  getMedicineById:       (id: string | number) => get<any>(`/pharmacy/medicines/${id}`),
  createMedicine:        (body: any) => post<any>('/pharmacy/medicines', body),
  updateMedicine:        (id: string | number, body: any) => put<any>(`/pharmacy/medicines/${id}`, body),
  deleteMedicine:        (id: string | number) => del<any>(`/pharmacy/medicines/${id}`),
  getPrescriptions:      () => get<any[]>('/pharmacy/prescriptions'),
  dispensePrescription:  (id: string | number, body: any) => put<any>(`/pharmacy/prescriptions/${id}/dispense`, body),
};

// ---------------------------------------------------------------------------
// Pathology / Radiology
// ---------------------------------------------------------------------------

export const pathologyApi = {
  getAll:        (params?: string) => get<any[]>(`/pathology${params ? `?${params}` : ''}`),
  getById:       (id: string | number) => get<any>(`/pathology/${id}`),
  create:        (body: any) => post<any>('/pathology', body),
  update:        (id: string | number, body: any) => put<any>(`/pathology/${id}`, body),
  delete:        (id: string | number) => del<any>(`/pathology/${id}`),
  getCategories: () => get<any[]>('/pathology/categories'),
};

export const radiologyApi = {
  getAll:        (params?: string) => get<any[]>(`/radiology${params ? `?${params}` : ''}`),
  getById:       (id: string | number) => get<any>(`/radiology/${id}`),
  create:        (body: any) => post<any>('/radiology', body),
  update:        (id: string | number, body: any) => put<any>(`/radiology/${id}`, body),
  delete:        (id: string | number) => del<any>(`/radiology/${id}`),
  getCategories: () => get<any[]>('/radiology/categories'),
};

// ---------------------------------------------------------------------------
// Blood Bank
// ---------------------------------------------------------------------------

export const bloodBankApi = {
  getAll:    () => get<any[]>('/blood-bank'),
  getById:   (id: string | number) => get<any>(`/blood-bank/${id}`),
  create:    (body: any) => post<any>('/blood-bank', body),
  update:    (id: string | number, body: any) => put<any>(`/blood-bank/${id}`, body),
  delete:    (id: string | number) => del<any>(`/blood-bank/${id}`),
  getDonors: () => get<any[]>('/blood-bank/donors'),
  issueBlood:(body: any) => post<any>('/blood-bank/issue', body),
};

// ---------------------------------------------------------------------------
// Ambulance / Vehicles
// ---------------------------------------------------------------------------

export const ambulanceApi = {
  getCalls: () => get<any[]>('/ambulance'),
  getById:  (id: string | number) => get<any>(`/ambulance/${id}`),
  create:   (body: any) => post<any>('/ambulance', body),
  update:   (id: string | number, body: any) => put<any>(`/ambulance/${id}`, body),
  delete:   (id: string | number) => del<any>(`/ambulance/${id}`),
};

export const vehiclesApi = {
  getAll:  () => get<any[]>('/vehicles'),
  create:  (body: any) => post<any>('/vehicles', body),
  update:  (id: string | number, body: any) => put<any>(`/vehicles/${id}`, body),
  delete:  (id: string | number) => del<any>(`/vehicles/${id}`),
};

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

export const inventoryApi = {
  getItems:     (params?: string) => get<any[]>(`/inventory${params ? `?${params}` : ''}`),
  getById:      (id: string | number) => get<any>(`/inventory/${id}`),
  create:       (body: any) => post<any>('/inventory', body),
  update:       (id: string | number, body: any) => put<any>(`/inventory/${id}`, body),
  delete:       (id: string | number) => del<any>(`/inventory/${id}`),
  getCategories:() => get<any[]>('/inventory/categories'),
  getStores:    () => get<any[]>('/inventory/stores'),
  getSuppliers: () => get<any[]>('/inventory/suppliers'),
};

// ---------------------------------------------------------------------------
// Finance
// ---------------------------------------------------------------------------

export const financeApi = {
  getIncome:       (params?: string) => get<any[]>(`/finance/income${params ? `?${params}` : ''}`),
  createIncome:    (body: any) => post<any>('/finance/income', body),
  updateIncome:    (id: string | number, body: any) => put<any>(`/finance/income/${id}`, body),
  deleteIncome:    (id: string | number) => del<any>(`/finance/income/${id}`),
  getExpenses:     (params?: string) => get<any[]>(`/finance/expenses${params ? `?${params}` : ''}`),
  createExpense:   (body: any) => post<any>('/finance/expenses', body),
  updateExpense:   (id: string | number, body: any) => put<any>(`/finance/expenses/${id}`, body),
  deleteExpense:   (id: string | number) => del<any>(`/finance/expenses/${id}`),
  getIncomeHeads:  () => get<any[]>('/finance/income-heads'),
  getExpenseHeads: () => get<any[]>('/finance/expense-heads'),
};

// ---------------------------------------------------------------------------
// Departments / Beds / Charges
// ---------------------------------------------------------------------------

export const departmentsApi = {
  getAll:  () => get<any[]>('/departments'),
  getById: (id: string | number) => get<any>(`/departments/${id}`),
  create:  (body: any) => post<any>('/departments', body),
  update:  (id: string | number, body: any) => put<any>(`/departments/${id}`, body),
  delete:  (id: string | number) => del<any>(`/departments/${id}`),
};

export const bedsApi = {
  getBeds:      () => get<any[]>('/beds'),
  getBedGroups: () => get<any[]>('/beds/groups'),
  getBedTypes:  () => get<any[]>('/beds/types'),
  create:       (body: any) => post<any>('/beds', body),
  update:       (id: string | number, body: any) => put<any>(`/beds/${id}`, body),
  delete:       (id: string | number) => del<any>(`/beds/${id}`),
  allocate:     (body: any) => post<any>('/beds/allocate', body),
  release:      (id: string | number) => put<any>(`/beds/${id}/release`, {}),
};

export const chargesApi = {
  getAll:        () => get<any[]>('/charges'),
  getCategories: () => get<any[]>('/charges/categories'),
  create:        (body: any) => post<any>('/charges', body),
  update:        (id: string | number, body: any) => put<any>(`/charges/${id}`, body),
  delete:        (id: string | number) => del<any>(`/charges/${id}`),
};

// ---------------------------------------------------------------------------
// Operation Theatre
// ---------------------------------------------------------------------------

export const otApi = {
  getAll:  (params?: string) => get<any[]>(`/operation-theatre${params ? `?${params}` : ''}`),
  getById: (id: string | number) => get<any>(`/operation-theatre/${id}`),
  create:  (body: any) => post<any>('/operation-theatre', body),
  update:  (id: string | number, body: any) => put<any>(`/operation-theatre/${id}`, body),
  delete:  (id: string | number) => del<any>(`/operation-theatre/${id}`),
};

// ---------------------------------------------------------------------------
// Front Office
// ---------------------------------------------------------------------------

export const visitorsApi = {
  getAll:  () => get<any[]>('/visitors'),
  create:  (body: any) => post<any>('/visitors', body),
  update:  (id: string | number, body: any) => put<any>(`/visitors/${id}`, body),
  delete:  (id: string | number) => del<any>(`/visitors/${id}`),
};

export const complaintsApi = {
  getAll:  () => get<any[]>('/complaints'),
  create:  (body: any) => post<any>('/complaints', body),
  update:  (id: string | number, body: any) => put<any>(`/complaints/${id}`, body),
  delete:  (id: string | number) => del<any>(`/complaints/${id}`),
};

export const enquiriesApi = {
  getAll:  () => get<any[]>('/enquiries'),
  create:  (body: any) => post<any>('/enquiries', body),
  update:  (id: string | number, body: any) => put<any>(`/enquiries/${id}`, body),
  delete:  (id: string | number) => del<any>(`/enquiries/${id}`),
};

// ---------------------------------------------------------------------------
// Birth / Death Reports
// ---------------------------------------------------------------------------

export const birthReportsApi = {
  getAll:  () => get<any[]>('/birth-reports'),
  create:  (body: any) => post<any>('/birth-reports', body),
  update:  (id: string | number, body: any) => put<any>(`/birth-reports/${id}`, body),
  delete:  (id: string | number) => del<any>(`/birth-reports/${id}`),
};

export const deathReportsApi = {
  getAll:  () => get<any[]>('/death-reports'),
  create:  (body: any) => post<any>('/death-reports', body),
  update:  (id: string | number, body: any) => put<any>(`/death-reports/${id}`, body),
  delete:  (id: string | number) => del<any>(`/death-reports/${id}`),
};

// ---------------------------------------------------------------------------
// TPA / Messaging / Notifications / Events / Todos
// ---------------------------------------------------------------------------

export const tpaApi = {
  getAll:  () => get<any[]>('/tpa'),
  create:  (body: any) => post<any>('/tpa', body),
  update:  (id: string | number, body: any) => put<any>(`/tpa/${id}`, body),
  delete:  (id: string | number) => del<any>(`/tpa/${id}`),
};

export const messagingApi = {
  getAll:  () => get<any[]>('/messaging'),
  send:    (body: any) => post<any>('/messaging', body),
  delete:  (id: string | number) => del<any>(`/messaging/${id}`),
};

export const notificationsApi = {
  getAll:      () => get<any[]>('/notifications'),
  markRead:    (id: string | number) => put<any>(`/notifications/${id}/read`, {}),
  markAllRead: () => put<any>('/notifications/read-all', {}),
};

export const eventsApi = {
  getAll:  (params?: string) => get<any[]>(`/events${params ? `?${params}` : ''}`),
  create:  (body: any) => post<any>('/events', body),
  update:  (id: string | number, body: any) => put<any>(`/events/${id}`, body),
  delete:  (id: string | number) => del<any>(`/events/${id}`),
};

export const todosApi = {
  getAll:  () => get<any[]>('/calendar/todos'),
  create:  (body: any) => post<any>('/calendar/todos', body),
  update:  (id: string | number, body: any) => put<any>(`/calendar/todos/${id}`, body),
  delete:  (id: string | number) => del<any>(`/calendar/todos/${id}`),
};

// ---------------------------------------------------------------------------
// Reports / Download Center / Settings / Upload
// ---------------------------------------------------------------------------

export const reportsApi = {
  getPatientReport:     (params: string) => get<any>(`/reports/patients?${params}`),
  getAppointmentReport: (params: string) => get<any>(`/reports/appointments?${params}`),
  getFinancialReport:   (params: string) => get<any>(`/reports/financial?${params}`),
  getPathologyReport:   (params: string) => get<any>(`/reports/pathology?${params}`),
  getRadiologyReport:   (params: string) => get<any>(`/reports/radiology?${params}`),
  getInventoryReport:   (params: string) => get<any>(`/reports/inventory?${params}`),
};

export const downloadCenterApi = {
  getFiles: () => get<any[]>('/download-center'),
  upload:   (formData: FormData) =>
    request<any>('/download-center/upload', { method: 'POST', body: formData }),
  delete:   (id: string | number) => del<any>(`/download-center/${id}`),
};

export const settingsApi = {
  get:               () => get<any>('/settings'),
  save:              (body: any) => post<any>('/settings', body),
  update:            (body: any) => put<any>('/settings', body),
  getEmailConfig:    () => get<any>('/settings/email-config'),
  updateEmailConfig: (body: any) => put<any>('/settings/email-config', body),
  getSmsConfig:      () => get<any>('/settings/sms-config'),
  updateSmsConfig:   (body: any) => put<any>('/settings/sms-config', body),
  testEmail:         (body: any) => post<any>('/settings/test-email', body),
  testSms:           (body: any) => post<any>('/settings/test-sms', body),
  createBackup:      () => post<any>('/settings/backup', {}),
  restoreBackup:     (body: any) => post<any>('/settings/restore', body),
};

export const uploadApi = {
  upload: (formData: FormData) =>
    request<any>('/upload', { method: 'POST', body: formData }),
};
