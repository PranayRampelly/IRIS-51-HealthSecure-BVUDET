const API_BASE = "http://localhost:8000";

export async function predictDisease(data: unknown) {
  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getAdvice(disease: string) {
  const res = await fetch(`${API_BASE}/advice/${encodeURIComponent(disease)}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getSymptoms() {
  const res = await fetch(`${API_BASE}/symptoms`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
} 