import { searchService } from '../../services/search.service.js'

export const searchResolvers = {
  Query: {
    search: async (
      _: unknown,
      { query, category, limit, offset }: { query: string; category?: string; limit?: number; offset?: number }
    ) => {
      return searchService.performSearch(query, category, limit ?? 10, offset ?? 0)
    },
    autocomplete: async (_: unknown, { query, limit }: { query: string; limit?: number }) => {
      return searchService.getAutocomplete(query, limit ?? 5)
    },
    searchHealth: () => 'Search service is operational',
  },
  Mutation: {
    indexMentor: async (_: unknown, { input }: { input: any }) => {
      return searchService.indexMentor(input)
    },
    indexTrack: async (_: unknown, { input }: { input: any }) => {
      return searchService.indexTrack(input)
    },
  },
}
