import { mkdir, readdir, symlink, cp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Registry, Generator, Workspace } from '../build/index.js';

export const root = fileURLToPath(new URL('../../../', import.meta.url));
export const packageDirectory = fileURLToPath(new URL('../', import.meta.url));
export const registry = new Registry(path.join(packageDirectory, 'content/registry.json'));

/** A real isolated consumer: copy only public library packages, reuse toolchain dependencies. */
export async function consumerDependencies(directory) {
  const modules = path.join(directory, 'node_modules');
  await mkdir(modules, { recursive: true });
  for (const entry of await readdir(path.join(root, 'node_modules'))) {
    if (entry === '@sq-ui') continue;
    try { await symlink(path.join(root, 'node_modules', entry), path.join(modules, entry)); } catch (error) { if (error.code !== 'EEXIST') throw error; }
  }
  await mkdir(path.join(modules, '@sq-ui'), { recursive: true });
  for (const module of (await registry.get()).modules.filter(module => !module.package.endsWith('/temporal'))) {
    const name = module.package.slice('@sq-ui/'.length);
    await cp(path.join(root, 'dist', name), path.join(modules, '@sq-ui', name), { recursive: true });
  }
}

export async function fixture(name, spec) {
  const workspace = await Workspace.open(root);
  const generator = new Generator(registry, workspace, path.join(packageDirectory, 'content'));
  const directory = `examples/generated/${name}`;
  const generated = await generator.generate({ ...spec, name, output: { directory } });
  await workspace.apply(generated.changesetId);
  const absolute = path.join(root, directory);
  await consumerDependencies(absolute);
  return { workspace, generator, generated, absolute };
}
