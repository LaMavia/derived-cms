import { DbInterface } from "./class/DbInterface";
/**
 * This file is a sort of workaround the .d.ts import issue.
 * They don't allow for importing classes etc.
 */
export interface KoaConext {
  db: DbInterface
}