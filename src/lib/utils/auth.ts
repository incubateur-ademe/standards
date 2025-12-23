import "server-only";
import { type Session } from "next-auth";
import { forbidden } from "next/navigation";

import { auth } from "@/lib/next-auth/auth";
import { UserRole, type UserStatus } from "@/prisma/enums";

import { JsonifiedError, UnexpectedSessionError } from "./error";
import { type RequireAtLeastOne, type RequireOnlyOne } from "./types";

type RoleCheck = RequireOnlyOne<{ min: UserRole; only: UserRole }>;
type StatusCheck = RequireOnlyOne<{ min: UserStatus; only: UserStatus }>;

type AccessCheck = RequireAtLeastOne<{
  role: RoleCheck;
  status: StatusCheck;
}>;

type AssertParam<T> = T | { check: T; message?: string };

interface AssertSessionParams {
  /** Message par défaut */
  message?: string;
  /** Vérifications d'accès simples (role/status) */
  access?: AssertParam<AccessCheck>;
  /** Utilisation de `forbidden()` de NextJS en cas d’échec. */
  useForbidden?: boolean;
}

const defaultMessage = "Session non trouvée.";

const ROLE_WEIGHT: Record<UserRole, number> = {
  ADMIN: 3,
  REVIEWER: 2,
  USER: 0,
};

const STATUS_WEIGHT: Record<UserStatus, number> = {
  ACTIVE: 2,
  BLOCKED: 1,
  DELETED: 0,
};

function isAssertObj<T>(val: AssertParam<T> | undefined): val is { check: T; message?: string } {
  return typeof val === "object" && val !== null && "check" in val;
}

function fail(useForbidden: boolean, message: string): never {
  if (useForbidden) forbidden();
  const error = new JsonifiedError(new UnexpectedSessionError(message));
  console.log("SERVER ERROR", error);
  throw error;
}

function roleOk(actual: UserRole, expected: RoleCheck): boolean {
  if (expected.only && expected.min) {
    throw new Error("RoleCheck ne peut pas contenir à la fois 'min' et 'only'");
  }
  return expected.only ? actual === expected.only : ROLE_WEIGHT[actual] >= ROLE_WEIGHT[expected.min];
}

function statusOk(actual: UserStatus, expected: StatusCheck): boolean {
  if (expected.only && expected.min) {
    throw new Error("StatusCheck ne peut pas contenir à la fois 'min' et 'only'");
  }
  return expected.only ? actual === expected.only : STATUS_WEIGHT[actual] >= STATUS_WEIGHT[expected.min];
}

/**
 * Vérifie la validité et les autorisations de la session courante.
 *
 * Usage : vérifications simples basées sur le rôle et/ou le statut du
 * `session.user`.
 *
 * Exemple :
 * ```ts
 * await assertSession({ access: { check: { role: { only: 'ADMIN' } } } });
 * ```
 *
 * @param params.access - Vérifications d'accès (role/status) ou `{ check, message? }`.
 * @param params.message - Message d'erreur par défaut (défaut : "Session non trouvée.").
 * @param params.useForbidden - Si `true`, appelle `forbidden()` au lieu de lancer une erreur.
 * @returns La `Session` si les vérifications passent.
 * @throws `UnexpectedSessionError` ou exécute `forbidden()` si les vérifications échouent.
 */
export const assertSession = async ({
  access,
  message = defaultMessage,
  useForbidden = false,
}: AssertSessionParams = {}): Promise<Session> => {
  const session = await auth();
  if (!session?.user) {
    fail(useForbidden, message);
  }

  if (session.user.isSuperAdmin) {
    return session; // super-admin, bypass all checks
  }

  // If no additional access checks were provided, return the session
  if (!access) return session;

  // normalize
  let accessToCheck: AccessCheck;
  let accessMessage = message;
  if (isAssertObj(access)) {
    accessToCheck = access.check;
    accessMessage = access.message ?? message;
  } else {
    accessToCheck = access;
  }

  // Run checks directly against session user (no tenant/root/inherit)
  if (accessToCheck.role && !roleOk(session.user.role, accessToCheck.role)) {
    fail(useForbidden, accessMessage);
  }

  if (accessToCheck.status && !statusOk(session.user.status, accessToCheck.status)) {
    fail(useForbidden, accessMessage);
  }

  return session;
};

/**
 * Spécialisation d’`assertSession` pour vérifier que l’utilisateur courant est admin global.
 *
 * @param useForbidden - Si `true`, exécute `forbidden()` en cas d’échec. Sinon, lève `UnexpectedSessionError`. Par défaut : `true`.
 * @returns La `Session` si l’utilisateur est admin global.
 * @throws `UnexpectedSessionError` ou exécute `forbidden()` si l’utilisateur n’est pas admin global.
 */
export const assertAdmin = async (useForbidden = true): Promise<Session> =>
  assertSession({ access: { check: { role: { min: UserRole.ADMIN } } }, useForbidden });
