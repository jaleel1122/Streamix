import { useState,useEffect } from 'react'
import { useDebounce } from 'react-use';
import React  from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import {updateSearchCount, getTrendingMovies } from './appwrite.js'


const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMBD_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}


const App = () => {
      const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
      const [searchTerm,setSearchTerm] = useState()
      const [errorMessage, setErrorMessage] = useState('');
      const [isLoading,setIsLoading] = useState(false)
      const [movieList, setMovieList] = useState([]);

       const [trendingMovies, setTrendingMovies] = useState([]);
  
      useDebounce(()=> setDebouncedSearchTerm(searchTerm),1000,[searchTerm])
  
 const fetchMovies = async(query = '') => {
   
   setIsLoading(true);
   setErrorMessage('');

try{
 const endpoint = query
        ? `${API_BASE_URL}/search/multi?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
  const response = await fetch(endpoint, API_OPTIONS)

  
  if(!response.ok) {
    throw new Error('Failed to fetch movies');
  }
  
  const data = await response.json()
  console.log(data)

  if(data.response === 'False'){
    setErrorMessage(data.Error || 'failed to fetch data')
    setMovieList([])
    return;
  }

  setMovieList(data.results || [])


  if(query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    

   }catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    }finally{
      setIsLoading(false)
    }

  } 

const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      console.log('Trending movies loaded:', movies);
      setTrendingMovies(movies || []);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
      setTrendingMovies([]);
    }
  }

 useEffect(()=>{
  fetchMovies(debouncedSearchTerm)
 },[debouncedSearchTerm])
      
 useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern">
        <div className="wrapper">
          <header>
            <img src="./logo.png" alt="logo" /> 
            <img src="./hero.png" alt="Hero Banner" />
            <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle</h1>
          </header>

              {trendingMovies && trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id || index}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title || 'Movie'} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Show message if no trending movies */}
        {trendingMovies && trendingMovies.length === 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <p className="text-orange-200 text-center">No trending movies yet. Search for movies to see them here!</p>
          </section>
        )}

                    <Search searchTerm = {searchTerm} setSearchTerm = {setSearchTerm}/>


          <section className="all-movies">
            <h2>All Movies</h2>
            
            {isLoading ? (
              <Spinner />
            ) : errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : (
              <ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </ul>
            )}
        </section>
        </div>
      </div>
    </main>
  )
}

export default App



