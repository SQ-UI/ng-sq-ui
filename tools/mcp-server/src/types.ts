import type { ComponentDemo } from '../../ui-registry/catalog';

export interface Binding {
  name: string; alias: string; binding: string; type: string; required: boolean;
  initializer?: string; description: string; inherited: boolean; generated?: boolean;
}
export interface Declaration {
  declarationId: string; id: string; name: string; kind: string; selector?: string;
  description: string; category: string; imports: { package: string; name: string }[];
  members: Binding[]; inputs: Binding[]; outputs: Binding[]; slots: string[];
  cssProperties: string[]; signature: string; source: string; deprecated?: string;
  supportStatus: string; variants: ComponentDemo['variants'];
  limitations: string[];
}
export interface Snapshot {
  schemaVersion: number; version: string; angularMajor: number; commit: string; sourceDigest: string;
  modules: { package: string; version: string; exports: { name: string; declarationId: string }[] }[];
  declarations: Declaration[]; examples: ComponentDemo[];
  tokens: { name: string; cssProperty: string; value: string; category: string }[];
  documents: { id: string; title: string; markdown: string; source: string }[];
  sourceHashes: Record<string, string>;
}
export interface Diagnostic { code: string; message: string; file?: string; severity: 'error' | 'warning' | 'info' }
export interface FileChange { path: string; content: string; baseHash: string | null }
export interface Changeset {
  id: string; artifactId: string; directory: string; files: FileChange[]; createdAt: string;
  appliedAt?: string; diagnostics: Diagnostic[];
}
export interface CheckResult {
  name: string; status: 'passed' | 'failed' | 'not-run'; command?: string[];
  exitCode?: number | null; output?: string; durationMs?: number;
}
export interface ValidationReport { artifactId?: string; status: 'passed' | 'failed' | 'not-run'; checks: CheckResult[]; createdAt: string }
