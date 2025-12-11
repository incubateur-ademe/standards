import { ensureApiEnvVar, ensureNextEnvVar } from "@/utils/os";
import { isTruthy } from "@/utils/string";

export const config = {
  _dbUrl: ensureApiEnvVar(process.env.DATABASE_URL, ""),
  _seeding: ensureApiEnvVar(process.env._SEEDING, isTruthy, false),
  admin: {
    login: ensureApiEnvVar(process.env.ADMIN_LOGIN, ""),
    password: ensureApiEnvVar(process.env.ADMIN_PASSWORD, ""),
  },
  appVersion: ensureNextEnvVar(process.env.NEXT_PUBLIC_APP_VERSION, "dev"),
  appVersionCommit: ensureNextEnvVar(process.env.NEXT_PUBLIC_APP_VERSION_COMMIT, "unknown"),
  betaGouvUrl: ensureApiEnvVar(process.env.BETA_GOUV_URL, "https://beta.gouv.fr"),
  brand: {
    ministry: ensureNextEnvVar(process.env.NEXT_PUBLIC_BRAND_MINISTRY, "République\nFrançaise"),
    name: "Standards",
    operator: {
      enable: ensureNextEnvVar(process.env.NEXT_PUBLIC_BRAND_OPERATOR_ENABLE, isTruthy, true),
      logo: {
        alt: ensureNextEnvVar(process.env.NEXT_PUBLIC_BRAND_OPERATOR_LOGO_ALT, "ADEME"),
        imgUrl: ensureNextEnvVar(process.env.NEXT_PUBLIC_BRAND_OPERATOR_LOGO_URL, "/img/Incubateur-with-bg.png"),
        orientation: ensureNextEnvVar<"horizontal" | "vertical">(
          process.env.NEXT_PUBLIC_BRAND_OPERATOR_LOGO_ORIENTATION,
          "horizontal",
        ),
      },
    },
    tagline: "Standards de l'Accelérateur de la Transition Écologique",
  },
  env: ensureApiEnvVar<"dev" | "prod" | "review" | "staging">(process.env.APP_ENV, "dev"),
  host: ensureNextEnvVar(process.env.NEXT_PUBLIC_SITE_URL, "http://localhost:3000"),
  maintenance: ensureApiEnvVar(process.env.MAINTENANCE_MODE, isTruthy, false),
  repositoryUrl: ensureNextEnvVar(
    process.env.NEXT_PUBLIC_REPOSITORY_URL,
    "https://github.com/incubateur-ademe/standards",
  ),
  get rootDomain() {
    return this.host.replace(/^(https?:\/\/)?(www\.)?/, "");
  },
  security: {
    adminCookieMaxAge: ensureApiEnvVar(process.env.SECURITY_ADMIN_COOKIE_MAX_AGE, parseInt, 1000 * 60 * 60),
    adminCookieName: ensureApiEnvVar(process.env.SECURITY_ADMIN_COOKIE_NAME, "standards-admin-auth"),
  },
} as const;
