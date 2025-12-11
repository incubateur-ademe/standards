import { type GetPageResponse, type BlockObjectResponse } from "@notionhq/client";

export interface ExportedStandard {
  id: string;
  page: GetPageResponse;
  blocks: BlockObjectResponse[];
}
export interface ExportedRelated {
  page: GetPageResponse;
  blocks: BlockObjectResponse[];
}

export interface ExportedData {
  databaseId: string;
  exportedAt: string;
  standards: ExportedStandard[];
  related: Record<string, ExportedRelated>;
}
