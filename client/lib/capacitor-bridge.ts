/**
 * Native Capacitor bridge in the Android app. The app shell loads this website from its URL, so
 * the site does not bundle @capacitor/core: `window.Capacitor.Plugins` stays empty and native
 * plugins are reached through the bridge functions Capacitor injects into the page
 * (`addListener`, `nativePromise`, `isPluginAvailable`).
 */

type Listener = { remove: () => Promise<void> }

type InjectedBridge = {
  isNativePlatform?: () => boolean
  getPlatform?: () => string
  isPluginAvailable?: (name: string) => boolean
  addListener?: (plugin: string, event: string, cb: (data: unknown) => void) => Listener
  nativePromise?: <T = unknown>(plugin: string, method: string, options?: Record<string, unknown>) => Promise<T>
  Plugins?: Record<string, Record<string, (...args: unknown[]) => unknown> | undefined>
}

export function nativeBridge(): InjectedBridge | null {
  if (typeof window === "undefined") return null
  const cap = (window as unknown as { Capacitor?: InjectedBridge }).Capacitor
  if (!cap) return null
  const native = cap.isNativePlatform?.() === true || cap.getPlatform?.() === "android"
  return native ? cap : null
}

/** Subscribes to a native plugin event (works with or without @capacitor/core on the page). */
export function addNativeListener(plugin: string, event: string, cb: (data: unknown) => void): Listener | null {
  const cap = nativeBridge()
  if (!cap) return null
  const registered = cap.Plugins?.[plugin]?.addListener
  if (registered) {
    const handle = registered(event, cb) as Listener | Promise<Listener>
    return { remove: async () => (await handle).remove() }
  }
  return cap.addListener ? cap.addListener(plugin, event, cb) : null
}

/** Calls a native plugin method. Rejects when the bridge or method is not available. */
export function callNative<T = unknown>(plugin: string, method: string, options: Record<string, unknown> = {}): Promise<T> {
  const cap = nativeBridge()
  if (!cap) return Promise.reject(new Error("no_native_bridge"))
  const fn = cap.Plugins?.[plugin]?.[method]
  if (fn) return Promise.resolve(fn(options) as T)
  if (cap.nativePromise) return cap.nativePromise<T>(plugin, method, options)
  return Promise.reject(new Error("no_native_bridge"))
}
