import { basRhin } from "./bas-rhin";
import { moselle } from "./moselle";
import type { DepartmentTourismContent } from "./types";

export const DEPARTMENT_TOURISM_CONTENT: Record<string, DepartmentTourismContent> = {
  [basRhin.code]: basRhin,
  [moselle.code]: moselle,
};

export function getDepartmentTourismContent(code?: string) {
  return code ? (DEPARTMENT_TOURISM_CONTENT[code] ?? null) : null;
}

export type { DepartmentTourismContent } from "./types";
