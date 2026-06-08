import type { Retriever } from "../retriever";
import { MemoryRetriever } from "./memory";

// Por defecto, almacén en memoria (vacío). Puéblalo con .add() o
// sustitúyelo por PrismaRetriever con setRetriever().
let instance: Retriever = new MemoryRetriever();

export function getRetriever(): Retriever {
  return instance;
}

export function setRetriever(r: Retriever): void {
  instance = r;
}

export { MemoryRetriever } from "./memory";
export { PrismaRetriever } from "./prisma";
export type { PrismaLike } from "./prisma";
