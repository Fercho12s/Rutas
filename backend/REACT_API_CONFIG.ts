// =====================================================
// src/lib/api.ts - CONFIGURACIÓN API PARA REACT
// =====================================================
// Copiar este archivo a tu proyecto React
// Cambiar API_BASE_URL según tu servidor

const API_BASE_URL = 'http://localhost/rutasseguras/backend'; // ⚠️ Cambiar según tu servidor

// =============== CLASE DE ERROR PERSONALIZADO ===============
export class APIError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

// =============== FUNCIÓN HELPER PARA REQUESTS ===============
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Agregar token si existe
  const token = localStorage.getItem('token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  // Si hay error, lanzar excepción
  if (!response.ok) {
    // Si es 401, limpiar token (sesión expirada)
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    throw new APIError(
      response.status,
      data.message || 'Error en la solicitud'
    );
  }

  return data;
}

// =============== FUNCIONES DE AUTENTICACIÓN ===============
export const authAPI = {
  /**
   * Registrar nuevo usuario
   */
  register: async (
    name: string,
    email: string,
    password: string,
    phone?: string,
    role: 'cliente' | 'conductor' | 'admin' = 'cliente'
  ) => {
    return apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone, role }),
    });
  },

  /**
   * Iniciar sesión
   */
  login: async (email: string, password: string) => {
    return apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Cerrar sesión
   */
  logout: async () => {
    return apiCall('/api/auth/logout', { method: 'POST' });
  },

  /**
   * Obtener perfil del usuario autenticado
   */
  getProfile: async () => {
    return apiCall('/api/auth/me', { method: 'GET' });
  },

  /**
   * Actualizar perfil
   */
  updateProfile: async (name?: string, phone?: string) => {
    const body: any = {};
    if (name) body.name = name;
    if (phone) body.phone = phone;

    return apiCall('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  /**
   * Cambiar contraseña
   */
  changePassword: async (oldPassword: string, newPassword: string) => {
    return apiCall('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  },
};

// =============== FUNCIONES DE RUTAS ===============
export const routesAPI = {
  /**
   * Buscar rutas por origen y destino
   */
  search: async (origin: string, destination: string, page: number = 1) => {
    const params = new URLSearchParams({
      origin,
      destination,
      page: page.toString(),
    });

    return apiCall(`/api/routes/search?${params.toString()}`);
  },

  /**
   * Obtener sugerencias de origen
   */
  suggestOrigins: async () => {
    return apiCall('/api/routes/suggestions/origins');
  },

  /**
   * Obtener sugerencias de destino
   */
  suggestDestinations: async () => {
    return apiCall('/api/routes/suggestions/destinations');
  },

  /**
   * Crear nueva ruta (requiere rol admin)
   */
  create: async (
    title: string,
    origin: string,
    destination: string,
    distanceKm: number,
    duration?: string
  ) => {
    return apiCall('/api/routes/create', {
      method: 'POST',
      body: JSON.stringify({
        title,
        origin,
        destination,
        distanceKm,
        duration,
      }),
    });
  },

  /**
   * Obtener todas las rutas (admin)
   */
  getAll: async (page: number = 1) => {
    return apiCall(`/api/routes?page=${page}`);
  },

  /**
   * Obtener ruta por ID
   */
  getById: async (id: number) => {
    return apiCall(`/api/routes/${id}`);
  },

  /**
   * Actualizar ruta (admin)
   */
  update: async (
    id: number,
    data: {
      titulo?: string;
      origen?: string;
      destino?: string;
      distancia_km?: number;
      duracion_estimada?: string;
      estado?: string;
    }
  ) => {
    return apiCall(`/api/routes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Eliminar ruta (admin)
   */
  delete: async (id: number) => {
    return apiCall(`/api/routes/${id}`, { method: 'DELETE' });
  },

  /**
   * Obtener rutas populares
   */
  getPopular: async (limit: number = 10) => {
    return apiCall(`/api/routes/popular?limit=${limit}`);
  },
};

// =============== TIPOS TYPESCRIPT (Opcional) ===============
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'cliente' | 'conductor' | 'admin';
  phone?: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Route {
  id: number;
  titulo: string;
  origen: string;
  destino: string;
  distancia_km: number;
  duracion_estimada?: string;
  estado: 'activo' | 'en_curso' | 'finalizado' | 'inactivo';
  fecha_creacion: string;
  usuario_id?: number;
}

export interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SearchResponse {
  routes: Route[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
  query: {
    origin: string;
    destination: string;
  };
}

// =============== FUNCIÓN HELPER PARA MANEJO DE ERRORES ===============
export function getErrorMessage(error: unknown): string {
  if (error instanceof APIError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Error desconocido';
}

// =============== FUNCIÓN HELPER PARA GUARDAR USUARIO ===============
export function saveUser(user: User, token: string): void {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

// =============== FUNCIÓN HELPER PARA OBTENER USUARIO ===============
export function getStoredUser(): User | null {
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;

  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

// =============== FUNCIÓN HELPER PARA LIMPIAR SESIÓN ===============
export function clearSession(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
