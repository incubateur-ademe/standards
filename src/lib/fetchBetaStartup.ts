import { config } from "@/config";

export interface BetaGouvStartup {
  accessibility_status: string;
  active_members: string[];
  budget_url: string | null;
  contact: string;
  content: string;
  dashlord_url: string | null;
  expired_members: string[];
  id: string;
  impact_url: string | null;
  incubator: string;
  link: string;
  mission: string;
  mon_service_securise: boolean;
  name: string;
  phases: Array<{
    name: string;
    start: string; // ISO date
  }>;
  previous_members: string[];
  redirect_from: string | null;
  repository: string;
  screenshot: string;
  stats_url: string | null;
  techno: string[];
  usertypes: string[];
}

export const fetchBetaStartup = async (id: string) => {
  const res = await fetch(`${config.betaGouvUrl}/api/v3/startups/${id}.json`, {
    next: { revalidate: 3600 }, // 1 hour
  });
  if (!res.ok) {
    console.log("======", `${config.betaGouvUrl}/api/startups/${id}.json`);
    throw new Error(`Failed to fetch startup data for id ${id}: ${res.statusText}`);
  }
  return res.json() as Promise<BetaGouvStartup>;
};
