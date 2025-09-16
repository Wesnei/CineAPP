import * as SQLite from 'expo-sqlite';
import { Movie, TVShow, Genre } from '../types';

export interface DatabaseMovie extends Movie {
  isFavorite?: boolean;
  isWatched?: boolean;
  isRented?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseTVShow extends TVShow {
  isFavorite?: boolean;
  isWatched?: boolean;
  isRented?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  query?: string;
  genreId?: number;
  minRating?: number;
  year?: number;
  type?: 'movie' | 'tv' | 'all';
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  async initializeDatabase(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.db = await SQLite.openDatabaseAsync('appfilmes.db');
      await this.createTables();
      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw new Error('Failed to initialize database');
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Create movies table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS movies (
          id INTEGER PRIMARY KEY,
          title TEXT NOT NULL,
          overview TEXT,
          poster_path TEXT,
          backdrop_path TEXT,
          release_date TEXT,
          vote_average REAL,
          vote_count INTEGER,
          genre_ids TEXT,
          adult BOOLEAN,
          original_language TEXT,
          original_title TEXT,
          popularity REAL,
          video BOOLEAN,
          isFavorite BOOLEAN DEFAULT 0,
          isWatched BOOLEAN DEFAULT 0,
          isRented BOOLEAN DEFAULT 0,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create TV shows table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS tv_shows (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          overview TEXT,
          poster_path TEXT,
          backdrop_path TEXT,
          first_air_date TEXT,
          vote_average REAL,
          vote_count INTEGER,
          genre_ids TEXT,
          adult BOOLEAN,
          original_language TEXT,
          original_name TEXT,
          popularity REAL,
          origin_country TEXT,
          isFavorite BOOLEAN DEFAULT 0,
          isWatched BOOLEAN DEFAULT 0,
          isRented BOOLEAN DEFAULT 0,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create genres table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS genres (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create search history table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS search_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          query TEXT NOT NULL,
          searchedAt TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create users table for authentication
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create indexes for better search performance
      await this.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title);
        CREATE INDEX IF NOT EXISTS idx_movies_genre_ids ON movies(genre_ids);
        CREATE INDEX IF NOT EXISTS idx_movies_vote_average ON movies(vote_average);
        CREATE INDEX IF NOT EXISTS idx_tv_shows_name ON tv_shows(name);
        CREATE INDEX IF NOT EXISTS idx_tv_shows_genre_ids ON tv_shows(genre_ids);
        CREATE INDEX IF NOT EXISTS idx_tv_shows_vote_average ON tv_shows(vote_average);
      `);

      console.log('Database tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw new Error('Failed to create database tables');
    }
  }

  // Utility method to ensure database is initialized
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeDatabase();
    }
  }

  // Movies operations
  async insertMovie(movie: Movie): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const now = new Date().toISOString();
      await this.db.runAsync(
        `INSERT OR REPLACE INTO movies (
          id, title, overview, poster_path, backdrop_path, release_date,
          vote_average, vote_count, genre_ids, adult, original_language,
          original_title, popularity, video, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          movie.id, movie.title, movie.overview, movie.poster_path,
          movie.backdrop_path, movie.release_date, movie.vote_average,
          movie.vote_count, JSON.stringify(movie.genre_ids), movie.adult,
          movie.original_language, movie.original_title, movie.popularity,
          movie.video, now
        ]
      );
    } catch (error) {
      console.error('Error inserting movie:', error);
      throw new Error('Failed to insert movie');
    }
  }

  async insertMovies(movies: Movie[]): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      for (const movie of movies) {
        await this.insertMovie(movie);
      }
    } catch (error) {
      console.error('Error inserting movies:', error);
      throw new Error('Failed to insert movies');
    }
  }

  async getMovie(id: number): Promise<DatabaseMovie | null> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getFirstAsync<any>(
        'SELECT * FROM movies WHERE id = ?',
        [id]
      );

      if (!result) return null;

      return {
        ...result,
        genre_ids: JSON.parse(result.genre_ids || '[]'),
        adult: Boolean(result.adult),
        video: Boolean(result.video),
        isFavorite: Boolean(result.isFavorite),
        isWatched: Boolean(result.isWatched),
        isRented: Boolean(result.isRented),
      };
    } catch (error) {
      console.error('Error getting movie:', error);
      return null;
    }
  }

  async getPopularMovies(limit: number = 20): Promise<DatabaseMovie[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM movies ORDER BY popularity DESC, vote_average DESC LIMIT ?',
        [limit]
      );

      return results.map(result => ({
        ...result,
        genre_ids: JSON.parse(result.genre_ids || '[]'),
        adult: Boolean(result.adult),
        video: Boolean(result.video),
        isFavorite: Boolean(result.isFavorite),
        isWatched: Boolean(result.isWatched),
        isRented: Boolean(result.isRented),
      }));
    } catch (error) {
      console.error('Error getting popular movies:', error);
      return [];
    }
  }

  // TV Shows operations
  async insertTVShow(tvShow: TVShow): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const now = new Date().toISOString();
      await this.db.runAsync(
        `INSERT OR REPLACE INTO tv_shows (
          id, name, overview, poster_path, backdrop_path, first_air_date,
          vote_average, vote_count, genre_ids, adult, original_language,
          original_name, popularity, origin_country, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tvShow.id, tvShow.name, tvShow.overview, tvShow.poster_path,
          tvShow.backdrop_path, tvShow.first_air_date, tvShow.vote_average,
          tvShow.vote_count, JSON.stringify(tvShow.genre_ids), tvShow.adult,
          tvShow.original_language, tvShow.original_name, tvShow.popularity,
          JSON.stringify(tvShow.origin_country), now
        ]
      );
    } catch (error) {
      console.error('Error inserting TV show:', error);
      throw new Error('Failed to insert TV show');
    }
  }

  async insertTVShows(tvShows: TVShow[]): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      for (const tvShow of tvShows) {
        await this.insertTVShow(tvShow);
      }
    } catch (error) {
      console.error('Error inserting TV shows:', error);
      throw new Error('Failed to insert TV shows');
    }
  }

  async getTVShow(id: number): Promise<DatabaseTVShow | null> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getFirstAsync<any>(
        'SELECT * FROM tv_shows WHERE id = ?',
        [id]
      );

      if (!result) return null;

      return {
        ...result,
        genre_ids: JSON.parse(result.genre_ids || '[]'),
        origin_country: JSON.parse(result.origin_country || '[]'),
        adult: Boolean(result.adult),
        isFavorite: Boolean(result.isFavorite),
        isWatched: Boolean(result.isWatched),
        isRented: Boolean(result.isRented),
      };
    } catch (error) {
      console.error('Error getting TV show:', error);
      return null;
    }
  }

  async getPopularTVShows(limit: number = 20): Promise<DatabaseTVShow[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM tv_shows ORDER BY popularity DESC, vote_average DESC LIMIT ?',
        [limit]
      );

      return results.map(result => ({
        ...result,
        genre_ids: JSON.parse(result.genre_ids || '[]'),
        origin_country: JSON.parse(result.origin_country || '[]'),
        adult: Boolean(result.adult),
        isFavorite: Boolean(result.isFavorite),
        isWatched: Boolean(result.isWatched),
        isRented: Boolean(result.isRented),
      }));
    } catch (error) {
      console.error('Error getting popular TV shows:', error);
      return [];
    }
  }

  // Genres operations
  async insertGenres(genres: Genre[]): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      for (const genre of genres) {
        await this.db.runAsync(
          'INSERT OR IGNORE INTO genres (id, name) VALUES (?, ?)',
          [genre.id, genre.name]
        );
      }
    } catch (error) {
      console.error('Error inserting genres:', error);
      throw new Error('Failed to insert genres');
    }
  }

  async getGenres(): Promise<Genre[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const results = await this.db.getAllAsync<Genre>(
        'SELECT id, name FROM genres ORDER BY name'
      );
      return results;
    } catch (error) {
      console.error('Error getting genres:', error);
      return [];
    }
  }

  // Search operations
  async searchContent(filters: SearchFilters): Promise<{
    movies: DatabaseMovie[];
    tvShows: DatabaseTVShow[];
    total: number;
  }> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      let movies: DatabaseMovie[] = [];
      let tvShows: DatabaseTVShow[] = [];

      // Build search query for movies
      if (filters.type === 'movie' || filters.type === 'all' || !filters.type) {
        let movieQuery = 'SELECT * FROM movies WHERE 1=1';
        const movieParams: any[] = [];

        if (filters.query) {
          movieQuery += ' AND (title LIKE ? OR overview LIKE ?)';
          const searchPattern = `%${filters.query}%`;
          movieParams.push(searchPattern, searchPattern);
        }

        if (filters.genreId) {
          movieQuery += ' AND genre_ids LIKE ?';
          movieParams.push(`%${filters.genreId}%`);
        }

        if (filters.minRating) {
          movieQuery += ' AND vote_average >= ?';
          movieParams.push(filters.minRating);
        }

        if (filters.year) {
          movieQuery += ' AND release_date LIKE ?';
          movieParams.push(`${filters.year}%`);
        }

        movieQuery += ' ORDER BY popularity DESC, vote_average DESC LIMIT 50';

        const movieResults = await this.db.getAllAsync<any>(movieQuery, movieParams);
        movies = movieResults.map(result => ({
          ...result,
          genre_ids: JSON.parse(result.genre_ids || '[]'),
          adult: Boolean(result.adult),
          video: Boolean(result.video),
          isFavorite: Boolean(result.isFavorite),
          isWatched: Boolean(result.isWatched),
          isRented: Boolean(result.isRented),
        }));
      }

      // Build search query for TV shows  
      if (filters.type === 'tv' || filters.type === 'all' || !filters.type) {
        let tvQuery = 'SELECT * FROM tv_shows WHERE 1=1';
        const tvParams: any[] = [];

        if (filters.query) {
          tvQuery += ' AND (name LIKE ? OR overview LIKE ?)';
          const searchPattern = `%${filters.query}%`;
          tvParams.push(searchPattern, searchPattern);
        }

        if (filters.genreId) {
          tvQuery += ' AND genre_ids LIKE ?';
          tvParams.push(`%${filters.genreId}%`);
        }

        if (filters.minRating) {
          tvQuery += ' AND vote_average >= ?';
          tvParams.push(filters.minRating);
        }

        if (filters.year) {
          tvQuery += ' AND first_air_date LIKE ?';
          tvParams.push(`${filters.year}%`);
        }

        tvQuery += ' ORDER BY popularity DESC, vote_average DESC LIMIT 50';

        const tvResults = await this.db.getAllAsync<any>(tvQuery, tvParams);
        tvShows = tvResults.map(result => ({
          ...result,
          genre_ids: JSON.parse(result.genre_ids || '[]'),
          origin_country: JSON.parse(result.origin_country || '[]'),
          adult: Boolean(result.adult),
          isFavorite: Boolean(result.isFavorite),
          isWatched: Boolean(result.isWatched),
          isRented: Boolean(result.isRented),
        }));
      }

      // Save search query to history
      if (filters.query) {
        await this.saveSearchQuery(filters.query);
      }

      return {
        movies,
        tvShows,
        total: movies.length + tvShows.length,
      };
    } catch (error) {
      console.error('Error searching content:', error);
      throw new Error('Failed to search content');
    }
  }

  // Search history operations
  async saveSearchQuery(query: string): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        'INSERT INTO search_history (query) VALUES (?)',
        [query.trim()]
      );

      // Keep only last 50 search queries
      await this.db.runAsync(
        `DELETE FROM search_history WHERE id NOT IN (
          SELECT id FROM search_history ORDER BY searchedAt DESC LIMIT 50
        )`
      );
    } catch (error) {
      console.error('Error saving search query:', error);
    }
  }

  async getSearchHistory(): Promise<string[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const results = await this.db.getAllAsync<{ query: string }>(
        'SELECT DISTINCT query FROM search_history ORDER BY searchedAt DESC LIMIT 10'
      );
      return results.map(r => r.query);
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }

  // Favorites operations
  async toggleMovieFavorite(movieId: number): Promise<boolean> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const movie = await this.getMovie(movieId);
      if (!movie) throw new Error('Movie not found');

      const newFavoriteStatus = !movie.isFavorite;
      await this.db.runAsync(
        'UPDATE movies SET isFavorite = ?, updatedAt = ? WHERE id = ?',
        [newFavoriteStatus, new Date().toISOString(), movieId]
      );

      return newFavoriteStatus;
    } catch (error) {
      console.error('Error toggling movie favorite:', error);
      throw new Error('Failed to toggle movie favorite');
    }
  }

  async getFavoriteMovies(): Promise<DatabaseMovie[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM movies WHERE isFavorite = 1 ORDER BY updatedAt DESC'
      );

      return results.map(result => ({
        ...result,
        genre_ids: JSON.parse(result.genre_ids || '[]'),
        adult: Boolean(result.adult),
        video: Boolean(result.video),
        isFavorite: Boolean(result.isFavorite),
        isWatched: Boolean(result.isWatched),
        isRented: Boolean(result.isRented),
      }));
    } catch (error) {
      console.error('Error getting favorite movies:', error);
      return [];
    }
  }

  // Utility operations
  async clearAllData(): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync('DELETE FROM movies');
      await this.db.runAsync('DELETE FROM tv_shows');
      await this.db.runAsync('DELETE FROM genres');
      await this.db.runAsync('DELETE FROM search_history');
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw new Error('Failed to clear all data');
    }
  }

  async clearSearchHistory(): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync('DELETE FROM search_history');
    } catch (error) {
      console.error('Error clearing search history:', error);
      throw new Error('Failed to clear search history');
    }
  }

  async getDatabaseStats(): Promise<{
    moviesCount: number;
    tvShowsCount: number;
    genresCount: number;
  }> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const moviesResult = await this.db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM movies'
      );
      const tvShowsResult = await this.db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM tv_shows'
      );
      const genresResult = await this.db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM genres'
      );

      return {
        moviesCount: moviesResult?.count || 0,
        tvShowsCount: tvShowsResult?.count || 0,
        genresCount: genresResult?.count || 0,
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return { moviesCount: 0, tvShowsCount: 0, genresCount: 0 };
    }
  }

  // User authentication methods
  async createUser(id: string, name: string, email: string, password: string): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const now = new Date().toISOString();
      await this.db.runAsync(
        'INSERT INTO users (id, name, email, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
        [id, name, email, password, now, now]
      );
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async getUserByEmail(email: string): Promise<{ id: string; name: string; email: string; password: string } | null> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getFirstAsync<any>(
        'SELECT id, name, email, password FROM users WHERE email = ?',
        [email]
      );
      return result || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  async updateUser(id: string, name: string, email: string): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const now = new Date().toISOString();
      await this.db.runAsync(
        'UPDATE users SET name = ?, email = ?, updatedAt = ? WHERE id = ?',
        [name, email, now, id]
      );
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }
}

export const databaseService = new DatabaseService();