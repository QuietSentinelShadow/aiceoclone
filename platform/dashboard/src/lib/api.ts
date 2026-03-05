const BASE = "/api";

async function request(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  register: (email: string, password: string) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  getInstances: () => request("/instances"),
  createInstance: (data: { name: string; packId: number; apiKey: string }) =>
    request("/instances", { method: "POST", body: JSON.stringify(data) }),
  stopInstance: (id: number) =>
    request(`/instances/${id}/stop`, { method: "POST" }),
  startInstance: (id: number) =>
    request(`/instances/${id}/start`, { method: "POST" }),
  deleteInstance: (id: number) =>
    request(`/instances/${id}`, { method: "DELETE" }),
  getPacks: () => request("/packs"),
  getLogs: (instanceId: number, tail = 100) =>
    request(`/logs/${instanceId}?tail=${tail}`),
};
