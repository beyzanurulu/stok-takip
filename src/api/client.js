const API_BASE = import.meta.env.VITE_API_URL || "";
const __DEV__ = import.meta.env.DEV;
const debugLog = (...args) => { if (__DEV__) console.log(...args); };

export async function fetchJson(path, options = {}) {
  const headers = options.headers || {};
  const isJson = options.body && typeof options.body === "object";
  
  // Token'ı localStorage'dan al ve süresini kontrol et
  const token = localStorage.getItem('authToken');
  const isExpired = (() => {
    try {
      if (!token) return false;
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      if (!payload || !payload.exp) return false;
      const nowSec = Math.floor(Date.now() / 1000);
      return payload.exp <= nowSec;
    } catch {
      return false;
    }
  })();

  if (isExpired) {
    try {
      localStorage.removeItem('authToken');
      window.dispatchEvent(new Event('auth:expired'));
      console.warn('Auth expired (client check) -> token cleared');
    } catch {}
  }
  
  const finalHeaders = {
    "Accept": "application/json",
    ...(isJson ? { "Content-Type": "application/json" } : {}),
    // Birçok backend "Authorization" ister, bazıları ise "Authentication" bekler.
    // Her iki header'ı da ekleyerek uyumluluk sağlıyoruz.
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(token ? { "Authentication": `Bearer ${token}` } : {}),
    ...headers,
  };

  debugLog("API Request:", {
    url: `${API_BASE}${path}`,
    method: options.method || 'GET',
    headers: finalHeaders,
    body: options.body
  });

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: finalHeaders,
    body: isJson ? JSON.stringify(options.body) : options.body,
  });

  debugLog("API Response:", {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error("API Error Response:", text);
    if (response.status === 401 || response.status === 403) {
      try {
        localStorage.removeItem('authToken');
        window.dispatchEvent(new Event('auth:expired'));
        console.warn("Auth expired -> token cleared, redirecting to login.");
      } catch {}
    }
    throw new Error(`HTTP ${response.status} ${response.statusText} - ${text}`);
  }
  if (response.status === 204) return null;
  
  // En sağlam yöntem: önce metin olarak oku, sonra JSON parse dene; başarısızsa metni döndür
  const raw = await response.text();
  try {
    const parsed = JSON.parse(raw);
    debugLog("API JSON Response:", parsed);
    return parsed;
  } catch {
    debugLog("API TEXT Response:", raw);
    return raw;
  }
}

