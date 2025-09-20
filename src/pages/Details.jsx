import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMBD_API_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  },
};

const Details = () => {
  const navigate = useNavigate();
  const { mediaType, id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [details, setDetails] = useState(null);
  const [videoKey, setVideoKey] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!id || !mediaType) return;
      setIsLoading(true);
      setErrorMessage('');
      try {
        const detailEndpoint = `${API_BASE_URL}/${mediaType}/${id}`;
        const videosEndpoint = `${API_BASE_URL}/${mediaType}/${id}/videos`;

        const [detailRes, videosRes] = await Promise.all([
          fetch(detailEndpoint, API_OPTIONS),
          fetch(videosEndpoint, API_OPTIONS),
        ]);

        if (!detailRes.ok) throw new Error('Failed to fetch details');
        if (!videosRes.ok) throw new Error('Failed to fetch videos');

        const detailJson = await detailRes.json();
        const videosJson = await videosRes.json();

        setDetails(detailJson);

        const trailer = (videosJson.results || []).find(
          (v) => v.type === 'Trailer' && v.site === 'YouTube'
        ) || (videosJson.results || []).find(
          (v) => v.type === 'Teaser' && v.site === 'YouTube'
        );
        setVideoKey(trailer ? trailer.key : '');
      } catch (err) {
        setErrorMessage(err.message || 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id, mediaType]);

  const title = details?.title || details?.name || 'Details';
  const posterPath = details?.poster_path
    ? `https://image.tmdb.org/t/p/w500/${details.poster_path}`
    : '/no-movie.png';
  const overview = details?.overview || 'No overview available.';
  const year = details?.release_date || details?.first_air_date
    ? (details.release_date || details.first_air_date).split('-')[0]
    : 'N/A';
  const rating = typeof details?.vote_average === 'number'
    ? details.vote_average.toFixed(1)
    : 'N/A';

  return (
    <main>
      <div className="pattern">
        <div className="wrapper">
          <button
            className="bg-black text-orange-500 hover:bg-orange-500 hover:text-black border-2 border-orange-500 font-semibold py-2 px-4 rounded transition duration-300 mb-6"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          {isLoading ? (
            <p className="text-white">Loading...</p>
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            details && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                <img src={posterPath} alt={title} className="rounded-xl w-full" />

                <div className="md:col-span-2 space-y-4">
                  <h2>{title}</h2>
                  <div className="flex items-center gap-3 text-white">
                    <div className="flex items-center gap-1">
                      <img src="/star.svg" alt="Star Icon" className="size-4" />
                      <span className="font-bold">{rating}</span>
                    </div>
                    <span>•</span>
                    <span>{year}</span>
                    <span>•</span>
                    <span className="uppercase">{details?.original_language}</span>
                  </div>

                  <p className="text-orange-100/90 leading-relaxed">{overview}</p>

                  {videoKey && (
                    <div className="aspect-video w-full">
                      <iframe
                        className="w-full h-full rounded-lg"
                        src={`https://www.youtube.com/embed/${videoKey}`}
                        title="Trailer"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </main>
  )
}

export default Details
