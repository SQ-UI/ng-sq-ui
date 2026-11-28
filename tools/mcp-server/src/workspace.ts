import { constants } from 'node:fs';
import { lstat, mkdir, open, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { UiError } from './errors';
import { digest } from './registry';
import type { Changeset, FileChange, ValidationReport } from './types';
import type { UiSpec } from './schema';
import type { Theme } from './theme';

export interface Artifact { id: string; directory: string; spec: UiSpec; themeId: string; fileHashes: Record<string, string>; report?: ValidationReport }
export class Workspace {
  private constructor(readonly root: string) {}
  static async open(directory: string) { return new Workspace(await realpath(directory)); }
  async resolve(relative: string, internal = false): Promise<string> {
    if (!relative || path.isAbsolute(relative) || relative.includes('\\') || /[\p{Cc}:]/u.test(relative) || relative.split('/').some(segment => !segment || ['.', '..'].includes(segment)) || (!internal && relative.split('/')[0] === '.sq-ui-mcp')) throw new UiError('INVALID_PATH', `Invalid workspace path: ${relative}`);
    let current = this.root;
    for (const segment of relative.split('/')) {
      current = path.join(current, segment);
      try { if ((await lstat(current)).isSymbolicLink()) throw new UiError('SYMLINK_PATH', `Symlinks are not allowed in output paths: ${relative}`); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    }
    return current;
  }
  async hash(relative: string) { try { return digest(await readFile(await this.resolve(relative))); } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null; throw error; } }
  private async storage(kind: string, id: string) {
    if (!/^[a-z0-9-]{1,100}$/.test(id) || !['changesets', 'artifacts', 'themes', 'reports'].includes(kind)) throw new UiError('INVALID_ID', 'Invalid stored object ID');
    return this.resolve(`.sq-ui-mcp/${kind}/${id}.json`, true);
  }
  async save<T>(kind: string, id: string, object: T): Promise<void> {
    const filename = await this.storage(kind, id);
    await mkdir(path.dirname(filename), { recursive: true });
    const temporary = `${filename}.${randomUUID()}.tmp`;
    await writeFile(temporary, JSON.stringify(object, null, 2) + '\n', { flag: 'wx' });
    await rename(temporary, filename);
  }
  async load<T>(kind: string, id: string): Promise<T> {
    try { return JSON.parse(await readFile(await this.storage(kind, id), 'utf8')) as T; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw new UiError('UNKNOWN_ID', `Unknown ${kind} ID: ${id}`); throw error; }
  }
  async optionalArtifact(directory: string): Promise<Artifact | undefined> {
    try { return await this.load<Artifact>('artifacts', this.artifactId(directory)); } catch (error) { if (error instanceof UiError && error.code === 'UNKNOWN_ID') return undefined; throw error; }
  }
  artifactId(directory: string) { return `ui-${digest(directory).slice(0, 24)}`; }
  async prepare(directory: string, files: Record<string, string>, artifact: Artifact, editableFiles: string[] = []): Promise<Changeset> {
    await this.resolve(directory);
    const previous = await this.optionalArtifact(directory);
    const changes: FileChange[] = [];
    for (const [relative, content] of Object.entries(files).sort(([left], [right]) => left.localeCompare(right))) {
      const baseHash = await this.hash(relative);
      if (baseHash !== null && baseHash !== digest(content) && !editableFiles.includes(relative) && previous?.fileHashes[relative] !== baseHash) throw new UiError('USER_CHANGES', `File has existing changes: ${relative}`);
      changes.push({ path: relative, content, baseHash });
    }
    const changeset: Changeset = { id: `change-${randomUUID()}`, artifactId: artifact.id, directory, files: changes, createdAt: new Date().toISOString(), diagnostics: [] };
    // Bind artifact metadata to the changeset; applying an older plan cannot publish newer metadata.
    await this.save('changesets', changeset.id, { ...changeset, artifact });
    return changeset;
  }
  async apply(id: string): Promise<{ artifactId: string; written: string[]; unchanged: string[] }> {
    const stored = await this.load<Changeset & { artifact: Artifact }>('changesets', id);
    if (stored.id !== id || stored.artifactId !== this.artifactId(stored.directory)) throw new UiError('INVALID_CHANGESET', 'Changeset identity does not match its output directory');
    const written: string[] = [], unchanged: string[] = [];
    for (const change of stored.files) {
      const current = await this.hash(change.path);
      if (stored.appliedAt) {
        if (current !== digest(change.content)) throw new UiError('STALE_CHANGESET', `Applied file has changed: ${change.path}`);
        unchanged.push(change.path);
      } else if (current !== change.baseHash) throw new UiError('STALE_CHANGESET', `File changed after planning: ${change.path}`);
    }
    if (stored.appliedAt) return { artifactId: stored.artifactId, written, unchanged };
    const backups = new Map<string, Buffer | null>();
    try {
      for (const change of stored.files) {
        if (change.baseHash === digest(change.content)) { unchanged.push(change.path); continue; }
        const filename = await this.resolve(change.path);
        backups.set(change.path, change.baseHash === null ? null : await readFile(filename));
        await mkdir(path.dirname(filename), { recursive: true });
        if (change.baseHash === null) {
          const handle = await open(filename, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o644);
          try { await handle.writeFile(change.content); } finally { await handle.close(); }
        } else {
          const temporary = `${filename}.${randomUUID()}.tmp`;
          await writeFile(temporary, change.content, { flag: 'wx' });
          await rename(temporary, filename);
        }
        written.push(change.path);
      }
      const artifact = stored.artifact;
      artifact.fileHashes = { ...artifact.fileHashes, ...Object.fromEntries(stored.files.map(change => [change.path, digest(change.content)])) };
      await this.save('artifacts', artifact.id, artifact);
      stored.appliedAt = new Date().toISOString();
      await this.save('changesets', stored.id, stored);
      return { artifactId: stored.artifactId, written, unchanged };
    } catch (error) {
      for (const relative of written.reverse()) {
        const filename = await this.resolve(relative);
        const backup = backups.get(relative);
        if (backup === null) await rm(filename, { force: true });
        else if (backup) await writeFile(filename, backup);
      }
      throw error;
    }
  }
  async saveTheme(theme: Theme) { await this.save('themes', theme.id, theme); return theme; }
  async inspect() {
    const readJson = async (filename: string) => {
      try { return JSON.parse(await readFile(await this.resolve(filename), 'utf8')) as Record<string, unknown>; } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null; throw error; }
    };
    const packageJson = await readJson('package.json');
    const angularJson = await readJson('angular.json');
    return { root: this.root, packageJson, angularJson, lockfiles: (await Promise.all(['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'].map(async file => await this.hash(file) ? file : null))).filter(Boolean) };
  }
}
