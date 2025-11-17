// Minimal socket.io-client shim for environments without the dependency available.
// Provides a lightweight event emitter interface compatible with the app's usage.
export type Listener = (...args: any[]) => void;

export interface Socket<ServerToClientEvents = Record<string, Listener>, ClientToServerEvents = Record<string, Listener>> {
  id?: string;
  connected: boolean;
  emit: <E extends keyof ClientToServerEvents | string>(event: E, ...args: any[]) => void;
  on: (event: string, listener: Listener) => Socket<ServerToClientEvents, ClientToServerEvents>;
  off: (event: string, listener: Listener) => void;
  disconnect: () => void;
}

const createSocket = <ServerToClientEvents, ClientToServerEvents>(): Socket<ServerToClientEvents, ClientToServerEvents> => {
  const listeners = new Map<string, Set<Listener>>();

  const socket: Socket<ServerToClientEvents, ClientToServerEvents> = {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : undefined,
    connected: true,
    emit: (event, ...args) => {
      const handlers = listeners.get(event as string);
      handlers?.forEach((handler) => handler(...args));
    },
    on: (event, listener) => {
      const handlers = listeners.get(event) ?? new Set<Listener>();
      handlers.add(listener);
      listeners.set(event, handlers);
      return socket;
    },
    off: (event, listener) => {
      const handlers = listeners.get(event);
      handlers?.delete(listener);
    },
    disconnect: () => {
      listeners.clear();
      socket.connected = false;
    },
  };

  return socket;
};

export const io = <ServerToClientEvents = Record<string, Listener>, ClientToServerEvents = Record<string, Listener>>(
  _url: string,
  _options?: Record<string, unknown>
) => createSocket<ServerToClientEvents, ClientToServerEvents>();

export default { io };
