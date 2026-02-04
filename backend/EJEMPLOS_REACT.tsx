// =====================================================
// EJEMPLOS PRÁCTICOS DE USO EN REACT
// =====================================================

// =============== EJEMPLO 1: COMPONENTE DE LOGIN ===============

import { useState } from 'react';
import { authAPI, saveUser, getErrorMessage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function LoginExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);

      // Guardar token y usuario
      saveUser(response.data.user, response.data.token);

      toast({
        title: '¡Bienvenido!',
        description: `Hola, ${response.data.user.name}`,
      });

      // Redirigir
      window.location.href = '/dashboard';
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
}

// =============== EJEMPLO 2: COMPONENTE DE REGISTRO ===============

export function RegisterExample() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.register(
        formData.name,
        formData.email,
        formData.password,
        formData.phone
      );

      // Guardar y redirigir
      saveUser(response.data.user, response.data.token);

      toast({
        title: '¡Cuenta creada!',
        description: 'Tu cuenta ha sido registrada exitosamente',
      });

      window.location.href = '/dashboard';
    } catch (error) {
      toast({
        title: 'Error en el registro',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Nombre completo"
        required
      />
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Contraseña"
        required
      />
      <input
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Teléfono (opcional)"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Registrando...' : 'Crear Cuenta'}
      </button>
    </form>
  );
}

// =============== EJEMPLO 3: COMPONENTE DE BÚSQUEDA DE RUTAS ===============

import { useEffect, useState } from 'react';
import { routesAPI } from '@/lib/api';
import type { Route } from '@/lib/api';

export function RouteSearchExample() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [results, setResults] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [origins, setOrigins] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const { toast } = useToast();

  // Cargar sugerencias al montar el componente
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const [originsRes, destinationsRes] = await Promise.all([
          routesAPI.suggestOrigins(),
          routesAPI.suggestDestinations(),
        ]);

        setOrigins(originsRes.data.map((item: any) => item.origen));
        setDestinations(
          destinationsRes.data.map((item: any) => item.destino)
        );
      } catch (error) {
        console.error('Error cargando sugerencias:', error);
      }
    };

    loadSuggestions();
  }, []);

  // Buscar rutas
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!origin || !destination) {
      toast({
        title: 'Campos requeridos',
        description: 'Completa origen y destino',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await routesAPI.search(origin, destination);
      setResults(response.data.routes);

      if (response.data.routes.length === 0) {
        toast({
          title: 'Sin resultados',
          description: 'No encontramos rutas disponibles',
        });
      } else {
        toast({
          title: '¡Rutas encontradas!',
          description: `Se encontraron ${response.data.routes.length} rutas`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Formulario de búsqueda */}
      <form onSubmit={handleSearch}>
        <select
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          required
        >
          <option value="">Selecciona origen</option>
          {origins.map((orig) => (
            <option key={orig} value={orig}>
              {orig}
            </option>
          ))}
        </select>

        <select
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          required
        >
          <option value="">Selecciona destino</option>
          {destinations.map((dest) => (
            <option key={dest} value={dest}>
              {dest}
            </option>
          ))}
        </select>

        <button type="submit" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar Rutas'}
        </button>
      </form>

      {/* Resultados */}
      {results.length > 0 && (
        <div className="mt-4">
          <h2>Rutas disponibles</h2>
          {results.map((route) => (
            <div
              key={route.id}
              className="border p-4 rounded mb-2"
            >
              <h3>{route.titulo}</h3>
              <p>
                <strong>Origen:</strong> {route.origen}
              </p>
              <p>
                <strong>Destino:</strong> {route.destino}
              </p>
              <p>
                <strong>Distancia:</strong> {route.distancia_km} km
              </p>
              <p>
                <strong>Duración estimada:</strong>{' '}
                {route.duracion_estimada}
              </p>
              <p>
                <strong>Estado:</strong> {route.estado}
              </p>
              <button
                onClick={() =>
                  toast({
                    title: 'Próximamente',
                    description: 'Función de reserva en desarrollo',
                  })
                }
              >
                Reservar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============== EJEMPLO 4: COMPONENTE DE PERFIL ===============

import { useEffect } from 'react';
import { getStoredUser, authAPI, clearSession } from '@/lib/api';

export function ProfileExample() {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Cargar perfil actualizado del servidor
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        setUser(response.data);
      } catch (error) {
        console.error('Error cargando perfil:', error);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    setLoading(true);

    try {
      await authAPI.logout();
      clearSession();
      window.location.href = '/';
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <p>Cargando perfil...</p>;
  }

  return (
    <div>
      <h2>Mi Perfil</h2>
      <p>
        <strong>Nombre:</strong> {user.name}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <p>
        <strong>Teléfono:</strong> {user.phone || 'No especificado'}
      </p>
      <p>
        <strong>Rol:</strong> {user.role}
      </p>
      <button onClick={handleLogout} disabled={loading}>
        {loading ? 'Cerrando...' : 'Cerrar Sesión'}
      </button>
    </div>
  );
}

// =============== EJEMPLO 5: HOOK PERSONALIZADO PARA AUTENTICACIÓN ===============

import { useContext } from 'react';

export function useAuth() {
  const user = getStoredUser();
  const token = localStorage.getItem('token');

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    isDriver: user?.role === 'conductor',
  };
}

// Uso en componentes
export function AdminOnlyComponent() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <p>No tienes permisos para acceder a esta sección</p>;
  }

  return <div>Contenido solo para admins</div>;
}
