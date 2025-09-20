import React from 'react'
import { useNavigate } from 'react-router-dom'

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const { id, media_type, title, name, vote_average, poster_path, release_date, first_air_date, original_language } = movie;

  const type = media_type || (first_air_date ? 'tv' : 'movie');

  const handleClick = () => {
    if (!id) {
      console.log('No ID found for movie:', movie);
      return;
    }
    console.log('Navigating to:', `/details/${type}/${id}`);
    navigate(`/details/${type}/${id}`);
  };

  return (
    <div className="movie-card" onClick={handleClick}>
      <img
        src={poster_path ?
          `https://image.tmdb.org/t/p/w500/${poster_path}` : '/no-movie.png'}
        alt={title}
      />

      <div className="mt-4">
        <h3>{title || name}</h3>

        <div className="content">
          <div className="rating">
            <img src="star.svg" alt="Star Icon" />
            <p>{typeof vote_average === 'number' ? vote_average.toFixed(1) : 'N/A'}</p>
          </div>

          <span>•</span>
          <p className="lang">{original_language}</p>

          <span>•</span>
          <p className="year">
            {release_date || first_air_date? (release_date || first_air_date).split('-')[0] : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  )
}
export default MovieCard