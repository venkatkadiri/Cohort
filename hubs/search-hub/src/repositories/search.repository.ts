export interface SearchDoc {
  id: string
  title: string
  subtitle?: string
  category: 'MENTOR' | 'TRACK' | 'SESSION' | 'DOC'
  url: string
  tags: string[]
  description?: string
  score?: number
}

// =========================================================================
// SEARCH REPOSITORY (STUB)
// Persistence/indexing logic to be implemented later (e.g. Elasticsearch / Meilisearch / Postgres FTS)
// =========================================================================
export class SearchRepository {
  async search(_query: string, _category?: string, _limit = 10, _offset = 0): Promise<{ items: SearchDoc[]; total: number }> {
    return {
      items: [],
      total: 0,
    }
  }

  async autocomplete(_query: string, _limit = 5): Promise<string[]> {
    return []
  }

  async index(doc: SearchDoc): Promise<SearchDoc> {
    return doc
  }
}

export const searchRepository = new SearchRepository()
