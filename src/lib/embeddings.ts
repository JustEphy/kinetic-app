const DEFAULT_DIMENSIONS = 1536;

export function buildDeterministicEmbedding(text: string, dimensions = DEFAULT_DIMENSIONS): number[] {
  const vector = new Array<number>(dimensions).fill(0);
  const normalized = normalizeText(text);
  if (!normalized) return vector;

  const tokens = normalized.split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    const h1 = hashString(token, 2166136261);
    const h2 = hashString(token, 16777619);
    const i1 = h1 % dimensions;
    const i2 = h2 % dimensions;
    vector[i1] += 1.0;
    vector[i2] += 0.5;
  }

  return normalizeVector(vector);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function parsePgVector(value: unknown): number[] | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    const numeric = value.map((x) => Number(x)).filter((x) => Number.isFinite(x));
    return numeric.length ? numeric : null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) return null;
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return [];
    const parsed = inner.split(',').map((x) => Number(x.trim())).filter((x) => Number.isFinite(x));
    return parsed.length ? parsed : null;
  }
  return null;
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function hashString(input: string, seed: number): number {
  let hash = seed >>> 0;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash >>> 0;
}

function normalizeVector(vector: number[]): number[] {
  let norm = 0;
  for (const value of vector) norm += value * value;
  norm = Math.sqrt(norm);
  if (!norm) return vector;
  return vector.map((value) => value / norm);
}
