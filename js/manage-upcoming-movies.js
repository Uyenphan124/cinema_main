document.addEventListener("DOMContentLoaded", () => {
    const upcomingMoviesTableBody = document.getElementById("upcoming-movies-table-body");
    const addUpcomingMovieBtn = document.getElementById("add-upcoming-movie-btn");

    // Sử dụng biến giống phim đang chiếu để hưởng CSS chung
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

    async function loadUpcomingMovies() {
        upcomingMoviesTableBody.innerHTML = "";
        try {
            const response = await fetch('http://localhost:8000/api/upcoming-movies');
            const movies = await response.json();
            if (!movies.length) {
                upcomingMoviesTableBody.innerHTML = "<tr><td colspan='9'>Không có phim sắp chiếu nào</td></tr>";
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
                        <button class="edit-btn" data-id="${movie._id}">Sửa</button>
                        <button class="cancel-btn" data-id="${movie._id}">Xóa</button>
                    </td>
                `;
                upcomingMoviesTableBody.appendChild(row);
            });
            document.querySelectorAll(".edit-btn").forEach(button => {
                button.addEventListener("click", (e) => {
                    const id = e.target.getAttribute("data-id");
                    editUpcomingMovie(id);
                });
            });
            document.querySelectorAll(".cancel-btn").forEach(button => {
                // Đảm bảo chỉ gán sự kiện xóa cho nút Xóa trong bảng
                if (button.type === "button" && button.textContent.trim() === "Xóa") {
                    button.addEventListener("click", (e) => {
                        const id = e.target.getAttribute("data-id");
                        deleteUpcomingMovie(id);
                    });
                }
            });
        } catch (error) {
            console.error("Error loading upcoming movies:", error);
            upcomingMoviesTableBody.innerHTML = "<tr><td colspan='9'>Lỗi khi tải danh sách phim sắp chiếu</td></tr>";
        }
    }

    addUpcomingMovieBtn.addEventListener("click", () => {
        isEditMode = false;
        addMovieTitle.textContent = "Thêm Phim Sắp Chiếu";
        submitMovieBtn.textContent = "Thêm";
        movieIdInput.value = "";
        addMovieForm.reset();
        addMovieFormSection.classList.remove("hidden");
    });

    cancelMovieBtn.addEventListener("click", () => {
        addMovieFormSection.classList.add("hidden");
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
                await fetch(`http://localhost:8000/api/upcoming-movies/${currentMovieId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(movieData)
                });
            } else {
                await fetch('http://localhost:8000/api/upcoming-movies', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(movieData)
                });
            }
            addMovieFormSection.classList.add("hidden");
            loadUpcomingMovies();
        } catch (error) {
            console.error("Error saving upcoming movie:", error);
            alert("Lỗi khi lưu phim sắp chiếu: " + error.message);
        }
    });

    async function editUpcomingMovie(id) {
        try {
            const response = await fetch(`http://localhost:8000/api/upcoming-movies`);
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
                addMovieTitle.textContent = "Sửa Phim Sắp Chiếu";
                submitMovieBtn.textContent = "Sửa";
                addMovieFormSection.classList.remove("hidden");
            } else {
                console.error("Upcoming movie not found with ID:", id);
                alert("Không tìm thấy phim sắp chiếu để sửa!");
            }
        } catch (error) {
            console.error("Error editing upcoming movie:", error);
            alert("Lỗi khi sửa phim sắp chiếu: " + error.message);
        }
    }

    async function deleteUpcomingMovie(id) {
        if (confirm("Bạn có chắc chắn muốn xóa phim sắp chiếu này?")) {
            try {
                await fetch(`http://localhost:8000/api/upcoming-movies/${id}`, {
                    method: 'DELETE'
                });
                loadUpcomingMovies();
            } catch (error) {
                console.error("Error deleting upcoming movie:", error);
                alert("Lỗi khi xóa phim sắp chiếu: " + error.message);
            }
        }
    }

    // Load upcoming movies on page load
    loadUpcomingMovies();
});