import fs from "fs/promises";
import path from "path";

import { prisma } from "@/lib/db/prisma";

const DATA_FILE = path.resolve(process.cwd(), "data/notion-standards.json");

interface SimplifiedExport {
  actionSources?: Array<{ id: string; name?: string | null; url?: string | null }>;
  actions: Array<{
    id: string;
    title?: string | null;
    description?: string | null;
    notionId?: string | null;
    kpi?: string | null;
    reason?: string | null;
    sources?: string[];
    typeSourceIds?: string[];
  }>;
  jobs: Array<{ id: string; title?: string | null; description?: string | null; notionId?: string | null }>;
  phases: Array<{
    id: string;
    title?: string | null;
    description?: string | null;
    sourceDocBetaUrl?: string | null;
    notionId?: string | null;
  }>;
  standards: Array<{
    id: string;
    title?: string | null;
    notionId?: string | null;
    actionIds?: string[];
    jobIds?: string[];
    couldPhaseIds?: string[];
    shouldPhaseIds?: string[];
    mustPhaseIds?: string[];
  }>;
}

async function main() {
  const raw = await fs.readFile(DATA_FILE, "utf8");
  const data = JSON.parse(raw) as SimplifiedExport;

  const notionPhaseToPrismaId = new Map<string, string>();
  for (const p of data.phases ?? []) {
    const jsonId = p.id;
    const notionId = p.notionId ?? p.id;
    const name = p.title ?? null;
    const description = p.description ?? null;
    const sourceDocBetaUrl = p.sourceDocBetaUrl ?? null;

    let up;
    const existing = await prisma.phase.findFirst({ where: { notionId } });
    if (existing) {
      up = await prisma.phase.update({
        data: { description, name, notionId, sourceDocBetaUrl },
        where: { id: existing.id },
      });
    } else {
      up = await prisma.phase.create({ data: { description, name, notionId, sourceDocBetaUrl } });
    }
    notionPhaseToPrismaId.set(jsonId, up.id);
  }

  const notionJobToPrismaId = new Map<string, string>();
  for (const j of data.jobs ?? []) {
    const jsonId = j.id;
    const notionId = j.notionId ?? j.id;
    const name = j.title ?? null;
    const description = j.description ?? null;

    let up;
    const existing = await prisma.job.findFirst({ where: { notionId } });
    if (existing) {
      up = await prisma.job.update({ data: { description, name, notionId }, where: { id: existing.id } });
    } else {
      up = await prisma.job.create({ data: { description, name, notionId } });
    }
    notionJobToPrismaId.set(jsonId, up.id);
  }

  const notionActionToPrismaId = new Map<string, string>();
  const notionActionSourceToPrismaId = new Map<string, string>();
  for (const asrc of data.actionSources ?? []) {
    const id = asrc.id;
    const name = asrc.name ?? null;
    const url = asrc.url ?? null;
    const existing = await prisma.actionSource.findFirst({ where: { OR: [{ name }, { url }] } });
    let up;
    if (existing) {
      up = await prisma.actionSource.update({ data: { name, url }, where: { id: existing.id } });
    } else {
      up = await prisma.actionSource.create({ data: { name, url } });
    }
    notionActionSourceToPrismaId.set(id, up.id);
  }

  const notionStandardToPrismaId = new Map<string, string>();
  for (const s of data.standards ?? []) {
    const jsonId = s.id;
    const notionId = s.notionId ?? s.id;
    const title = s.title ?? null;
    const description = null;

    const couldPid = notionPhaseToPrismaId.get(s.couldPhaseIds?.[0] ?? "") ?? undefined;
    const shouldPid = notionPhaseToPrismaId.get(s.shouldPhaseIds?.[0] ?? "") ?? undefined;
    const mustPid = notionPhaseToPrismaId.get(s.mustPhaseIds?.[0] ?? "") ?? undefined;

    let up;
    const existing = await prisma.standard.findFirst({ where: { notionId } });
    const dataForStandard = {
      couldHavePhaseId: couldPid,
      description,
      mustHavePhaseId: mustPid,
      notionId,
      shouldHavePhaseId: shouldPid,
      title,
    };
    if (existing) {
      up = await prisma.standard.update({ data: dataForStandard, where: { id: existing.id } });
    } else {
      up = await prisma.standard.create({ data: dataForStandard });
    }
    notionStandardToPrismaId.set(jsonId, up.id);
  }
  for (const a of data.actions ?? []) {
    const id = a.id;
    const notionId = a.notionId ?? a.id;
    const description = a.description ?? null;
    const title = a.title ?? null;
    const kpi = a.kpi ?? null;
    const reason = a.reason ?? null;
    const sources = a.sources ?? [];
    const typeSourceConnect = (a.typeSourceIds ?? [])
      .map(id => notionActionSourceToPrismaId.get(id) ?? id)
      .filter((v): v is string => Boolean(v))
      .map(id => ({ id }));

    let up;
    const standardJson = (data.standards ?? []).find(st => (st.actionIds ?? []).includes(id));
    const prismaStandardId = standardJson ? notionStandardToPrismaId.get(standardJson.id) : undefined;

    const baseData = {
      description: description ?? undefined,
      kpi: kpi ?? undefined,
      notionId,
      reason: reason ?? undefined,
      sources: { connect: typeSourceConnect },
      sourcesUrls: sources,
      title: title ?? undefined,
    } as const;

    const existing = await prisma.action.findFirst({ where: { notionId } });
    if (existing) {
      up = await prisma.action.update({
        data: prismaStandardId ? { ...baseData, standard: { connect: { id: prismaStandardId } } } : baseData,
        where: { id: existing.id },
      });
    } else {
      up = await prisma.action.create({
        data: prismaStandardId ? { ...baseData, standard: { connect: { id: prismaStandardId } } } : baseData,
      });
    }
    notionActionToPrismaId.set(id, up.id);
  }

  for (const s of data.standards ?? []) {
    const title = s.title ?? null;
    const description = null;
    const notionId = s.notionId ?? s.id;

    const couldPid = notionPhaseToPrismaId.get(s.couldPhaseIds?.[0] ?? "") ?? undefined;
    const shouldPid = notionPhaseToPrismaId.get(s.shouldPhaseIds?.[0] ?? "") ?? undefined;
    const mustPid = notionPhaseToPrismaId.get(s.mustPhaseIds?.[0] ?? "") ?? undefined;

    let up;
    const existing = await prisma.standard.findFirst({ where: { notionId } });
    const dataForStandard = {
      couldHavePhaseId: couldPid,
      description,
      mustHavePhaseId: mustPid,
      notionId,
      shouldHavePhaseId: shouldPid,
      title,
    };
    if (existing) {
      up = await prisma.standard.update({ data: dataForStandard, where: { id: existing.id } });
    } else {
      up = await prisma.standard.create({ data: dataForStandard });
    }

    const jobConnects = (s.jobIds ?? [])
      .map(id => notionJobToPrismaId.get(id))
      .filter((v): v is string => Boolean(v))
      .map(id => ({ id }));
    if (jobConnects.length) {
      await prisma.standard.update({ data: { roles: { connect: jobConnects } }, where: { id: up.id } });
    }

    const actionConnects = (s.actionIds ?? [])
      .map(id => notionActionToPrismaId.get(id))
      .filter((v): v is string => Boolean(v))
      .map(id => ({ id }));
    if (actionConnects.length) {
      await prisma.standard.update({ data: { actions: { connect: actionConnects } }, where: { id: up.id } });
    }
  }

  console.log("Seed completed (simplified JSON).");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
