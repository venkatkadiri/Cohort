import { searchRepository, SearchDoc } from '../repositories/search.repository.js'
import { logger } from '../utils/logger.js'

// =========================================================================
// SEARCH SERVICE (STUB)
// Business logic to be implemented later
// =========================================================================
export class SearchService {
  async performSearch(query: string, category?: string, limit = 10, offset = 0) {
    logger.debug(`[Stub] performSearch called for "${query}"`)
    return searchRepository.search(query, category, limit, offset)
  }

  async getAutocomplete(query: string, limit = 5): Promise<string[]> {
    logger.debug(`[Stub] getAutocomplete called for "${query}"`)
    return searchRepository.autocomplete(query, limit)
  }

  async indexMentor(mentor: { id: string; name: string; title?: string; bio?: string; url: string; tags: string[] }): Promise<SearchDoc> {
    logger.debug(`[Stub] indexMentor called for ${mentor.name}`)
    return searchRepository.index({
      id: `mentor-${mentor.id}`,
      title: mentor.name,
      subtitle: mentor.title,
      category: 'MENTOR',
      url: mentor.url,
      tags: mentor.tags,
      description: mentor.bio,
    })
  }

  async indexTrack(track: { id: string; title: string; subtitle?: string; url: string; tags: string[]; description?: string }): Promise<SearchDoc> {
    logger.debug(`[Stub] indexTrack called for ${track.title}`)
    return searchRepository.index({
      id: `track-${track.id}`,
      title: track.title,
      subtitle: track.subtitle,
      category: 'TRACK',
      url: track.url,
      tags: track.tags,
      description: track.description,
    })
  }
}

export const searchService = new SearchService()
