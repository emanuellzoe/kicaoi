// Minimal browser stubs so localStorage-backed modules (streak, plotMemory)
// can run under the node test environment without pulling in jsdom.
import { beforeEach } from "vitest";

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

const storage = new MemoryStorage();

// Expose a `window` and `localStorage` global so modules guarded by
// `typeof window === "undefined"` execute their real browser code path.
(globalThis as Record<string, unknown>).window = globalThis;
(globalThis as Record<string, unknown>).localStorage = storage;

beforeEach(() => {
  storage.clear();
});
