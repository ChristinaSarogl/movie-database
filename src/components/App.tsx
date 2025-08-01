import { useState, useEffect } from "react";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "../appwrite.ts";
import type { Models } from "appwrite";


import Search from "./Search.tsx";
import Spinner from "./Spinner.tsx";
import Card from "./Card.tsx";


const API_BASE_URL: string = "https://api.themoviedb.org/3";
const API_KEY: string = import.meta.env.VITE_TMDB_API;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}


function App() {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [searchTerm, setSearhTerm] = useState<string>("");

  const [movieList, setMovieList] = useState<Array<any>>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [trendingMovies, setTrendingMovies] = useState<Models.DefaultDocument[]>([]);

  // Debounce the search term to prevent making too many API requests
  // by waiting fo the user to stop typing for 300ms
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 300, [searchTerm])

  const fetchMovies = async(query = "") => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint: string = query 
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      
      const response: Response = await fetch(endpoint, API_OPTIONS);
      
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();

      if (data.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies.');
        setMovieList([]);
        return;
      }

      setMovieList(data.results); 

      if (query && data.results.length > 0) {
          await updateSearchCount(query, data.results[0]);
      }

    } catch(error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }

  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies ?? []);

    } catch (error) {
      console.log(`Error fetching trending movies: ${error}`);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() =>{
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <img src="./hero-img.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearhTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index+1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
      )}
        

        <section className="all-movies">
          <h2>All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ?(
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <Card key={movie.id} movie={movie} />
              ))}
            </ul>
          )}

          
        </section>



      </div>
    </main>
  );
}

export default App;
