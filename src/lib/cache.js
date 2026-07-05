/**
 * cache.js — Envoltorio de caché en memoria y deduplicación de peticiones para Money Trees.
 * Evita llamadas redundantes a Supabase cuando el usuario navega entre pestañas.
 */

const cacheStore = new Map();
const pendingRequests = new Map();

/**
 * Ejecuta una petición con caché en memoria y deduplicación (evita peticiones concurrentes idénticas).
 * @param {string} key - Clave única de la consulta (ej. 'accounts_user123').
 * @param {Function} fetcher - Función asíncrona que realiza la petición a Supabase.
 * @param {number} [ttlMs=180000] - Tiempo de vida de la caché en milisegundos (3 minutos por defecto).
 * @param {boolean} [forceRefresh=false] - Forzar actualización ignorando la caché.
 * @returns {Promise<any>}
 */
export async function fetchWithCache(key, fetcher, ttlMs = 180000, forceRefresh = false) {
  const now = Date.now();

  // 1. Verificar caché existente si no se fuerza recarga
  if (!forceRefresh && cacheStore.has(key)) {
    const cached = cacheStore.get(key);
    if (now - cached.timestamp < ttlMs) {
      return cached.data;
    }
  }

  // 2. Deduplicación: si hay una petición idéntica en vuelo, esperamos esa promesa
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  // 3. Ejecutar petición y almacenar en caché y en pending
  const requestPromise = (async () => {
    try {
      const result = await fetcher();
      cacheStore.set(key, { data: result, timestamp: Date.now() });
      return result;
    } finally {
      pendingRequests.delete(key);
    }
  })();

  pendingRequests.set(key, requestPromise);
  return requestPromise;
}

/**
 * Invalida una clave o prefijo de clave en la caché (ej. cuando se crea/edita una cuenta o categoría).
 * @param {string} prefix - Clave o prefijo a invalidar (ej. 'accounts_' o 'categories_').
 */
export function invalidateCache(prefix) {
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  }
}

/**
 * Limpia toda la caché (ej. al cerrar sesión).
 */
export function clearAllCache() {
  cacheStore.clear();
  pendingRequests.clear();
}
