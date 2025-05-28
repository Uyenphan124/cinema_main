document.addEventListener('DOMContentLoaded', () => {
    const movieContainer = document.getElementById('movie-container');
    const upcomingMovieContainer = document.getElementById('upcoming-movie-container');

    async function fetchMovies() {
        try {
            // Lấy phim đang chiếu
            const nowShowingResponse = await fetch('http://localhost:8000/api/movies');
            const nowShowingMovies = await nowShowingResponse.json();

            if (!nowShowingMovies.length) {
                movieContainer.innerHTML = '<p>Không có phim nào để hiển thị.</p>';
                return;
            }

            movieContainer.innerHTML = ''; // Xóa hết trước khi render mới

            // Hiển thị danh sách phim
            nowShowingMovies.forEach(movie => {
                const movieCard = document.createElement('div');
                movieCard.className = 'movie-card';
                movieCard.innerHTML = `
                    <img src="${movie.img || 'https://via.placeholder.com/200x300?text=' + encodeURIComponent(movie.Movie)}" alt="${movie.Movie}">
                    <h3>${movie.Movie}</h3>
                    <div class="stats">
                        Thích: ${movie.likes || 0} | Xem: ${movie.views || 0}
                    </div>
                `;
                movieContainer.appendChild(movieCard);
            });
        } catch (error) {
            console.error('Lỗi khi tải danh sách phim:', error);
            movieContainer.innerHTML = '<p>Lỗi khi tải danh sách phim. Vui lòng kiểm tra lại.</p>';
        }
    }

    async function fetchUpcomingMovies() {
        try {
            // Lấy phim sắp chiếu
            const upcomingResponse = await fetch('http://localhost:8000/api/upcoming-movies');
            const upcomingMovies = await upcomingResponse.json();

            if (!upcomingMovies.length) {
                upcomingMovieContainer.innerHTML = '<p>Không có phim nào để hiển thị.</p>';
                return;
            }

            // Hiển thị danh sách phim
            upcomingMovies.forEach(movie => {
                const movieCard = document.createElement('div');
                movieCard.className = 'movie-card';
                movieCard.innerHTML = `
                    <img src="${movie.img || 'https://via.placeholder.com/200x300?text=' + encodeURIComponent(movie.Movie)}" alt="${movie.Movie}">
                    <h3>${movie.Movie}</h3>
                    <div class="stats">
                        Thích: ${movie.likes || 0} | Xem: ${movie.views || 0}
                    </div>
                `;
                upcomingMovieContainer.appendChild(movieCard);
            });
        } catch (error) {
            console.error('Lỗi khi tải danh sách phim:', error);
            upcomingMovieContainer.innerHTML = '<p>Lỗi khi tải danh sách phim. Vui lòng kiểm tra lại.</p>';
        }
    }

    fetchMovies();
    fetchUpcomingMovies();
});