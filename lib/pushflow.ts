
function getPushflowConfig() {
  const id = process.env.PUSHFLOW_INSTANCE_ID;
  const token = process.env.PUSHFLOW_ACCESS_TOKEN;
  if (!id || !token) {
    throw new Error('Pushflow credentials are not set');
  }
  return { id, token };
}

export async function pushflowRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { id, token } = getPushflowConfig();
  const url = `https://api.pushflow.com/v1/instances/${id}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}
