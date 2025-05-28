import { fetchShowtimes } from './showtime.js';

const formatTimestamp = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
};

async function fetchRightPanelMovies(selectedIndex) {
    const rightPanel = document.getElementById('right-panel');
    if (!rightPanel) {
        console.error('rightPanel element not found!');
        return;
    }

    rightPanel.innerHTML = '<p>Đang tải danh sách...</p>';

    try {
        const response = await fetch('http://localhost:8000/api/movies');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const movies = await response.json();
        if (!movies.length) {
            rightPanel.innerHTML = '<p>Không có phim nào để hiển thị.</p>';
            return;
        }

        rightPanel.innerHTML = '<h3>Phim Đang Chiếu Khác</h3><div class="right-movie-list"></div>';
        const movieList = document.querySelector('.right-movie-list');

        let index = 0;
        movies.forEach((movie) => {
            if (index === selectedIndex) {
                index++;
                return;
            }
            const imgUrl = movie.img || 'https://via.placeholder.com/100x150?text=No+Image';
            const movieCard = document.createElement('div');
            movieCard.classList.add('right-movie-card');
            movieCard.setAttribute('data-index', index.toString());
            movieCard.setAttribute('data-movie-id', movie._id);
            movieCard.innerHTML = `
                <img src="${imgUrl}" alt="${movie.Movie || 'Movie Poster'}">
                <div class="right-movie-info">
                    <h4>${movie.Movie || 'Tên không có'}</h4>
                    <p>Thể loại: ${movie.Genre || 'Không rõ'}</p>
                    <p>Ngày chiếu: ${movie.Release_Date ? formatTimestamp(movie.Release_Date) : 'Không rõ'}</p>
                </div>
            `;
            movieList.appendChild(movieCard);
            index++;
        });

        const movieCards = document.querySelectorAll('.right-movie-card');
        movieCards.forEach(card => {
            card.addEventListener('click', () => {
                movieCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                const indexValue = parseInt(card.getAttribute('data-index'));
                if (isNaN(indexValue)) {
                    console.error('Index is NaN for right panel card:', card);
                    alert('Lỗi: Không thể xác định vị trí phim!');
                    return;
                }
                showMovieDetailsFromRightPanel(indexValue);
            });
        });
    } catch (error) {
        console.error('Lỗi khi tải danh sách phim bên phải:', error);
        rightPanel.innerHTML = `<p>Lỗi: ${error.message}. Vui lòng thử lại sau.</p>`;
    }
}

async function showMovieDetailsFromRightPanel(index) {
    const movieDetailsSection = document.getElementById('movie-details-section');
    const movieListSection = document.getElementById('movie-list');

    try {
        const response = await fetch('http://localhost:8000/api/movies');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const movies = await response.json();
        const movie = movies[index];
        if (!movie) {
            console.error('No movie found at index:', index);
            alert('Không tìm thấy phim tại vị trí này!');
            return;
        }

        document.getElementById('movie-title').textContent = movie.Movie || 'Tên không có';
        document.getElementById('movie-poster').src = movie.img || 'https://via.placeholder.com/200x300?text=No+Image';
        document.getElementById('movie-Genre').textContent = movie.Genre || 'Không rõ';
        document.getElementById('movie-Release-Date').textContent = movie.Release_Date ? formatTimestamp(movie.Release_Date) : 'Không rõ';
        document.getElementById('movie-Country').textContent = movie.Country || 'Không rõ';
        document.getElementById('movie-Time_minutes').textContent = movie.Time_minutes || 'Không rõ';
        document.getElementById('movie-Description').textContent = movie.Description || 'Không có mô tả';

        // Show the appropriate back button
        const backBtnNowShowing = document.getElementById('back-btn-now-showing');
        const backBtnUpcoming = document.getElementById('back-btn-upcoming');
        if (backBtnNowShowing) backBtnNowShowing.classList.add('active');
        if (backBtnUpcoming) backBtnUpcoming.classList.remove('active');

        if (movieListSection) movieListSection.classList.add('hidden');
        if (movieDetailsSection) {
            movieDetailsSection.classList.remove('hidden');
        }

        await fetchShowtimes(movie._id);
        fetchRightPanelMovies(index);
    } catch (error) {
        console.error('Lỗi khi tải chi tiết phim:', error);
        alert(`Lỗi: ${error.message}. Vui lòng kiểm tra server hoặc endpoint.`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('showMovieDetailsEvent', (event) => {
        fetchRightPanelMovies(event.detail.index);
    });
});

export { fetchRightPanelMovies, showMovieDetailsFromRightPanel };