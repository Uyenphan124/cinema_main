document.addEventListener("DOMContentLoaded", () => {
    const moviesTableBody = document.getElementById("movies-table-body");
    const addMovieBtn = document.getElementById("add-movie-btn");
    const addMovieFormSection = document.getElementById("add-movie-form-section");
    const addMovieForm = document.getElementById("add-movie-form");
    const addMovieTitle = document.getElementById("add-movie-title");
    const movieIdInput = document.getElementById("movie-id");
    const movieTitleInput = document.getElementById("movie-title-input");
    const movieCountryInput = document.getElementById("movie-country");
    const movieGenreInput = document.getElementById("movie-genre");
    const movieReleaseDateInput = document.getElementById("movie-release-date");
    const movieDurationInput = document.getElementById("movie-duration");
    const movieDescriptionInput = document.getElementById("movie-description");
    const movieImageUrlInput = document.getElementById("movie-image-url");
    const submitMovieBtn = document.getElementById("submit-movie-btn");
    const cancelMovieBtn = document.getElementById("cancel-movie-btn");
    const userFullname = document.getElementById("user-fullname");
    const logoutBtn = document.getElementById("logout-btn");
    const popupOverlay = document.getElementById("popup-overlay");

    let isEditMode = false;
    let currentMovieId = null;

    // Check user state and redirect if not logged in or not an admin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.fullname || !user.isAdmin) {
        window.location.href = "../html/cinema.html";
    } else {
        userFullname.textContent = user.fullname;
    }

    // Handle logout
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem('user');
        window.location.href = "../html/cinema.html";
    });

    const formatTimestamp = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
    };

    async function loadMovies() {
        moviesTableBody.innerHTML = "";
        try {
            const response = await fetch('http://localhost:8000/api/movies');
            const movies = await response.json();
            if (!movies.length) {
                moviesTableBody.innerHTML = "<tr><td colspan='9'>Không có phim nào</td></tr>";
                return;
            }
            movies.forEach((movie) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${movie._id}</td>
                    <td>${movie.Movie || "N/A"}</td>
                    <td>${movie.Country || "N/A"}</td>
                    <td>${movie.Genre || "N/A"}</td>
                    <td>${movie.Release_Date ? formatTimestamp(movie.Release_Date) : "N/A"}</td>
                    <td>${movie.Time_minutes || "N/A"}</td>
                    <td>${movie.Description || "N/A"}</td>
                    <td><img src="${movie.img || ''}" alt="${movie.Movie || 'No image'}" style="max-width: 100px;"></td>
                    <td>
                        <button class="edit" data-id="${movie._id}">Sửa</button>
                        <button class="delete" data-id="${movie._id}">Xóa</button>
                    </td>
                `;
                moviesTableBody.appendChild(row);
            });
            document.querySelectorAll(".edit").forEach(button => {
                button.addEventListener("click", (e) => {
                    const id = e.target.getAttribute("data-id");
                    editMovie(id);
                });
            });
            document.querySelectorAll(".delete").forEach(button => {
                button.addEventListener("click", (e) => {
                    const id = e.target.getAttribute("data-id");
                    deleteMovie(id);
                });
            });
        } catch (error) {
            console.error("Error loading movies:", error);
            moviesTableBody.innerHTML = "<tr><td colspan='9'>Lỗi khi tải danh sách phim</td></tr>";
        }
    }

    addMovieBtn.addEventListener("click", () => {
        isEditMode = false;
        addMovieTitle.textContent = "Thêm Phim";
        submitMovieBtn.textContent = "Thêm";
        movieIdInput.value = "";
        addMovieForm.reset();
        addMovieFormSection.classList.remove("hidden");
        if (popupOverlay) popupOverlay.classList.add("active");
    });

    cancelMovieBtn.addEventListener("click", () => {
        addMovieFormSection.classList.add("hidden");
        if (popupOverlay) popupOverlay.classList.remove("active");
    });

    addMovieForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const movieData = {
            Movie: movieTitleInput.value,
            Country: movieCountryInput.value,
            Genre: movieGenreInput.value,
            Release_Date: new Date(movieReleaseDateInput.value),
            Time_minutes: parseInt(movieDurationInput.value),
            Description: movieDescriptionInput.value,
            img: movieImageUrlInput.value
        };
        try {
            if (isEditMode) {
                await fetch(`http://localhost:8000/api/movies/${currentMovieId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(movieData)
                });
            } else {
                await fetch('http://localhost:8000/api/movies', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(movieData)
                });
            }
            addMovieFormSection.classList.add("hidden");
            if (popupOverlay) popupOverlay.classList.remove("active");
            loadMovies();
        } catch (error) {
            console.error("Error saving movie:", error);
            alert("Lỗi khi lưu phim: " + error.message);
        }
    });

    async function editMovie(id) {
        try {
            const response = await fetch(`http://localhost:8000/api/movies`);
            const movies = await response.json();
            const movie = movies.find(m => m._id === id);
            if (movie) {
                currentMovieId = id;
                movieIdInput.value = id;
                movieTitleInput.value = movie.Movie;
                movieCountryInput.value = movie.Country;
                movieGenreInput.value = movie.Genre;
                movieReleaseDateInput.value = movie.Release_Date ? new Date(movie.Release_Date).toISOString().slice(0, 16) : "";
                movieDurationInput.value = movie.Time_minutes;
                movieDescriptionInput.value = movie.Description;
                movieImageUrlInput.value = movie.img;
                isEditMode = true;
                addMovieTitle.textContent = "Sửa Phim";
                submitMovieBtn.textContent = "Sửa";
                addMovieFormSection.classList.remove("hidden");
                if (popupOverlay) popupOverlay.classList.add("active");
            } else {
                console.error("Movie not found with ID:", id);
                alert("Không tìm thấy phim để sửa!");
            }
        } catch (error) {
            console.error("Error editing movie:", error);
            alert("Lỗi khi sửa phim: " + error.message);
        }
    }

    async function deleteMovie(id) {
        if (confirm("Bạn có chắc chắn muốn xóa phim này?")) {
            try {
                await fetch(`http://localhost:8000/api/movies/${id}`, {
                    method: 'DELETE'
                });
                loadMovies();
            } catch (error) {
                console.error("Error deleting movie:", error);
                alert("Lỗi khi xóa phim: " + error.message);
            }
        }
    }

    // Load movies on page load
    loadMovies();
});