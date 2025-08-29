import { fetchJson } from "./client.js";

// Kullanıcı kayıt
export function register(userData) {
  return fetchJson("/auth/register", {
    method: "POST",
    body: userData,
  });
}

// Kullanıcı giriş
export function login(credentials) {
  return fetchJson("/auth/login", {
    method: "POST",
    body: credentials,
  });
}

// Token'ı localStorage'a kaydet
export function saveToken(token) {
  localStorage.setItem('authToken', token);
}

// Token'ı localStorage'dan al
export function getToken() {
  return localStorage.getItem('authToken');
}

// Token'ı temizle (çıkış)
export function clearToken() {
  localStorage.removeItem('authToken');
}

// Kullanıcının giriş yapıp yapmadığını kontrol et
export function isAuthenticated() {
  return !!getToken();
}
