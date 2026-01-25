import fs from "fs/promises";
import path from "path";

import { prisma } from "@/lib/db/prisma";

import { parseCsv } from "./csvParser";
import {
  ACTION_MAPPING,
  buildPhaseMap,
  buildJobMap,
  resolveRoleConnect,
  resolvePhaseId,
  type NotionActionKeys,
  type NotionActionPayload,
} from "./util";

async function main() {
  const root = process.cwd();
  const inputDir = path.join(root, "data", "input");
  const actionFile = path.join(inputDir, "action.csv");
  const phaseFile = path.join(inputDir, "phase.csv");
  const metierFile = path.join(inputDir, "metier.csv");

  const exists = async (p: string) => {
    try {
      await fs.access(p);
      return true;
    } catch {
      return false;
    }
  };

  if (!(await exists(actionFile))) {
    console.error("Fichier attendu: data/input/action.csv — renomme ton CSV et relance le seed");
    process.exit(1);
  }

  const actions = (await parseCsv(actionFile)) as Array<Record<NotionActionKeys, string>>;
  const phases = (await exists(phaseFile)) ? await parseCsv(phaseFile) : [];
  const metiers = (await exists(metierFile)) ? await parseCsv(metierFile) : [];

  console.log(`Parsed ${actions.length} actions, ${phases.length} phases, ${metiers.length} jobs`);

  // Build phase map (creates phases from CSV rows)
  const phaseMap = await buildPhaseMap(phases);

  // Build job map (creates/updates jobs from CSV rows)
  const jobMap = await buildJobMap(metiers);

  // ActionSource handled by util: `ensureSource(name, url)`

  let i = 0;
  for (const row of actions) {
    i++;
    const payload = await Object.keys(row).reduce<Promise<NotionActionPayload>>(
      async (accP, col) => {
        const acc = await accP;
        if (!(col in ACTION_MAPPING)) return acc;
        const fn = ACTION_MAPPING[col as NotionActionKeys];
        if (!fn) return acc;
        try {
          const out = await fn(row[col as NotionActionKeys], row);
          return Object.assign(acc, out);
        } catch {
          return acc;
        }
      },
      Promise.resolve({} as NotionActionPayload),
    );

    // payload contains the merged mapper outputs; use it directly below when creating the record

    const roleConnect = await resolveRoleConnect(jobMap, Array.isArray(payload.roles) ? payload.roles.map(String) : []);

    const sourceConnect = Array.isArray(payload.sources) ? payload.sources.map(id => ({ id })) : [];

    // phases: use mapped phase fields from mappers (`couldHavePhase`, `shouldHavePhase`, `mustHavePhase`)
    const phaseData: Record<string, string | undefined> = {};
    const could = (payload.couldHavePhase as string) || undefined;
    if (could) phaseData.couldHavePhaseId = await resolvePhaseId(phaseMap, could);
    const should = (payload.shouldHavePhase as string) || undefined;
    if (should) phaseData.shouldHavePhaseId = await resolvePhaseId(phaseMap, should);
    const must = (payload.mustHavePhase as string) || undefined;
    if (must) phaseData.mustHavePhaseId = await resolvePhaseId(phaseMap, must);

    const dataForCreate = {
      kpi: payload.kpi! || undefined,
      notionId: payload.notionId! || undefined,
      reason: payload.reason! || undefined,
      roles: { connect: roleConnect },
      sources: { connect: sourceConnect },
      sourcesUrls: Array.isArray(payload.sourcesUrls) ? payload.sourcesUrls.map(String) : [],
      standardBeta: payload.standardBeta! || undefined,
      standards: Array.isArray(payload.standards) ? payload.standards.map(String) : [],
      title: payload.title! || undefined,
      ...phaseData,
    };

    await prisma.action.create({ data: dataForCreate });
    if (i % 100 === 0) console.log(`Inserted ${i} actions`);
  }

  console.log(`Done. Inserted ${i} actions.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
