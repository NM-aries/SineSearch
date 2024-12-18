const API_KEY = "5d72a0ee3d073c888b3214a716ffb9e8"; // Replace with your TMDB API key
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";
const IMAGE_BASE_URL500 = "https://image.tmdb.org/t/p/w500";
const YOUTUBE_BASE_URL = "https://www.youtube.com/embed/";

// DOM Elements
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const heroCarousel = document.getElementById("hero-carousel");
const movieResults = document.getElementById("movie-results");
const TrendingResult = document.getElementById("trending-results");
const genreList = document.getElementById("genre-list");
const trailerVideo = document.getElementById("trailerVideo");
const trailerSource = document.getElementById("trailerSource");
const ShowingList = document.getElementById("showingList");

const trailerModal = new bootstrap.Modal(
  document.getElementById("movieTrailer")
);

// Load Most Popular Movies on Page Load
document.addEventListener("DOMContentLoaded", () => {
  fetchMostPopularMovies();
  fetchTrendingToday();
  fetchGenres();
  
getSpecificNowPlayingMovies();
  //   getTodayShowingMovies();

  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  const tooltipList = [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );
});

// // Event Listener for Search
// searchBtn.addEventListener('click', () => {
//   const query = searchInput.value.trim();
//   if (query) {
//     searchMovies(query);
//   }
// });

// Fetch genres list
async function fetchGenres() {
  try {
    const response = await fetch(
      `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`
    );
    const data = await response.json();
    // Create a mapping of genre ID to genre name
    const genresMap = {};
    data.genres.forEach((genre) => {
      genresMap[genre.id] = genre.name;
    });
    return genresMap;
  } catch (error) {
    console.error("Error fetching genres:", error);
    return {};
  }
}
// Fetch Most Popular Movies
async function fetchMostPopularMovies() {
  try {
    const genresMap = await fetchGenres();
    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`
    );
    const data = await response.json();

    // Add genre names to each movie
    const moviesWithGenres = data.results.map((movie) => ({
      ...movie,
      genres: movie.genre_ids.map((id) => genresMap[id]), // Map genre IDs to names
    }));

    displayMovies(moviesWithGenres.slice(0, 10));
  } catch (error) {
    console.error("Error fetching popular movies:", error);
  }
}

// Display Movies
function displayMovies(movies) {
  const heroIndicators = document.querySelector("#carousel-indicators");

  heroCarousel.innerHTML = "";
  heroIndicators.innerHTML = ""; // Clear previous results
  if (movies.length === 0) {
    heroCarousel.innerHTML = '<p class="text-center">No results found.</p>';
    return;
  }

  // Initialize the carousel with movie data
  let isFirst = true;
  let indicatorIndex = 0; // Flag for the first movie

  movies.forEach((movie) => {
    const {
      id,
      title,
      overview,
      genres,
      backdrop_path,
      poster_path,
      release_date,
    } = movie;

    let MovieGenreList = "";
    let genresString = genres.join(", ");
    $.each(genresString.split(", "), function (i, genre) {
      MovieGenreList +=
        `<span class="badge rounded-2 fw-medium mny-badge-purple me-2">` +
        genre +
        `</span>`;
    });

    // Constructing the URLs for backdrop and poster images
    const backdropUrl = backdrop_path
      ? `${IMAGE_BASE_URL}original/${backdrop_path}`
      : "https://via.placeholder.com/1280x720?text=No+Image";

    const posterUrl = poster_path
      ? `${IMAGE_BASE_URL}original/${poster_path}`
      : "https://via.placeholder.com/300x450?text=No+Poster";

    // Check if we're processing the first movie
    if (isFirst) {
      let style = document.querySelector("#dynamic-hero-style");

      // If no style tag exists, create one
      if (!style) {
        style = document.createElement("style");
        style.id = "dynamic-hero-style"; // Add an ID for easy targeting
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
            <div class="carousel-item ${
              isFirst ? "active" : ""
            }" data-backdrop="${backdropUrl}">
                <div class="col-12 col-lg-10">
                    <div class="row align-items-center justify-content-center">
                        <div class="col-6 col-sm-5 col-md-5 col-lg-3 mb-3">
                            <img src="${posterUrl}" alt="${title}" class="w-100 rounded-3">
                        </div>
                        <div class="col-12 col-md-7 col-lg-9 ps-md-5 text-center text-md-start">
                            <h1 class="movie-title mb-3">${title}</h1>
                            <p class="mt-3">${overview}</p>
                            <div class="mb-3 text-warning" id="MovieGenre">
                            ${MovieGenreList}
                            </div>
                            <div>
                            <button class="btn mny-btn-outline-warning rounded-pill px-4 py-2 btn-trailer"  data-id="${id}" data-title="${title}" onclick="return openTrailerModal('${title}')" >
                                <i class="fa-solid fa-play me-2 " data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Play Trailer" ></i> Play Trailer
                            </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

    // Append the movie card to the hero carousel
    const heroCarousel = document.querySelector("#hero-carousel"); // Adjust carousel selector
    heroCarousel.innerHTML += movieCard;

    // Create an indicator for the current movie
    const indicator = document.createElement("li");
    indicator.classList.add("carousel-indicator", "d-none", "d-lg-block");
    indicator.setAttribute("data-bs-target", "#carouselExample");
    indicator.setAttribute("data-bs-slide-to", indicatorIndex);
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );
    tooltipTriggerList.forEach(
      (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
    );
    if (isFirst) {
      indicator.classList.add("active");
    }

    heroIndicators.appendChild(indicator);
    isFirst = false;
    indicatorIndex++; // After the first movie
  });

  // Add event listener to dynamically change the hero background
  const heroElement = document.querySelector(".hero");
  const carouselElement = document.querySelector("#carouselExample");

  // Listen for slide change events
  carouselElement.addEventListener("slide.bs.carousel", (event) => {
    // Get the next active slide
    const nextSlide = event.relatedTarget;
    const backdropUrl = nextSlide.getAttribute("data-backdrop"); // Fetch backdrop URL
    if (backdropUrl) {
      // Update the .hero:after background dynamically
      let style = document.querySelector("#dynamic-hero-style");

      if (!style) {
        style = document.createElement("style");
        style.id = "dynamic-hero-style"; // Add an ID for targeting
        document.head.appendChild(style);
      }
      style.innerHTML = `
                .hero:after {
                    background-image: url('${backdropUrl}');
                }
            `;
    }
  });

  // Attach event listeners to trailer buttons
  document.querySelectorAll(".btn-trailer").forEach((button) => {
    button.addEventListener("click", (e) => {
      const movieId = e.target.getAttribute("data-id");
      showTrailer(movieId);
    });
  });
}

async function fetchTrendingToday() {
  try {
    const response = await fetch(
      `${BASE_URL}/trending/movie/day?api_key=${API_KEY}`
    );
    const data = await response.json();
    displayTodaysTrendingMovies(data.results);
    initializeOwlCarousel();
  } catch (error) {
    console.error("Error fetching trending movies:", error);
  }
}
function displayTodaysTrendingMovies(movies) {
	// Clear existing content first
	TrendingResult.innerHTML = "";
  
	// If no movies found, display a message
	if (movies.length === 0) {
	  TrendingResult.innerHTML = '<p class="text-center">No results found.</p>';
	  return;
	}
  
	// Create Owl Carousel items (movie cards)
	movies.forEach((movie) => {
	  const { title, poster_path, vote_average } = movie;
	  const posterUrl = poster_path
		? `${IMAGE_BASE_URL500}${poster_path}`
		: "https://via.placeholder.com/500x750?text=No+Image"; // Fallback for missing images
  
	  // Movie rating
	  const voteAverage = vote_average;
	  const normalizedRating = voteAverage / 2;
	  const fullStars = Math.floor(normalizedRating); // Number of full stars
	  const halfStar = normalizedRating % 1 >= 0.5 ? 1 : 0; // Add half star if applicable
	  const emptyStars = 5 - fullStars - halfStar;
	  const stars =
		'<i class="fa-solid fa-star"></i>'.repeat(fullStars) +
		(halfStar ? '<i class="fa-regular fa-star-half-stroke"></i>' : "") +
		'<i class="fa-regular fa-star"></i>'.repeat(emptyStars);
  
	  const movieCard = document.createElement("div");
	  movieCard.className = "item position-relative";
	  movieCard.innerHTML = `
		<div class="card ms-2 rounded-0 my-3 p-0 trendingItems border-0">
		  <div class="card-header trendingPoster p-0 border-0">
			<img src="${posterUrl}" class="card-img-top rounded-0 movie-poster" alt="${title}">
		  </div>
		  <div class="trendingDetails text-center p-1 px-lg-3 d-flex position-absolute h-100 w-100 align-items-center justify-content-center">
			<h5>${title}</h5>
			<div class="text-warning">
			  <p class="mb-0">Rating: ${stars} </p>
			  <small class="d-none d-lg-block">(${voteAverage}/10)</small>
			</div>
		  </div>        
		</div>
		<div class="position-absolute z-3 ratingCircle">	
		  <div class="progress-container bg-dark rounded-circle">
			<svg class="progress-ring" width="40" height="40">
			  <circle class="progress-ring__circle" stroke="green" stroke-width="3" fill="transparent" r="16" cx="20" cy="20"></circle>
			</svg>
			<div class="progress-text text-white">0%</div>
		  </div>
		</div>
	  `;
  
	  // Append the movie card
	  TrendingResult.appendChild(movieCard);
  
	  // Set progress dynamically for this movie
	  const circle = movieCard.querySelector(".progress-ring__circle");
	  const text = movieCard.querySelector(".progress-text");
	  const percentage = Math.round((voteAverage / 10) * 100); // Convert vote average to percentage
	  setProgress(percentage, circle, text);
	});
  }
  
  // Updated setProgress function to take specific elements
  function setProgress(percentage, circle, text) {
	const radius = circle.r.baseVal.value;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (percentage / 100) * circumference;
  
	// Update stroke dash
	circle.style.strokeDasharray = circumference;
	circle.style.strokeDashoffset = offset;
  
	// Update text
	text.textContent = `${percentage}%`;
  
	// Change color based on percentage
	if (percentage >= 70) {
	  circle.style.stroke = "green";
	} else if (percentage >= 40) {
	  circle.style.stroke = "orange";
	} else {
	  circle.style.stroke = "red";
	}
  }
  
  



async function fetchTrendingThisWeek() {
  try {
    const response = await fetch(
      `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`
    );
    const data = await response.json();
    displayThisWeekTrendingMovies(data.results);

    initializeOwlCarousel();
    console.table(data.results);
  } catch (error) {
    console.error("Error fetching trending movies:", error);
  }
}
function displayThisWeekTrendingMovies(movies) {
  TrendingResult.innerHTML = ""; // Clear previous results
  if (movies.length === 0) {
    TrendingResult.innerHTML = '<p class="text-center">No results found.</p>';
    return;
  }
  // Create Owl Carousel items
  movies.forEach((movie) => {
    console.table(movie);
    const { title, poster_path, vote_average } = movie;
    const posterUrl = poster_path
      ? `${IMAGE_BASE_URL500}${poster_path}`
      : "https://via.placeholder.com/500x750?text=No+Image"; // Fallback for missing images

    //movie rating
    const voteAverage = vote_average;
    const normalizedRating = voteAverage / 2;
    const fullStars = Math.floor(normalizedRating); // Number of full stars
    const halfStar = normalizedRating % 1 >= 0.5 ? 1 : 0; // Add half star if applicable
    const emptyStars = 5 - fullStars - halfStar;
    const stars =
      '<i class="fa-solid fa-star"></i>'.repeat(fullStars) +
      (halfStar ? '<i class="fa-regular fa-star-half-stroke"></i>' : "") +
      '<i class="fa-regular fa-star"></i>'.repeat(emptyStars);

    const movieCard = `
        <div class="card ms-lg-2 rounded-0 my-3 p-0 trendingItems border-0">
          <div class="card-header trendingPoster p-0 border-0">
            <img src="${posterUrl}" class="card-img-top rounded-0 movie-poster" alt="${title}">
          </div>
          <div class="trendingDetails text-center p-3 d-flex position-absolute h-100 w-100 align-items-center justify-content-center">
            <h5>
            ${title}
            </h5>
            <div class="text-warning">
             <p class="mb-0">Rating: ${stars} </p>
             <small>(${voteAverage}/10)</small>
            </div>
            </div>        
        </div>
     
    `;
    TrendingResult.innerHTML += movieCard;
  });
  // Initialize Owl Carousel after adding movie cards
}

// Show Trailer in Modal
async function showTrailer(movieId) {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`
    );
    const data = await response.json();
    const trailer = data.results.find(
      (video) => video.type === "Trailer" && video.site === "YouTube"
    );

    if (trailer) {
      const trailerUrl = `${YOUTUBE_BASE_URL}${trailer.key}?autoplay=1&loop=1&color=white&controls=1&modestbranding=0`;
      trailerVideo.src = trailerUrl; // Set trailer URL
      trailerModal.show(); // Show modal
    } else {
      alert("No trailer available for this movie.");
    }
  } catch (error) {
    console.error("Error fetching movie trailer:", error);
  }
}

// Fetch Movies by Search Query
async function searchMovies(query) {
  try {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(
        query
      )}&page=1&include_adult=false`
    );
    const data = await response.json();
    SearchResult(data.results);
  } catch (error) {
    console.error("Error searching movies:", error);
  }
}

// Display Movies
function SearchResult(movies) {
  const container = document.getElementById("showingList");
  container.innerHTML = ""; // Clear previous results
  if (movies.length === 0) {
    carouselPopular.innerHTML = '<p class="text-center">No results found.</p>';
    return;
  }
  let isFirst = true;
  movies.forEach((movie) => {
    const { title, overview, backdrop_path, poster_path, release_date } = movie;

    const backdropUrl = backdrop_path
      ? `${IMAGE_BASE_URL}original${backdrop_path}`
      : "https://via.placeholder.com/1280x720?text=No+Image"; // Placeholder for landscape images
    // Placeholder for landscape images

    // Add 'active' class only to the first item dynamically
    const movieCard = `
        <div class="col-md-4 col-sm-6 movie-card">
         <div class="card">
           <img src="" class="card-img-top movie-poster" alt="">
           <div class="card-body">
             <h5 class="card-title movie-title"></h5>
             <p class="card-text"><strong>Release Date:</strong> ${
               release_date || "N/A"
             }</p>
             <p class="card-text movie-overview">${
               overview || "No description available."
             }</p>
           </div>
         </div>
       </div>
        `;

    container.innerHTML += movieCard;
    isFirst = false; // Set flag to false after the first item
  });
}

async function getSpecificNowPlayingMovies() {
	const specificTitles = [
	  "Wicked",
	  "Moana 2",
	  "Solo Leveling -ReAwakening-",
	  "The Lord of the Rings: The War of the Rohirrim",
	  "Kraven the Hunter",
	  "Hello, Love, Again",
	  "Gladiator II",
	];
  
	try {
	  let page = 1;
	  let specificMovies = [];
  
	  // Fetch now playing movies page by page until specific titles are found
	  while (specificMovies.length < specificTitles.length) {
		const response = await fetch(
		  `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=${page}`
		);
		const data = await response.json();
  
		if (!data.results || data.results.length === 0) {
		  break; // Stop if there are no more movies
		}
  
		// Filter movies matching the specific titles
		const matchingMovies = data.results.filter((movie) =>
		  specificTitles.some(
			(title) => movie.title.toLowerCase() === title.toLowerCase()
		  )
		);
  
		// Add unique matching movies
		specificMovies.push(...matchingMovies);
  
		// Stop if there are no more pages
		if (page >= data.total_pages) {
		  break;
		}
  
		page++;
	  }
  
	  // Fetch runtime details only for the found movies
	  for (let i = 0; i < specificMovies.length; i++) {
		const movie = specificMovies[i];
		const detailResponse = await fetch(
		  `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=en-US`
		);
		const movieDetails = await detailResponse.json();
		movie.runtime = movieDetails.runtime || "N/A";
	  }
  
	  // Display the final movies
	  DisplayNowShowing(specificMovies);
	} catch (error) {
	  console.error("Error fetching specific movies:", error);
	}
  }
  



  
  function DisplayNowShowing(movies) {
	console.table(movies)
	ShowingList.innerHTML = ""; // Clear previous results
  
	if (movies.length === 0) {
	  ShowingList.innerHTML = '<p class="text-center">No results found.</p>';
	  return;
	}
  
	// Create Owl Carousel items
	movies.forEach((movie) => {
	  const { title, poster_path, runtime } = movie;
	  const posterUrl = poster_path
		? `${IMAGE_BASE_URL500}${poster_path}`
		: "https://via.placeholder.com/500x750?text=No+Image"; // Fallback for missing images
  
	  const movieCard = `
		<div class="card ms-lg-2 bg-transparent rounded-2 my-3 p-0 border-0">
		  <div class="card-header p-0 border-0">
			<img src="${posterUrl}" class="card-img-top rounded-2 movie-poster" alt="${title}">
		  </div>
		  <div class="card-body text-white text-center bg-transparent p-0 border-0 row px-2 pt-2 " style="min-height:115px; align-content:center">
			<label class="text-warning mb-2">${title}</label>
			<p style="font-size:11px; mt-3"><i class="fa-solid fa-clock"></i> ${runtime} mins</p>
		  </div> 
		</div>
	  `;
	  ShowingList.innerHTML += movieCard;
	});
  
	const $owl = $("#showingList");
  
	// Destroy the existing Owl Carousel instance, if any
	if ($owl.hasClass("owl-loaded")) {
	  $owl.trigger("destroy.owl.carousel");
	  $owl.removeClass("owl-loaded");
	}
  
	// Reinitialize Owl Carousel
	$owl.owlCarousel({
	  loop: false,
	  dots: true,
	  margin: 20,
	  nav:true,
	  responsive: {
		0: { items: 2.5 },
		425: { items: 2.2 },
		768: { items: 4.8 },
		1024: { items: 7 },
	  },
	});
  }
  
  
// Call the function




// Function to initialize or refresh Owl Carousel
function initializeOwlCarousel() {
	const $owl = $(".owl-carousel");
  
	// Destroy the existing instance, if any
	if ($owl.hasClass("owl-loaded")) {
	  $owl.trigger("destroy.owl.carousel");
	  $owl.removeClass("owl-loaded");
	}
  
	// Reinitialize Owl Carousel
	$owl.owlCarousel({
	  loop: true,
	  dots: true,
	  margin: 20,
	  nav: true,
	  responsive: {
		0: {
		  items: 2.5,
		}, // 1 item on mobile
		425: {
		  items: 2.2,
		}, // 1 item on mobile
		768: {
		  items: 3.8,
		}, // 2 items on tablets
		1024: {
		  items: 5.2,
		}, // 2 items on tablets
		1440: {
		  items: 5.8,
		}, // 4 items on desktop
		2560: {
		  items: 6.8,
		}, // 4 items on desktop
	  },
	});
  }
  