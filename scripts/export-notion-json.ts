import fs from "fs/promises";
import path from "path";

// CSV-only exporter: read CSV files from `data/input/` and emit a simplified JSON
// at `data/notion-standards.json` containing only actions, jobs, phases, and standards
// with relation ids.

const OUT_DIR = path.resolve(process.cwd(), "data");
const OUT_FILE = path.join(OUT_DIR, "notion-standards.json");

async function fileExists(p: string) {
  try {
    const st = await fs.stat(p);
    return st.isFile() || st.isDirectory();
  } catch {
    return false;
  }
}

/**
 * CSV parser that preserves quoted fields containing newlines.
 * Returns array of rows (header -> value).
 */
function parseCsv(text: string): Array<Record<string, string>> {
  const rows: string[][] = [];
  let curRow: string[] = [];
  let curField = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < text.length && text[i + 1] === '"') {
        curField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "\r") {
      continue;
    } else if (ch === "\n") {
      if (inQuotes) {
        curField += "\n";
      } else {
        curRow.push(curField);
        rows.push(curRow);
        curRow = [];
        curField = "";
      }
    } else if (ch === "," && !inQuotes) {
      curRow.push(curField);
      curField = "";
    } else {
      curField += ch;
    }
  }

  // push remaining
  curRow.push(curField);
  if (curRow.length > 1 || (rows.length === 0 && curRow.length === 1 && curRow[0] !== "")) rows.push(curRow);

  if (rows.length === 0) return [];
  const headers = rows[0].map(h => (h ?? "").toString().trim());
  const out: Array<Record<string, string>> = [];
  for (let r = 1; r < rows.length; r++) {
    const rowArr = rows[r] || [];
    while (rowArr.length < headers.length) rowArr.push("");
    const row: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) row[headers[c]] = (rowArr[c] ?? "").toString().trim();
    out.push(row);
  }
  return out;
}

function findHeaderKey(row: Record<string, string>, candidates: string[]) {
  const keys = Object.keys(row);
  for (const c of candidates) {
    const lower = c.toLowerCase();
    for (const k of keys) {
      if (k.toLowerCase().includes(lower)) return k;
    }
  }
  return null;
}

function splitMaybeListCell(cell: string) {
  if (!cell) return [] as string[];
  return cell
    .split(/[,;|\n]/)
    .map(s => s.trim())
    .filter(Boolean);
}

// Minimal, clear interfaces for output
interface ActionOut {
  id: string;
  title: string | null;
  kpi?: string | null;
  reason?: string | null;
  sources?: string[];
  description?: string | null;
  originalId?: string | null;
}
interface ActionSourceOut {
  id?: string;
  name?: string | null;
  url?: string | null;
}
interface EntityOut {
  id: string;
  title: string | null;
}
interface PhaseOut extends EntityOut {
  sourceDocBetaUrl?: string | null;
  description?: string | null;
}
interface StandardOut {
  id: string;
  title: string | null;
  originalId?: string | null;
  actionIds: string[];
  jobIds: string[];
  couldPhaseIds: string[];
  shouldPhaseIds: string[];
  mustPhaseIds: string[];
  description?: string | null;
}

async function csvExport(): Promise<boolean> {
  const inputDir = path.join(process.cwd(), "data", "input");
  if (!(await fileExists(inputDir))) return false;
  const dirents = await fs.readdir(inputDir);
  const lower = (s: string) => s.toLowerCase();
  const find = (pred: (s: string) => boolean) => dirents.find(pred);

  const standardsFile = find(s => lower(s).includes("standard"));
  const actionsFile = find(s => lower(s).includes("action"));
  const phasesFile = find(s => lower(s).includes("phase"));
  const jobsFile = find(s => lower(s).includes("metier") || lower(s).includes("job"));

  if (!standardsFile || !actionsFile || !phasesFile || !jobsFile) return false;

  const [standardsRaw, actionsRaw, phasesRaw, jobsRaw] = await Promise.all([
    fs.readFile(path.join(inputDir, standardsFile), "utf8"),
    fs.readFile(path.join(inputDir, actionsFile), "utf8"),
    fs.readFile(path.join(inputDir, phasesFile), "utf8"),
    fs.readFile(path.join(inputDir, jobsFile), "utf8"),
  ]);

  const standardsRows = parseCsv(standardsRaw);
  const actionsRows = parseCsv(actionsRaw);
  const phasesRows = parseCsv(phasesRaw);
  const jobsRows = parseCsv(jobsRaw);

  const pickNotionId = (row: Record<string, string>) => {
    const idKey = findHeaderKey(row, ["notion id", "notionid", "id", "uuid"]);
    return idKey ? row[idKey] : "";
  };

  // Explicit header mapping per CSV type to avoid heuristics mistakes.
  const headerCandidates: Record<string, string[]> = {
    actions: ["action", "titre", "title", "name", "label"],
    jobs: ["nom", "name", "title", "label", "job"],
    phases: ["phase", "phase name", "titre", "title", "name"],
    standards: ["standard", "titre", "title", "name"],
  };

  const pickTitleFor = (type: keyof typeof headerCandidates, row: Record<string, string>) => {
    const candidates = headerCandidates[type] || [];
    const k = findHeaderKey(row, candidates);
    if (k) return row[k];
    // fallback: try generic keys
    const generic = findHeaderKey(row, ["title", "name", "label", "nom", "standard"]);
    return generic ? row[generic] : (Object.values(row)[0] ?? "");
  };

  const actionNameToId = new Map<string, string>();
  const jobNameToId = new Map<string, string>();
  const phaseNameToId = new Map<string, string>();

  for (const r of actionsRows) {
    const id = pickNotionId(r);
    const title = pickTitleFor("actions", r);
    if (id && title) actionNameToId.set(title.toLowerCase(), id);
  }
  for (const r of jobsRows) {
    const id = pickNotionId(r);
    const title = pickTitleFor("jobs", r);
    if (id && title) jobNameToId.set(title.toLowerCase(), id);
  }
  for (const r of phasesRows) {
    const id = pickNotionId(r);
    const title = pickTitleFor("phases", r);
    if (id && title) phaseNameToId.set(title.toLowerCase(), id);
  }

  // Build outputs
  const actionsOut: Array<
    ActionOut & { standardBeta?: string | null; typeSources?: ActionSourceOut[]; typeSourceIds?: string[] }
  > = actionsRows.map(r => {
    const id = pickNotionId(r);
    const title = pickTitleFor("actions", r) || null;
    const descKey = findHeaderKey(r, ["description", "content", "page content", "texte", "body", "corps"]);
    const originalIdKey = findHeaderKey(r, ["id", "original id", "reference", "act id"]);
    const kpiKey = findHeaderKey(r, ["kpi", "mesure", "mesures"]);
    const reasonKey = findHeaderKey(r, ["pourquoi", "why", "reason", "raison"]);
    const sourcesKey = findHeaderKey(r, ["source", "sources", "lien", "liens", "url", "urls"]);
    const typeSourceKey = findHeaderKey(r, ["type source", "type_source", "type-source", "type source.name"]);
    const standardBetaKey = findHeaderKey(r, ["standard beta", "standardbeta", "standard-beta"]);

    let sources: string[] | undefined = undefined;
    if (sourcesKey) {
      const raw = splitMaybeListCell(r[sourcesKey]);
      const urlRx = /^https?:\/\//i;
      sources = raw.filter(s => urlRx.test(s) && !/notion\.so|notion\.site/i.test(s));
      if (sources.length === 0) sources = undefined;
    }

    // parse type sources into structured objects
    let typeSources: ActionSourceOut[] | undefined = undefined;
    if (typeSourceKey) {
      const raw = splitMaybeListCell(r[typeSourceKey]);
      const urlRx = /https?:\/\//i;
      const arr: ActionSourceOut[] = [];
      for (const t of raw) {
        let name = t;
        let url: string | null = null;
        // extract parenthetical url if present
        const m = /\s*\((https?:\/\/[^)]+)\)\s*$/i.exec(t);
        if (m) {
          url = m[1];
          name = t.replace(m[0], "").trim();
        } else if (urlRx.test(t)) {
          url = t.trim();
          name = "";
        }
        const item: ActionSourceOut = {};
        if (name) item.name = name;
        if (url) item.url = url;
        if (Object.keys(item).length) arr.push(item);
      }
      if (arr.length) typeSources = arr;
    }

    const outBase: ActionOut = {
      description: descKey ? r[descKey] || null : undefined,
      id,
      kpi: kpiKey ? r[kpiKey] || null : undefined,
      originalId: originalIdKey ? r[originalIdKey] || null : undefined,
      reason: reasonKey ? r[reasonKey] || null : undefined,
      sources,
      title,
    };

    const out: ActionOut & { standardBeta?: string | null; typeSources?: ActionSourceOut[] } = {
      ...outBase,
    };
    if (standardBetaKey) out.standardBeta = r[standardBetaKey] || null;
    if (typeSources) out.typeSources = typeSources;
    return out;
  });

  // Aggregate unique action sources and assign ids, add `typeSourceIds` per action
  const actionSourceMap = new Map<string, { id: string; name?: string | null; url?: string | null }>();
  const actionSources: Array<{ id: string; name?: string | null; url?: string | null }> = [];
  let actionSourceCounter = 1;
  for (const a of actionsOut) {
    if (!a.typeSources || a.typeSources.length === 0) continue;
    const ids: string[] = [];
    for (const ts of a.typeSources) {
      const key = `${ts.name ?? ""}||${ts.url ?? ""}`;
      if (!actionSourceMap.has(key)) {
        const id = `actionsource__${actionSourceCounter++}`;
        const entry = { id, name: ts.name ?? null, url: ts.url ?? null };
        actionSourceMap.set(key, entry);
        actionSources.push(entry);
      }
      ids.push(actionSourceMap.get(key)!.id);
    }
    a.typeSourceIds = Array.from(new Set(ids));
  }

  const jobsOut: Array<EntityOut & { description?: string | null; originalId?: string | null }> = jobsRows.map(r => {
    const id = pickNotionId(r);
    const title = pickTitleFor("jobs", r) || null;
    const descKey = findHeaderKey(r, ["description", "content", "texte", "body", "corps"]);
    const originalIdKey = findHeaderKey(r, ["id", "original id", "reference"]);
    return {
      description: descKey ? r[descKey] || null : undefined,
      id,
      originalId: originalIdKey ? r[originalIdKey] || null : undefined,
      title,
    };
  });
  const phasesOut: PhaseOut[] = phasesRows.map(r => {
    const id = pickNotionId(r);
    const title = pickTitleFor("phases", r) || null;
    const sourceKey = findHeaderKey(r, ["source doc beta", "source_doc_beta", "source-doc-beta"]);
    const sourceDocBetaUrl = sourceKey ? r[sourceKey] || null : undefined;
    const descKey = findHeaderKey(r, ["description", "content", "texte", "body", "corps"]);
    const description = descKey ? r[descKey] || null : undefined;
    return { description, id, sourceDocBetaUrl, title };
  });

  const standardsOut: StandardOut[] = [];
  for (const r of standardsRows) {
    const id = pickNotionId(r);
    const title = pickTitleFor("standards", r) || null;
    const originalIdKey = findHeaderKey(r, ["id", "original id", "std", "reference"]);
    const originalId = originalIdKey ? r[originalIdKey] || null : undefined;
    const descKey = findHeaderKey(r, ["description", "content", "texte", "body", "corps"]);
    const description = descKey ? r[descKey] || null : undefined;

    const actionCells: string[] = [];
    const jobCells: string[] = [];
    const couldPhaseCells: string[] = [];
    const shouldPhaseCells: string[] = [];
    const mustPhaseCells: string[] = [];

    for (const [col, val] of Object.entries(r)) {
      const cl = col.toLowerCase();
      if (cl.includes("action")) actionCells.push(val);
      else if (cl.includes("metier") || cl.includes("métier") || cl.includes("job")) jobCells.push(val);
      else if (cl.includes("phase could")) couldPhaseCells.push(val);
      else if (cl.includes("phase should")) shouldPhaseCells.push(val);
      else if (cl.includes("phase must")) mustPhaseCells.push(val);
      else if (cl === "phase" || cl === "phases") couldPhaseCells.push(val);
    }

    const resolveTokens = (cells: string[]) => {
      const ids: string[] = [];
      const urlRx = /https?:\/\/[^)\s]+/i;
      const notionIdRx =
        /([0-9a-fA-F]{32}|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/;

      for (const c of cells) {
        for (const tokenRaw of splitMaybeListCell(c)) {
          let token = String(tokenRaw).trim();
          if (!token) continue;

          // If the token itself is a UUID-like id, accept it.
          const maybeIdMatch = notionIdRx.exec(token);
          if (maybeIdMatch) {
            ids.push(maybeIdMatch[1].replace(/-/g, ""));
            continue;
          }

          // Remove parenthetical URLs and any inline URLs to normalize the token for name-matching.
          token = token
            .replace(/\s*\([^)]*https?:\/\/[^)]*\)/gi, "")
            .replace(urlRx, "")
            .trim();
          if (!token) continue;

          const low = token.toLowerCase();

          if (actionNameToId.has(low)) ids.push(actionNameToId.get(low)!);
          else if (jobNameToId.has(low)) ids.push(jobNameToId.get(low)!);
          else if (phaseNameToId.has(low)) ids.push(phaseNameToId.get(low)!);
        }
      }
      return Array.from(new Set(ids));
    };

    const actionIds = resolveTokens(actionCells);
    const jobIds = resolveTokens(jobCells);
    const couldPhaseIds = resolveTokens(couldPhaseCells);
    const shouldPhaseIds = resolveTokens(shouldPhaseCells);
    const mustPhaseIds = resolveTokens(mustPhaseCells);

    const std: StandardOut = {
      actionIds,
      couldPhaseIds,
      id,
      jobIds,
      mustPhaseIds,
      originalId: originalId ?? undefined,
      // attach description if present
      // Note: keep `originalId` key for compatibility
      ...(description
        ? {
            /* description */
          }
        : {}),
      shouldPhaseIds,
      title,
    };
    if (description) std.description = description;
    standardsOut.push(std);
  }

  const out = {
    actions: actionsOut,
    actionSources,
    exportedAt: new Date().toISOString(),
    jobs: jobsOut,
    phases: phasesOut,
    standards: standardsOut,
  };

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(out, null, 2), "utf8");
  console.log(`Wrote CSV-driven export to ${OUT_FILE}`);
  return true;
}

async function main() {
  const ok = await csvExport();
  if (!ok) {
    console.error("CSV export failed — ensure CSV files (Standards/Actions/Phases/Jobs) are present in data/input/");
    process.exit(2);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
