import { databaseService } from '../services/database';
import { movieApi } from '../services/movieApi';

export class SQLiteTestService {
  async runTests(): Promise<{
    success: boolean;
    results: string[];
    errors: string[];
  }> {
    const results: string[] = [];
    const errors: string[] = [];
    let success = true;

    try {
      // Test 1: Database initialization
      results.push('🔄 Testing database initialization...');
      await movieApi.initializeApp();
      results.push('✅ Database initialized successfully');

      // Test 2: Database stats
      results.push('🔄 Testing database stats...');
      const stats = await databaseService.getDatabaseStats();
      results.push(`✅ Database stats: ${stats.moviesCount} movies, ${stats.tvShowsCount} TV shows, ${stats.genresCount} genres`);

      // Test 3: Search functionality
      results.push('🔄 Testing search functionality...');
      const searchResults = await databaseService.searchContent({ query: 'Duna' });
      results.push(`✅ Search results: ${searchResults.total} items found`);

      // Test 4: Get popular movies
      results.push('🔄 Testing popular movies retrieval...');
      const popularMovies = await movieApi.getPopularMovies();
      results.push(`✅ Popular movies: ${popularMovies.results.length} movies retrieved`);

      // Test 5: Get popular TV shows
      results.push('🔄 Testing popular TV shows retrieval...');
      const popularTVShows = await movieApi.getPopularTVShows();
      results.push(`✅ Popular TV shows: ${popularTVShows.results.length} TV shows retrieved`);

      // Test 6: Get genres
      results.push('🔄 Testing genres retrieval...');
      const genres = await movieApi.getGenres();
      results.push(`✅ Genres: ${genres.genres.length} genres retrieved`);

      // Test 7: Movie details
      results.push('🔄 Testing movie details retrieval...');
      const movieDetails = await movieApi.getMovieDetails(1);
      results.push(`✅ Movie details: \"${movieDetails.title}\" retrieved`);

      // Test 8: Search movies
      results.push('🔄 Testing movie search...');
      const movieSearchResults = await movieApi.searchMovies('Spider');
      results.push(`✅ Movie search: ${movieSearchResults.results.length} results found`);

      // Test 9: Favorites functionality
      results.push('🔄 Testing favorites functionality...');
      const favoriteStatus = await movieApi.toggleMovieFavorite(1);
      results.push(`✅ Movie favorite toggled: ${favoriteStatus}`);

      // Test 10: Search history
      results.push('🔄 Testing search history...');
      const searchHistory = await movieApi.getSearchHistory();
      results.push(`✅ Search history: ${searchHistory.length} queries found`);

      results.push('🎉 All tests completed successfully!');

    } catch (error) {
      success = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`❌ Test failed: ${errorMessage}`);
      console.error('SQLite test error:', error);
    }

    return {
      success,
      results,
      errors
    };
  }

  async performanceBenchmark(): Promise<{
    searchTime: number;
    insertTime: number;
    retrievalTime: number;
  }> {
    try {
      // Benchmark search
      const searchStart = Date.now();
      await databaseService.searchContent({ query: 'test' });
      const searchTime = Date.now() - searchStart;

      // Benchmark insertion (using a single movie)
      const insertStart = Date.now();
      await databaseService.insertMovie({
        id: 9999,
        title: 'Test Movie',
        overview: 'Test overview',
        poster_path: '/test.jpg',
        backdrop_path: '/test_backdrop.jpg',
        release_date: '2024-01-01',
        vote_average: 8.0,
        vote_count: 100,
        genre_ids: [28, 12],
        adult: false,
        original_language: 'en',
        original_title: 'Test Movie',
        popularity: 100.0,
        video: false
      });
      const insertTime = Date.now() - insertStart;

      // Benchmark retrieval
      const retrievalStart = Date.now();
      await databaseService.getPopularMovies(10);
      const retrievalTime = Date.now() - retrievalStart;

      return {
        searchTime,
        insertTime,
        retrievalTime
      };
    } catch (error) {
      console.error('Performance benchmark error:', error);
      return {
        searchTime: -1,
        insertTime: -1,
        retrievalTime: -1
      };
    }
  }
}

export const sqliteTestService = new SQLiteTestService();