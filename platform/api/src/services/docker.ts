import Dockerode from "dockerode";

const docker = new Dockerode({ socketPath: "/var/run/docker.sock" });

export interface CreateInstanceOpts {
  instanceId: number;
  config: string;
  port: number;
  memoryMb?: number;
  cpus?: number;
}

export async function createContainer(opts: CreateInstanceOpts): Promise<string> {
  const container = await docker.createContainer({
    Image: "ghcr.io/homebrew/core/nullclaw:2026.3.3",
    name: `nullclaw-instance-${opts.instanceId}`,
    Cmd: ["nullclaw", "--gateway"],
    ExposedPorts: { "3000/tcp": {} },
    HostConfig: {
      PortBindings: { "3000/tcp": [{ HostPort: String(opts.port) }] },
      Memory: (opts.memoryMb || 256) * 1024 * 1024,
      NanoCpus: (opts.cpus || 0.5) * 1e9,
      ReadonlyRootfs: true,
      SecurityOpt: ["no-new-privileges:true"],
      CapDrop: ["ALL"],
      Tmpfs: { "/tmp": "size=64m" },
      Binds: [`nullclaw-data-${opts.instanceId}:/home/nullclaw/.nullclaw`],
    },
    Labels: {
      "traefik.enable": "true",
      [`traefik.http.routers.instance-${opts.instanceId}.rule`]: `Host(\`instance-${opts.instanceId}.localhost\`)`,
      [`traefik.http.services.instance-${opts.instanceId}.loadbalancer.server.port`]: "3000",
      "managed-by": "aiceoclone-platform",
    },
  });
  await container.start();
  return container.id;
}

export async function stopContainer(containerId: string): Promise<void> {
  const container = docker.getContainer(containerId);
  await container.stop();
}

export async function removeContainer(containerId: string): Promise<void> {
  const container = docker.getContainer(containerId);
  try { await container.stop(); } catch { /* already stopped */ }
  await container.remove({ v: true });
}

export async function getContainerStatus(containerId: string): Promise<string> {
  const container = docker.getContainer(containerId);
  const info = await container.inspect();
  return info.State.Status;
}

export async function getContainerLogs(containerId: string, tail = 100): Promise<string> {
  const container = docker.getContainer(containerId);
  const logs = await container.logs({ stdout: true, stderr: true, tail, timestamps: true });
  return logs.toString();
}

export { docker };
