import { type RequestCookies, type ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { type ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

import { config } from "@/config";

export const setAuthCookie = (cookies: ResponseCookies) => {
  cookies.set({
    httpOnly: true,
    name: config.security.adminCookieName,
    secure: process.env.NODE_ENV === "production",
    value: `${Date.now() + config.security.adminCookieMaxAge}`,
  });
};

export const getAuthCookie = (cookies: ReadonlyRequestCookies | RequestCookies) => {
  return cookies.get(config.security.adminCookieName);
};

export const isAuthCookieExpired = (cookies: ReadonlyRequestCookies | RequestCookies) => {
  const authCookie = getAuthCookie(cookies);
  if (!authCookie) return true;
  return parseInt(authCookie.value) < Date.now();
};

export const deleteAuthCookie = (cookies: ResponseCookies) => {
  cookies.delete(config.security.adminCookieName);
};
