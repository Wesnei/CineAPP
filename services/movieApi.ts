import { Movie, TVShow, Genre } from '../types';
import { databaseService, SearchFilters } from './database';

// Dados mockados para filmes populares
const mockMovies: Movie[] = [
  {
    id: 1,
    title: "Duna: Parte Dois",
    overview: "Paul Atreides se une a Chani e aos Fremen em uma guerra de vingança contra os conspiradores que destruíram sua família.",
    poster_path: "/8xV47NDrjdZDpkVcCFqkdHa3T0C.jpg",
    backdrop_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    release_date: "2024-03-01",
    vote_average: 8.2,
    vote_count: 3245,
    genre_ids: [28, 12, 878],
    adult: false,
    original_language: "en",
    original_title: "Dune: Part Two",
    popularity: 8956.7,
    video: false,
  },
  {
    id: 2,
    title: "Avatar: O Caminho da Água",
    overview: "Após formar uma família, Jake Sully e Ney'tiri fazem de tudo para ficarem juntos. No entanto, eles devem sair de casa e explorar as regiões de Pandora.",
    poster_path: "/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    backdrop_path: "/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg",
    release_date: "2022-12-16",
    vote_average: 7.6,
    vote_count: 8567,
    genre_ids: [878, 12, 28],
    adult: false,
    original_language: "en",
    original_title: "Avatar: The Way of Water",
    popularity: 7432.1,
    video: false,
  },
  {
    id: 3,
    title: "Spider-Man: Sem Volta para Casa",
    overview: "Peter Parker tem sua identidade secreta revelada e pede ajuda ao Doutor Estranho para tornar isso um segredo novamente.",
    poster_path: "/fVzXp3NwovUlLe7fvoRynCmBPNc.jpg",
    backdrop_path: "/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg",
    release_date: "2021-12-17",
    vote_average: 8.4,
    vote_count: 15234,
    genre_ids: [28, 12, 878],
    adult: false,
    original_language: "en",
    original_title: "Spider-Man: No Way Home",
    popularity: 9823.4,
    video: false,
  },
  {
    id: 4,
    title: "Top Gun: Maverick",
    overview: "Depois de mais de trinta anos de serviço como um dos melhores aviadores da Marinha, Pete Mitchell está onde pertence.",
    poster_path: "/jMLiTgCo0vXJuwMzZGoNOUPfuj7.jpg",
    backdrop_path: "/odJ4hx6g6vBt4lBWKFD1tI8WS4x.jpg",
    release_date: "2022-05-27",
    vote_average: 8.3,
    vote_count: 6789,
    genre_ids: [28, 18],
    adult: false,
    original_language: "en",
    original_title: "Top Gun: Maverick",
    popularity: 5678.9,
    video: false,
  },
  {
    id: 5,
    title: "Oppenheimer",
    overview: "A história do físico americano J. Robert Oppenheimer e seu papel no desenvolvimento da bomba atômica.",
    poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop_path: "/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    release_date: "2023-07-21",
    vote_average: 8.1,
    vote_count: 4567,
    genre_ids: [18, 36],
    adult: false,
    original_language: "en",
    original_title: "Oppenheimer",
    popularity: 3456.7,
    video: false,
  },
  {
    id: 6,
    title: "Barbie",
    overview: "Barbie e Ken estão tendo o momento das suas vidas no colorido e aparentemente perfeito mundo da Barbie Land.",
    poster_path: "/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
    backdrop_path: "/nHf61UzkfFno5X1ofIhugCPus2R.jpg",
    release_date: "2023-07-21",
    vote_average: 6.9,
    vote_count: 7890,
    genre_ids: [35, 12, 14],
    adult: false,
    original_language: "en",
    original_title: "Barbie",
    popularity: 4567.8,
    video: false,
  },
];

// Dados mockados para séries populares
const mockTVShows: TVShow[] = [
  {
    id: 1,
    name: "Stranger Things",
    overview: "Quando um garoto desaparece, a cidade toda participa nas buscas. Mas o que encontram são segredos, forças sobrenaturais e uma menina.",
    poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    backdrop_path: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    first_air_date: "2016-07-15",
    vote_average: 8.7,
    vote_count: 9876,
    genre_ids: [18, 14, 27],
    adult: false,
    original_language: "en",
    original_name: "Stranger Things",
    popularity: 8765.4,
    origin_country: ["US"],
  },
  {
    id: 2,
    name: "The Last of Us",
    overview: "Vinte anos depois da destruição da civilização causada por um surto global, Joel e Ellie começam uma jornada através dos EUA devastados.",
    poster_path: "/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
    backdrop_path: "/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg",
    first_air_date: "2023-01-15",
    vote_average: 8.8,
    vote_count: 5432,
    genre_ids: [18, 27, 53],
    adult: false,
    original_language: "en",
    original_name: "The Last of Us",
    popularity: 7654.3,
    origin_country: ["US"],
  },
  {
    id: 3,
    name: "House of the Dragon",
    overview: "A história da Casa Targaryen acontece 200 anos antes dos eventos de Game of Thrones.",
    poster_path: "/z2yahl2uefxDCl0nogcRBstwruJ.jpg",
    backdrop_path: "/1M876Kj8Vqwtr6vw8yH2SxVv1uK.jpg",
    first_air_date: "2022-08-21",
    vote_average: 8.5,
    vote_count: 4321,
    genre_ids: [10759, 18, 14],
    adult: false,
    original_language: "en",
    original_name: "House of the Dragon",
    popularity: 6543.2,
    origin_country: ["US"],
  },
];

// Gêneros mockados
const mockGenres: Genre[] = [
  { id: 28, name: "Ação" },
  { id: 12, name: "Aventura" },
  { id: 16, name: "Animação" },
  { id: 35, name: "Comédia" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentário" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Família" },
  { id: 14, name: "Fantasia" },
  { id: 36, name: "História" },
  { id: 27, name: "Terror" },
  { id: 10402, name: "Música" },
  { id: 9648, name: "Mistério" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Ficção Científica" },
  { id: 10770, name: "Cinema TV" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "Guerra" },
  { id: 37, name: "Faroeste" },
];

class MovieApiService {
  private baseUrl = 'https://api.themoviedb.org/3';
  private apiKey = 'mock-api-key';

  // Simular delay de rede
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Initialize database and populate with initial data
  async initializeApp(): Promise<void> {
    try {
      await databaseService.initializeDatabase();
      
      // Check if we already have data
      const stats = await databaseService.getDatabaseStats();
      if (stats.moviesCount === 0 && stats.tvShowsCount === 0) {
        // Populate with initial mock data
        await databaseService.insertMovies(mockMovies);
        await databaseService.insertTVShows(mockTVShows);
        await databaseService.insertGenres(mockGenres);
        console.log('Database populated with initial data');
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      throw new Error('Failed to initialize app');
    }
  }

  async getPopularMovies(page: number = 1): Promise<{ results: Movie[]; total_pages: number }> {
    await this.delay(400);
    try {
      // First try to get from database
      const dbMovies = await databaseService.getPopularMovies(20);
      if (dbMovies.length > 0) {
        return {
          results: dbMovies,
          total_pages: 1,
        };
      }
      
      // Fallback to mock data
      return {
        results: mockMovies,
        total_pages: 1,
      };
    } catch (error) {
      console.error('Error getting popular movies:', error);
      // Fallback to mock data
      return {
        results: mockMovies,
        total_pages: 1,
      };
    }
  }

  async getPopularTVShows(page: number = 1): Promise<{ results: TVShow[]; total_pages: number }> {
    await this.delay(400);
    try {
      // First try to get from database
      const dbTVShows = await databaseService.getPopularTVShows(20);
      if (dbTVShows.length > 0) {
        return {
          results: dbTVShows,
          total_pages: 1,
        };
      }
      
      // Fallback to mock data
      return {
        results: mockTVShows,
        total_pages: 1,
      };
    } catch (error) {
      console.error('Error getting popular TV shows:', error);
      // Fallback to mock data
      return {
        results: mockTVShows,
        total_pages: 1,
      };
    }
  }

  async getMovieDetails(id: number): Promise<Movie> {
    await this.delay(300);
    try {
      // First try to get from database
      const dbMovie = await databaseService.getMovie(id);
      if (dbMovie) {
        return dbMovie;
      }
      
      // Fallback to mock data
      const movie = mockMovies.find(m => m.id === id);
      if (!movie) throw new Error('Movie not found');
      return movie;
    } catch (error) {
      console.error('Error getting movie details:', error);
      const movie = mockMovies.find(m => m.id === id);
      if (!movie) throw new Error('Movie not found');
      return movie;
    }
  }

  async getTVShowDetails(id: number): Promise<TVShow> {
    await this.delay(300);
    try {
      // First try to get from database
      const dbTVShow = await databaseService.getTVShow(id);
      if (dbTVShow) {
        return dbTVShow;
      }
      
      // Fallback to mock data
      const tvShow = mockTVShows.find(t => t.id === id);
      if (!tvShow) throw new Error('TV Show not found');
      return tvShow;
    } catch (error) {
      console.error('Error getting TV show details:', error);
      const tvShow = mockTVShows.find(t => t.id === id);
      if (!tvShow) throw new Error('TV Show not found');
      return tvShow;
    }
  }

  async getGenres(): Promise<{ genres: Genre[] }> {
    await this.delay(200);
    try {
      // First try to get from database
      const dbGenres = await databaseService.getGenres();
      if (dbGenres.length > 0) {
        return { genres: dbGenres };
      }
      
      // Fallback to mock data
      return { genres: mockGenres };
    } catch (error) {
      console.error('Error getting genres:', error);
      // Fallback to mock data
      return { genres: mockGenres };
    }
  }

  async searchMovies(query: string, page: number = 1): Promise<{ results: Movie[]; total_pages: number }> {
    await this.delay(400);
    try {
      // Use database search
      const searchResults = await databaseService.searchContent({
        query,
        type: 'movie'
      });
      
      return {
        results: searchResults.movies,
        total_pages: 1,
      };
    } catch (error) {
      console.error('Error searching movies:', error);
      // Fallback to mock search
      const filteredMovies = mockMovies.filter(movie =>
        movie.title.toLowerCase().includes(query.toLowerCase()) ||
        movie.overview.toLowerCase().includes(query.toLowerCase())
      );
      return {
        results: filteredMovies,
        total_pages: 1,
      };
    }
  }

  async searchTVShows(query: string, page: number = 1): Promise<{ results: TVShow[]; total_pages: number }> {
    await this.delay(400);
    try {
      // Use database search
      const searchResults = await databaseService.searchContent({
        query,
        type: 'tv'
      });
      
      return {
        results: searchResults.tvShows,
        total_pages: 1,
      };
    } catch (error) {
      console.error('Error searching TV shows:', error);
      // Fallback to mock search
      const filteredTVShows = mockTVShows.filter(tvShow =>
        tvShow.name.toLowerCase().includes(query.toLowerCase()) ||
        tvShow.overview.toLowerCase().includes(query.toLowerCase())
      );
      return {
        results: filteredTVShows,
        total_pages: 1,
      };
    }
  }

  // Advanced search with filters
  async searchContent(filters: SearchFilters): Promise<{
    movies: Movie[];
    tvShows: TVShow[];
    total: number;
  }> {
    await this.delay(400);
    try {
      return await databaseService.searchContent(filters);
    } catch (error) {
      console.error('Error searching content:', error);
      throw new Error('Failed to search content');
    }
  }

  // Favorites management
  async toggleMovieFavorite(movieId: number): Promise<boolean> {
    try {
      return await databaseService.toggleMovieFavorite(movieId);
    } catch (error) {
      console.error('Error toggling movie favorite:', error);
      throw new Error('Failed to toggle movie favorite');
    }
  }

  async getFavoriteMovies(): Promise<Movie[]> {
    try {
      return await databaseService.getFavoriteMovies();
    } catch (error) {
      console.error('Error getting favorite movies:', error);
      return [];
    }
  }

  // Search history
  async getSearchHistory(): Promise<string[]> {
    try {
      return await databaseService.getSearchHistory();
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }

  async clearSearchHistory(): Promise<void> {
    try {
      await databaseService.clearSearchHistory();
    } catch (error) {
      console.error('Error clearing search history:', error);
      throw new Error('Failed to clear search history');
    }
  }

  getImageUrl(path: string, size: 'w200' | 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string {
    if (!path) return 'https://via.placeholder.com/500x750/333/fff?text=No+Image';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
}

export const movieApi = new MovieApiService();
