/**
 * Request de-duplication for the browser.
 *
 * Several components often ask for the same endpoint at the same moment (e.g. the app shell and a
 * panel both load `/api/me` on mount). On a small server every extra request queues behind the
 * others, so identical concurrent calls share one in-flight promise instead of hitting the network
 * again. Nothing is cached once the promise settles — the next call fetches fresh data.
 */
const inflight = new Map<string, Promise<unknown>>()

export function shareInflight<T>(key: string, run: () => Promise<T>): Promise<T> {
  const pending = inflight.get(key)
  if (pending) return pending as Promise<T>
  const p = run().finally(() => {
    if (inflight.get(key) === p) inflight.delete(key)
  })
  inflight.set(key, p)
  return p
}
