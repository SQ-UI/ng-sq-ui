import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import type { Snapshot } from './types';
import { UiError, requireValue } from './errors';

export const digest = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
export class Registry {
  private loadedAt = 0;
  private value?: Snapshot;
  constructor(readonly filename: string, readonly ttlMs = 360000) {}
  async get(version?: string): Promise<Snapshot> {
    if (!this.value || Date.now() - this.loadedAt >= this.ttlMs) {
      const record = JSON.parse(await readFile(this.filename, 'utf8')) as { digest: string; snapshot: Snapshot };
      if (record.snapshot?.schemaVersion !== 1 || digest(JSON.stringify(record.snapshot)) !== record.digest) throw new UiError('INVALID_REGISTRY', 'Registry schema or integrity check failed');
      this.value = record.snapshot;
      this.loadedAt = Date.now();
    }
    if (version && version !== this.value.version) throw new UiError('VERSION_UNAVAILABLE', `Version ${version} is unavailable`, { available: [this.value.version] });
    return this.value;
  }
  async component(id: string, version?: string) {
    const snapshot = await this.get(version);
    return requireValue(snapshot.declarations.find(entry => [entry.id, entry.name, entry.selector, entry.declarationId].some(value => value?.toLowerCase() === id.toLowerCase())), 'UNKNOWN_COMPONENT', `Unknown public declaration: ${id}`);
  }
  async example(id: string, variant?: string, version?: string) {
    const snapshot = await this.get(version);
    const entry = await this.component(id, version);
    const demo = requireValue(snapshot.examples.find(example => example.exportName === entry.name), 'EXAMPLE_UNAVAILABLE', `No runnable example for ${id}; read its API and compose it explicitly`);
    const selected = requireValue(variant ? demo.variants.find(item => item.id === variant) : demo.variants[0], 'UNKNOWN_VARIANT', `Unknown variant ${variant} of ${id}`);
    return { demo, variant: selected };
  }
}

export function score(text: string, query: string): number {
  const haystack = text.toLowerCase();
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return 1;
  const words = haystack.split(/[^a-z0-9-]+/);
  return terms.reduce((result, term) => {
    if (!result) return 0;
    if (haystack.includes(term)) return result + 10;
    if (term.length >= 4 && words.some(word => distance(term, word) <= 1)) return result + 1;
    return 0;
  }, 1);
}
function distance(left: string, right: string): number {
  if (Math.abs(left.length - right.length) > 1) return 2;
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let row = 1; row <= left.length; row++) {
    const next = [row];
    for (let column = 1; column <= right.length; column++) next[column] = Math.min(next[column - 1] + 1, previous[column] + 1, previous[column - 1] + Number(left[row - 1] !== right[column - 1]));
    previous = next;
  }
  return previous[right.length];
}
export function page<T>(items: T[], cursor = 0, limit = 30) {
  return { items: items.slice(cursor, cursor + limit), total: items.length, ...(cursor + limit < items.length ? { nextCursor: cursor + limit } : {}) };
}
