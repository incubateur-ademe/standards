import { prisma } from "@/lib/db/prisma";
import { type $JobPayload, type $PhasePayload, type $ActionPayload } from "@/prisma/models";
import { type PromiseOrNot } from "@/utils/types";

export type NotionActionKeys =
  | "ACTION Phase Could"
  | "ACTION Phase Must"
  | "ACTION Phase Should"
  | "Action"
  | "ID"
  | "KPI / Mesure"
  | "Métier(s)"
  | "Notion ID"
  | "Pourquoi ?"
  | "Source"
  | "Standard (tag)"
  | "Standard Beta"
  | "Type source";
export type NotionActionPayload = Partial<
  $ActionPayload["scalars"] & Record<keyof $ActionPayload["objects"], string[] | string | null>
>;
export type NotionActionMapping = Record<
  NotionActionKeys,
  (value: string, row: Record<NotionActionKeys, string>) => PromiseOrNot<NotionActionPayload>
>;

export type NotionPhaseKeys = "Notion ID" | "Phase" | "Source doc beta";
export type NotionPhaseMapping = Record<
  NotionPhaseKeys,
  (value: string, row: Record<NotionPhaseKeys, string>) => PromiseOrNot<Partial<$PhasePayload["scalars"]>>
>;

export type NotionJobKeys = "name" | "Notion ID";
export type NotionJobMapping = Record<
  NotionJobKeys,
  (value: string, row: Record<NotionJobKeys, string>) => PromiseOrNot<Partial<$JobPayload["scalars"]>>
>;

// Helpers for notion cell parsing
function normalizeString(s?: string): string | null {
  if (!s) return null;
  const t = String(s).trim();
  return t === "" ? null : t;
}

export function parseMultiSelectCell(cell?: string): string[] {
  if (!cell) return [];
  return String(cell)
    .split(/[,;|\n]/)
    .map(s => s.replace(/\(https?:.*\)$/, "").trim())
    .filter(Boolean);
}

export function extractUrls(cell: string | null): string[] {
  if (!cell) return [];
  const re = /https?:\/\/[^\s)]+/g;
  return (String(cell).match(re) ?? []).map(String);
}

export function extractNotionIdFromUrl(cell?: string): string | undefined {
  if (!cell) return undefined;
  const s = String(cell).trim();
  // Notion IDs are 32/36 hex chars with dashes, or the cell may already contain the id
  const idRe = /[0-9a-fA-F]{32}|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
  const idMatch = idRe.exec(s);
  if (idMatch) return idMatch[0];
  // fallback: try to extract from URL
  const urlRe = /https?:\/\/[^\s)]+/;
  const urlMatch = urlRe.exec(s);
  if (!urlMatch) return undefined;
  const last = urlMatch[0].split("/").pop();
  if (!last) return undefined;
  const clean = last.replace(/\?.*$/, "").replace(/#.*$/, "");
  const m = idRe.exec(clean);
  return m ? m[0] : undefined;
}

// DB helpers: build maps and resolve relations so seed.ts stays declarative
export async function buildPhaseMap(phases: Array<Record<string, string>>) {
  const phaseMap = new Map<string, string>();
  for (const pRow of phases) {
    // Use explicit columns from phase.csv: "Phase" (name), "Notion ID" (notionId), "Source doc beta" (sourceDocBetaUrl)
    const name = pRow.Phase.trim();
    const notionRaw = pRow["Notion ID"];
    const notionId = extractNotionIdFromUrl(notionRaw);
    const sourceDocBetaUrl = (pRow["Source doc beta"] || "").trim();
    const created = await prisma.phase.create({
      data: {
        description: pRow.description || undefined,
        name: name || undefined,
        notionId: notionId || undefined,
        sourceDocBetaUrl: sourceDocBetaUrl || undefined,
      },
    });
    if (notionId) phaseMap.set(notionId, created.id);
    if (name) phaseMap.set(name.toLowerCase(), created.id);
  }
  return phaseMap;
}

export async function resolvePhaseId(phaseMap: Map<string, string>, val: string) {
  if (!val) return undefined;
  const notion = extractNotionIdFromUrl(val);
  let pid = notion ? phaseMap.get(notion) : undefined;
  if (!pid) {
    const key = val.trim().toLowerCase();
    pid = phaseMap.get(key);
  }
  if (!pid) {
    const name = val
      .replace(/\(https?:.*\)$/, "")
      .trim()
      .slice(0, 200);
    const created = await prisma.phase.create({ data: { name } });
    phaseMap.set(name.toLowerCase(), created.id);
    pid = created.id;
  }
  return pid;
}

export async function buildJobMap(metiers: Array<Record<string, string>>) {
  const jobMap = new Map<string, string>();
  for (const jRow of metiers) {
    const notionId = extractNotionIdFromUrl(jRow["Notion ID"]);
    const name = jRow.Nom.replace(/\(https?:.*\)$/, "")
      .trim()
      .slice(0, 200);

    const whereClauses: Array<Record<string, string>> = [];
    if (notionId) whereClauses.push({ notionId: notionId });
    if (name) whereClauses.push({ name: name });

    let up: { id: string; name?: string | null } | null = null;
    if (whereClauses.length) {
      const existing = await prisma.job.findFirst({ where: { OR: whereClauses } });
      if (existing) {
        const updateData: Record<string, unknown> = {};
        if (name) updateData.name = name;
        if (notionId) updateData.notionId = notionId;
        if (Object.keys(updateData).length) {
          const updated = await prisma.job.update({ data: updateData, where: { id: existing.id } });
          up = { id: updated.id, name: updated.name };
        } else {
          up = { id: existing.id, name: existing.name };
        }
      }
    }
    if (!up) {
      const createData: Record<string, unknown> = {};
      if (name) createData.name = name;
      if (notionId) createData.notionId = notionId;
      const created = await prisma.job.create({ data: createData });
      up = { id: created.id, name: created.name };
    }
    if (up.name) jobMap.set(up.name.toLowerCase(), up.id);
    if (notionId) jobMap.set(notionId, up.id);
  }
  return jobMap;
}

export async function resolveRoleConnect(jobMap: Map<string, string>, roleNames: string[]) {
  const roleConnect: Array<{ id: string }> = [];
  for (const rn of roleNames) {
    const raw = rn || "";
    const key = raw.toLowerCase();
    let id = jobMap.get(key);
    const nameOnly = raw.replace(/\(https?:.*\)$/, "").trim();
    if (!id && nameOnly) id = jobMap.get(nameOnly.toLowerCase());
    if (!id) {
      const rnNotion = extractNotionIdFromUrl(raw);
      if (rnNotion) id = jobMap.get(rnNotion);
    }
    if (id) {
      const jobRec = await prisma.job.findUnique({ where: { id } });
      if (jobRec) {
        if ((!jobRec.name || jobRec.name.trim() === "") && nameOnly) {
          const updated = await prisma.job.update({ data: { name: nameOnly }, where: { id: jobRec.id } });
          if (updated.name) jobMap.set(updated.name.toLowerCase(), updated.id);
        } else if (jobRec.name) {
          jobMap.set(jobRec.name.toLowerCase(), jobRec.id);
        }
      }
      roleConnect.push({ id });
      continue;
    }
    const createName = raw.replace(/\(https?:.*\)$/, "").trim() || undefined;
    const createNotion = extractNotionIdFromUrl(raw) || undefined;
    const created = await prisma.job.create({ data: { name: createName, notionId: createNotion } });
    if (createName) jobMap.set(createName.toLowerCase(), created.id);
    if (createNotion) jobMap.set(createNotion, created.id);
    roleConnect.push({ id: created.id });
  }
  return roleConnect;
}

const _sourceCache = new Map<string, string>();
export async function ensureSource(name: string, url?: string) {
  const key = (name || "").toLowerCase();
  if (_sourceCache.has(key)) return _sourceCache.get(key)!;
  const existing = await prisma.actionSource.findFirst({ where: { OR: [{ name }, { url }] } });
  if (existing) {
    _sourceCache.set(key, existing.id);
    return existing.id;
  }
  const created = await prisma.actionSource.create({ data: { name: name || undefined, url: url || undefined } });
  _sourceCache.set(key, created.id);
  return created.id;
}

export const ACTION_MAPPING: NotionActionMapping = {
  Action: v => ({ title: normalizeString(v) }),
  "ACTION Phase Could": v => ({ couldHavePhase: normalizeString(v) }),
  "ACTION Phase Must": v => ({ mustHavePhase: normalizeString(v) }),
  "ACTION Phase Should": v => ({ shouldHavePhase: normalizeString(v) }),
  ID: v => ({ notionId: normalizeString(v) }),
  "KPI / Mesure": v => ({ kpi: normalizeString(v) }),
  "Métier(s)": v => ({ roles: parseMultiSelectCell(v) }),
  "Notion ID": v => ({ notionId: normalizeString(v) }),
  "Pourquoi ?": v => ({ reason: normalizeString(v) }),
  Source: v => ({ sourcesUrls: extractUrls(normalizeString(v)) }),
  "Standard (tag)": v => ({ standards: parseMultiSelectCell(v) }),
  "Standard Beta": v => ({ standardBeta: normalizeString(v) }),
  "Type source": async v => {
    const items = parseMultiSelectCell(v);
    const ids: string[] = [];
    for (const it of items) {
      const name = it.replace(/\(https?:.*\)$/, "").trim();
      const url = (/https?:\/\/[^\s)]+/.exec(it) ?? [])[0];
      const id = await ensureSource(name, url ?? undefined);
      ids.push(id);
    }
    return { sources: ids };
  },
};
