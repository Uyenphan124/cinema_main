import { fetchRightPanelMovies, showMovieDetailsFromRightPanel } from './right-panel.js';

// Danh sách ảnh banner đúng với cinema.html
const bannerImages = [
    '../img/yae.jpg',
    '../img/citlali2.jpg',
    '../img/mavuika.jpg'
];
let currentBannerIndex = 1; // Đang hiển thị citlali2.jpg

function updateBanner() {
    const bannerImg = document.getElementById('banner-img');
    const prevImg = document.getElementById('prev-img');
    const nextImg = document.getElementById('next-img');
    if (bannerImg && prevImg && nextImg) {
        bannerImg.src = bannerImages[currentBannerIndex];
        prevImg.src = bannerImages[(currentBannerIndex - 1 + bannerImages.length) % bannerImages.length];
        nextImg.src = bannerImages[(currentBannerIndex + 1) % bannerImages.length];
    }
}

function prevBanner() {
    currentBannerIndex = (currentBannerIndex - 1 + bannerImages.length) % bannerImages.length;
    updateBanner();
}

function nextBanner() {
    currentBannerIndex = (currentBannerIndex + 1) % bannerImages.length;
    updateBanner();
}

async function fetchMovies() {
    try {
        const response = await fetch('http://localhost:8000/api/movies');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const movies = await response.json();
        const movieContainer = document.getElementById('movie-container');
        movieContainer.innerHTML = '';
        if (movies.length === 0) {
            movieContainer.innerHTML = '<p>Không có phim nào để hiển thị.</p>';
            return;
        }
        movies.forEach((movie, index) => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.innerHTML = `
                <img src="${movie.img || 'https://via.placeholder.com/200x300?text=' + encodeURIComponent(movie.Movie)}" alt="${movie.Movie}">
                <h3>${movie.Movie}</h3>
            `;
            movieCard.addEventListener('click', () => showMovieDetailsFromRightPanel(index));
            movieContainer.appendChild(movieCard);
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách phim:', error);
        const movieContainer = document.getElementById('movie-container');
        movieContainer.innerHTML = `<p>Lỗi khi tải danh sách phim: ${error.message}. Kiểm tra server hoặc API.</p>`;
    }
}

function searchMovies() {
    const input = document.getElementById('search').value.toLowerCase();
    const movies = document.querySelectorAll('#movie-container .movie-card');
    let found = false;
    movies.forEach(movie => {
        const title = movie.querySelector('h3').textContent.toLowerCase();
        if (title.includes(input)) {
            movie.style.display = ''; // <-- Để mặc định, flex sẽ tự căn đều
            found = true;
        } else {
            movie.style.display = 'none';
        }
    });
    // Nếu không tìm thấy phim nào, hiển thị thông báo
    const movieContainer = document.getElementById('movie-container');
    if (!found && movies.length > 0) {
        if (!document.getElementById('no-movie-found')) {
            const p = document.createElement('p');
            p.id = 'no-movie-found';
            p.textContent = 'Không tìm thấy phim nào.';
            movieContainer.appendChild(p);
        }
    } else {
        const noMovie = document.getElementById('no-movie-found');
        if (noMovie) noMovie.remove();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchMovies();
    updateBanner();
    document.getElementById('prev-btn').addEventListener('click', prevBanner);
    document.getElementById('next-btn').addEventListener('click', nextBanner);

    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            // Ẩn chi tiết phim, hiện lại danh sách phim đang chiếu
            document.getElementById('movie-details-section').classList.add('hidden');
            document.getElementById('movie-list').classList.remove('hidden');
            // Load lại danh sách phim như trang chủ
            if (typeof fetchMovies === 'function') {
                fetchMovies();
            }
            // Nếu có right panel, load lại
            if (typeof fetchRightPanelMovies === 'function') {
                fetchRightPanelMovies(0);
            }
        });
    }
});