import { LRUCache } from "lru-cache";
import { type Adapter, type AdapterUser, type VerificationToken } from "next-auth/adapters";

type SentVerificationToken = Omit<VerificationToken, "expires">;

const tokenCache = new LRUCache<string, VerificationToken>({
  allowStale: false,
  max: 1000,
  noDeleteOnStaleGet: false,
  ttl: 24 * 60 * 60 * 1000,
  updateAgeOnGet: false,
  updateAgeOnHas: false,
});

const userCache = new LRUCache<string, AdapterUser>({
  allowStale: false,
  max: 1000,
  noDeleteOnStaleGet: false,
  ttl: 36 * 60 * 60 * 1000,
  updateAgeOnGet: false,
  updateAgeOnHas: false,
});

export const LRUCacheAdapater: Adapter = {
  /** Creates a session for the user and returns it. */
  async createSession(session) {
    return Promise.resolve(session);
  },

  async createUser(user) {
    userCache.set(user.email, { ...user, id: user.id || user.email });
    return Promise.resolve(userCache.get(user.email)!);
  },

  async createVerificationToken(verificationToken: VerificationToken): Promise<VerificationToken | null | undefined> {
    tokenCache.set(verificationToken.identifier, verificationToken);
    return Promise.resolve(verificationToken);
  },

  /**
   * Deletes a session from the database.
   * It is preferred that this method also returns the session
   * that is being deleted for logging purposes.
   */
  async deleteSession(_) {
    return Promise.resolve(null);
  },

  async getSessionAndUser(_) {
    return Promise.resolve(null);
  },

  async getUser(_) {
    return Promise.resolve(null);
  },

  /** Using the provider id and the id of the user for a specific account, get the user. */
  async getUserByAccount(_): Promise<AdapterUser | null> {
    return Promise.resolve(null);
  },

  async getUserByEmail(email) {
    const user = userCache.get(email) ?? null;
    return Promise.resolve(user);
  },

  async linkAccount(_) {
    return Promise.resolve(_);
  },

  async updateSession(_) {
    return Promise.resolve(null);
  },

  async updateUser(user) {
    return Promise.resolve(user as AdapterUser);
  },

  /**
   * Return verification token from the database
   * and delete it so it cannot be used again.
   */
  async useVerificationToken({ identifier, token }: SentVerificationToken): Promise<VerificationToken | null> {
    const foundToken = tokenCache.get(identifier);
    if (foundToken?.token === token) {
      tokenCache.delete(identifier);
      return Promise.resolve(foundToken);
    }

    return null;
  },
};
