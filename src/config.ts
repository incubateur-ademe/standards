import { ensureApiEnvVar, ensureNextEnvVar } from "@/utils/os";
import { isTruthy } from "@/utils/string";

export const config = {
  _dbUrl: ensureApiEnvVar(process.env.DATABASE_URL, ""),
  _seeding: ensureApiEnvVar(process.env._SEEDING, isTruthy, false),
  admins: ensureApiEnvVar(
    process.env.ADMINS,
    v =>
      v
        .trim()
        .split(",")
        .map(a => a.trim())
        .filter(Boolean),
    ["lilian.sagetlethias", "julien.bouqillon"],
  ),
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
  espaceMembre: {
    apiKey: ensureApiEnvVar(process.env.ESPACE_MEMBRE_API_KEY, ""),
    url: ensureApiEnvVar(process.env.ESPACE_MEMBRE_URL, "https://espace-membre.incubateur.net"),
  },
  host: ensureNextEnvVar(process.env.NEXT_PUBLIC_SITE_URL, "http://localhost:3000"),
  mailer: {
    // TODO: change
    from: ensureApiEnvVar(process.env.MAILER_FROM_EMAIL, "Roadmaps <noreply@roadmap.beta.gouv.fr>"),
    host: ensureApiEnvVar(process.env.MAILER_SMTP_HOST, "127.0.0.1"),
    smtp: {
      login: ensureApiEnvVar(process.env.MAILER_SMTP_LOGIN, ""),
      password: ensureApiEnvVar(process.env.MAILER_SMTP_PASSWORD, ""),
      port: ensureApiEnvVar(process.env.MAILER_SMTP_PORT, Number, 1025),
      ssl: ensureApiEnvVar(process.env.MAILER_SMTP_SSL, isTruthy, false),
    },
  },
  maintenance: ensureApiEnvVar(process.env.MAINTENANCE_MODE, isTruthy, false),
  repositoryUrl: ensureNextEnvVar(
    process.env.NEXT_PUBLIC_REPOSITORY_URL,
    "https://github.com/incubateur-ademe/standards",
  ),
  get rootDomain() {
    return this.host.replace(/^(https?:\/\/)?(www\.)?/, "");
  },
  security: {
    auth: {
      secret: ensureApiEnvVar(process.env.SECURITY_JWT_SECRET, "secret"),
    },
    webhook: {
      secret: ensureApiEnvVar(process.env.SECURITY_WEBHOOK_SECRET, "secret"),
    },
  },
} as const;
