import { Injectable, signal } from '@angular/core';

export interface User { id: number; name: string; email: string; role: string; active: boolean }
@Injectable({ providedIn: 'root' })
export class WorkspaceStore {
  readonly users = signal<User[]>(Array.from({ length: 18 }, (_, index) => ({
    id: index + 1, name: ['Alex Morgan', 'Sam Rivera', 'Jordan Lee', 'Taylor Kim', 'Casey Chen', 'Robin Patel'][index % 6] + (index >= 6 ? ` ${Math.floor(index / 6) + 1}` : ''),
    email: `member${index + 1}@example.com`, role: index % 3 === 0 ? 'Admin' : 'Member', active: index % 4 !== 0
  })));
  readonly status = signal<'ready' | 'loading' | 'error'>('ready');
  readonly notice = signal('');
  readonly preferences = signal({ name: 'Workspace', email: 'team@example.com', notifications: true });
  save(user: User): void {
    this.users.update(users => users.some(item => item.id === user.id) ? users.map(item => item.id === user.id ? { ...user } : item) : [...users, { ...user, id: Math.max(0, ...users.map(item => item.id)) + 1 }]);
  }
  remove(id: number): void { this.users.update(users => users.filter(user => user.id !== id)); }
  async reload(): Promise<void> { this.status.set('loading'); await new Promise(resolve => setTimeout(resolve, 120)); this.status.set('ready'); }
}
