/** Edge-safe session checks — re-exports from middleware-auth for backward compatibility. */
export {
  DEMO_SESSION_COOKIE,
  DEMO_SESSION_HEADER,
  isProtectedAppPath,
  isDemoModeEnv,
  hasValidJwtSession,
  hasDemoSession,
  isRequestAuthenticated,
  verifyAccessFromRequest,
  hasRefreshCookie,
  buildRefreshRedirectUrl,
  isPublicApiPath,
  isProtectedApiPath,
} from "@/server/auth/middleware-auth"
