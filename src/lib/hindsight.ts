// Hindsight memory wrapper
// Uses @vectorize-io/hindsight for retain and recall

interface RetainParams {
  content: string;
  metadata: Record<string, string | number>;
}

interface RecallParams {
  query: string;
  topK: number;
  filter?: Record<string, string | number>;
}

interface MemoryResult {
  content: string;
  metadata: Record<string, string | number>;
  score?: number;
}

// Lazy-init the Hindsight client to handle missing API key gracefully
let hindsightClient: any = null;

async function getHindsight() {
  if (hindsightClient) return hindsightClient;

  const apiKey = process.env.HINDSIGHT_API_KEY;
  if (!apiKey) {
    console.warn("HINDSIGHT_API_KEY not set — using mock memory store");
    return null;
  }

  try {
    const { Hindsight } = await import("@vectorize-io/hindsight");
    hindsightClient = new Hindsight({ apiKey });
    return hindsightClient;
  } catch (e) {
    console.warn("Hindsight SDK not available — using mock memory store", e);
    return null;
  }
}

// In-memory fallback when Hindsight is not configured
const memoryStore: MemoryResult[] = [];

export async function retainMemory(params: RetainParams): Promise<void> {
  const client = await getHindsight();
  if (client) {
    await client.retain({
      content: params.content,
      metadata: params.metadata,
    });
  } else {
    memoryStore.push({
      content: params.content,
      metadata: params.metadata,
    });
  }
}

export async function recallMemories(
  params: RecallParams
): Promise<MemoryResult[]> {
  const client = await getHindsight();
  if (client) {
    const results = await client.recall({
      query: params.query,
      topK: params.topK,
      filter: params.filter,
    });
    return results.map((r: any) => ({
      content: r.content,
      metadata: r.metadata || {},
      score: r.score,
    }));
  }

  // Fallback: simple keyword matching
  const query = params.query.toLowerCase();
  const filtered = memoryStore
    .filter((m) => {
      if (
        params.filter?.userId &&
        m.metadata.userId !== params.filter.userId
      ) {
        return false;
      }
      return true;
    })
    .map((m) => {
      const words = query.split(/\s+/);
      const content = m.content.toLowerCase();
      const matchCount = words.filter((w) => content.includes(w)).length;
      return { ...m, score: matchCount / words.length };
    })
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, params.topK);

  return filtered;
}
