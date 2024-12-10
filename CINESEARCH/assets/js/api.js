const API_KEY = '5d72a0ee3d073c888b3214a716ffb9e8'; // Replace with your TMDB API key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';
const IMAGE_BASE_URL500 = 'https://image.tmdb.org/t/p/w500';
const YOUTUBE_BASE_URL = 'https://www.youtube.com/watch?v=';



// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const heroCarousel = document.getElementById('hero-carousel');
const movieResults = document.getElementById('movie-results');
const TrendingResult = document.getElementById('trending-results');
const genreList = document.getElementById('genre-list');

// Load Most Popular Movies on Page Load
document.addEventListener('DOMContentLoaded', () => {
  fetchMostPopularMovies();
  fetchTrendingMovies();
  fetchGenres();
});

// Event Listener for Search
searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query) {
    searchMovies(query);
  }
});

// Fetch genres list
async function fetchGenres() {
    try {
      const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`);
      const data = await response.json();
      // Create a mapping of genre ID to genre name
      const genresMap = {};
      data.genres.forEach(genre => {
        genresMap[genre.id] = genre.name;
      });
      return genresMap;
    } catch (error) {
      console.error('Error fetching genres:', error);
      return {};
    }
  }
// Fetch Most Popular Movies
async function fetchMostPopularMovies() {
  try {
    const genresMap = await fetchGenres();
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
    const data = await response.json();

    // Add genre names to each movie
    const moviesWithGenres = data.results.map(movie => ({
        ...movie,
        genres: movie.genre_ids.map(id => genresMap[id]), // Map genre IDs to names
      }));

    console.log(moviesWithGenres)
    displayMovies(moviesWithGenres.slice(0,10));
  } catch (error) {
    console.error('Error fetching popular movies:', error);
  }
}

// Display Movies
function displayMovies(movies) {
    console.table(movies)
    const heroIndicators = document.querySelector('#carousel-indicators');

    heroCarousel.innerHTML = '';
    heroIndicators.innerHTML = ''; // Clear previous results
    if (movies.length === 0) {
        heroCarousel.innerHTML = '<p class="text-center">No results found.</p>';
        return;
    }


  // Initialize the carousel with movie data
    let isFirst = true;
    let indicatorIndex = 0; // Flag for the first movie

    movies.forEach((movie) => {
        const { id, title, overview, genres,  backdrop_path, poster_path , release_date } = movie;

        // let genresString = genres.join(", ");
        // console.log(genresString)

        // $.each(genresString,function(i){
        //     alert(genresString[i]);
        //  });
        let MovieGenreList = "";
        let genresString = genres.join(", ");
        $.each(genresString.split(", "), function(i, genre) {

            MovieGenreList += `<span class="badge rounded-2 fw-medium bg-warning-subtle text-warning-emphasis me-2">`+genre+`</span>`;
        });
       

        // Constructing the URLs for backdrop and poster images
        const backdropUrl = backdrop_path
            ? `${IMAGE_BASE_URL}original/${backdrop_path}`
            : 'https://via.placeholder.com/1280x720?text=No+Image';

        const posterUrl = poster_path
            ? `${IMAGE_BASE_URL}original/${poster_path}`
            : 'https://via.placeholder.com/300x450?text=No+Poster';

            // Check if we're processing the first movie
        if (isFirst) {
            let style = document.querySelector('#dynamic-hero-style');

            // If no style tag exists, create one
            if (!style) {
                style = document.createElement('style');
                style.id = 'dynamic-hero-style'; // Add an ID for easy targeting
                document.head.appendChild(style);
            }

            // Set the background of hero:after for the first movie
            style.innerHTML = `
                .hero:after {
                    background-image: url('${backdropUrl}');
                }
            `;
        }


        // Generate the movie card for the carousel
        const movieCard = `
            <div class="carousel-item ${isFirst ? 'active' : ''}" data-backdrop="${backdropUrl}">
                <div class="col-12 col-lg-10">
                    <div class="row align-items-center justify-content-center">
                        <div class="col-5 col-md-3 mb-3">
                            <img src="${posterUrl}" alt="${title}" class="w-100 rounded-3">
                        </div>
                        <div class="col-12 col-md-9 ps-5 text-center text-md-start">
                            <h1 class="movie-title mb-3">${title}</h1>
                            <p class="mt-3">${overview}</p>
                            <label class="pb-3">${release_date}</label>
                            <div class="mb-3 text-warning" id="MovieGenre">
                            ${MovieGenreList}
                            </div>
                            <button class="btn btn-outline-warning rounded-pill px-4 py-2 btn-trailer" data-bs-toggle="modal" data-id="${id}" data-title="${title}" onclick="return openTrailerModal('${title}')">
                                <i class="fa-solid fa-play me-2"></i> Play Trailer
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;

        // Append the movie card to the hero carousel
        const heroCarousel = document.querySelector('#hero-carousel'); // Adjust carousel selector
        heroCarousel.innerHTML += movieCard;


        // Create an indicator for the current movie
        const indicator = document.createElement('li');
        indicator.classList.add('carousel-indicator');
        indicator.setAttribute('data-bs-target', '#carouselExample');
        indicator.setAttribute('data-bs-slide-to', indicatorIndex);
        if (isFirst) {
            indicator.classList.add('active');
        }

        heroIndicators.appendChild(indicator);
        isFirst = false;
        indicatorIndex++; // After the first movie
    });

    // Add event listener to dynamically change the hero background
    const heroElement = document.querySelector('.hero');
    const carouselElement = document.querySelector('#carouselExample');

// Listen for slide change events
    carouselElement.addEventListener('slide.bs.carousel', (event) => {
        // Get the next active slide
        const nextSlide = event.relatedTarget;
        const backdropUrl = nextSlide.getAttribute('data-backdrop'); // Fetch backdrop URL
        console.log(backdropUrl);
        if (backdropUrl) {
            // Update the .hero:after background dynamically
            let style = document.querySelector('#dynamic-hero-style');

            if (!style) {
                style = document.createElement('style');
                style.id = 'dynamic-hero-style'; // Add an ID for targeting
                document.head.appendChild(style);
            }
            style.innerHTML = `
                .hero:after {
                    background-image: url('${backdropUrl}');
                }
            `;
        }
    }
    );

   // Attach event listeners to trailer buttons
    document.querySelectorAll('.btn-trailer').forEach((button) => {
        button.addEventListener('click', (e) => {
            const movieId = e.target.getAttribute('data-id');
            openTrailerInNewTab(movieId);
        });
    });
}


// Open Trailer in a New Tab
async function openTrailerInNewTab(movieId) {
	try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`);
        const data = await response.json();
        const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
      
        if (trailer) {
            const trailerUrl = `${YOUTUBE_BASE_URL}${trailer.key}`;
        
           // Set the URL in the iframe to load the trailer
            const iframe = document.getElementById('trailerIframe');
            iframe.src = trailerUrl;

        } else {
            alert('No trailer available for this movie.');
        }
    } catch (error) {
        console.error('Error fetching movie trailer:', error);
    }
}




// Fetch Movies by Search Query
async function searchMovies(query) {
  try {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`
    );
    const data = await response.json();
    SearchResult(data.results);
  } catch (error) {
    console.error('Error searching movies:', error);
  }
}

// Display Movies
function SearchResult(movies) {
    movieResults.innerHTML = ''; // Clear previous results
    if (movies.length === 0) {
      carouselPopular.innerHTML = '<p class="text-center">No results found.</p>';
      return;
    }
    let isFirst = true;
    movies.forEach((movie) => {
      console.table(movie)
      const { title, overview,backdrop_path, poster_path, release_date } = movie;
  
      const backdropUrl = backdrop_path
      ? `${IMAGE_BASE_URL}original${backdrop_path}`
      : 'https://via.placeholder.com/1280x720?text=No+Image'; // Placeholder for landscape images
    // Placeholder for landscape images
    
      // Add 'active' class only to the first item dynamically
      const movieCard = `
        <div class="col-md-4 col-sm-6 movie-card">
         <div class="card">
           <img src="" class="card-img-top movie-poster" alt="">
           <div class="card-body">
             <h5 class="card-title movie-title"></h5>
             <p class="card-text"><strong>Release Date:</strong> ${
               release_date || 'N/A'
             }</p>
             <p class="card-text movie-overview">${overview || 'No description available.'}</p>
           </div>
         </div>
       </div>
        `;
    
        movieResults.innerHTML += movieCard;
      isFirst = false; // Set flag to false after the first item
    });
}

async function fetchTrendingMovies() {
    try {
      const response = await fetch(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}`);
      const data = await response.json();
      displayTrendingMovies(data.results);
      console.table(data.results);
    } catch (error) {
      console.error('Error fetching trending movies:', error);
    }
}

function displayTrendingMovies(movies) {
    TrendingResult.innerHTML = ''; // Clear previous results
    if (movies.length === 0) {
        TrendingResult.innerHTML = '<p class="text-center">No results found.</p>';
      return;
    }
 // Create Owl Carousel items
 movies.forEach((movie) => {
    const { title, poster_path } = movie;
    const posterUrl = poster_path
      ? `${IMAGE_BASE_URL500}${poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Image'; // Fallback for missing images

    const movieCard = `
      <div class="item mx-3 trending-poster" >
        <div class="card border-0">
          <img src="${posterUrl}" class="card-img-top rounded-0 movie-poster" alt="${title}">
        </div>
      </div>
    `;
    TrendingResult.innerHTML += movieCard;
  });

  // Initialize Owl Carousel after adding movie cards
  $('#trending-results').owlCarousel({
    loop: true, // Infinite loop
    margin: 10, // Space between items
    nav: false,// Show navigation buttons
    responsive: {
      0: { items: 1.8 }, // 1 item on mobile
      500: { items: 3.5 }, // 2 items on tablets
      900: { items: 4.5 }, // 2 items on tablets
      1000: { items: 8.5} // 4 items on desktop
    }
  });
}


const trailerContainer = document.getElementById('trailer-container');
