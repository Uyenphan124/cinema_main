document.addEventListener("DOMContentLoaded", () => {
    const showtimesTableBody = document.getElementById("showtimes-table-body");
    const addShowtimeBtn = document.getElementById("add-showtime-btn");
    const addShowtimeFormSection = document.getElementById("add-showtime-form-section");
    const addShowtimeForm = document.getElementById("add-showtime-form");
    const addShowtimeTitle = document.getElementById("add-showtime-title");
    const showtimeIdInput = document.getElementById("showtime-id");
    const showtimeMovieSelect = document.getElementById("showtime-movie");
    const showtimeRoomInput = document.getElementById("showtime-room");
    const showtimeStartTimeInput = document.getElementById("showtime-start-time");
    const showtimeTotalSeatsInput = document.getElementById("showtime-total-seats");
    const submitShowtimeBtn = document.getElementById("submit-showtime-btn");
    const cancelShowtimeBtn = document.getElementById("cancel-showtime-btn");
    const userFullname = document.getElementById("user-fullname");
    const logoutBtn = document.getElementById("logout-btn");

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

    async function loadShowtimes() {
        showtimesTableBody.innerHTML = "";
        try {
            const response = await fetch('http://localhost:8000/api/showtimes');
            const showtimes = await response.json();
            if (!showtimes.length) {
                showtimesTableBody.innerHTML = "<tr><td colspan='6'>Không có suất chiếu nào</td></tr>";
                return;
            }
            showtimes.forEach((showtime) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${showtime._id}</td>
                    <td>${showtime.ID_Movie ? showtime.ID_Movie.Movie : "N/A"}</td>
                    <td>${showtime.ID_Room || "N/A"}</td>
                    <td>${showtime.StartTime ? formatTimestamp(showtime.StartTime) : "N/A"}</td>
                    <td>${showtime.TotalSeats || "N/A"}</td>
                    <td>${showtime.seatsBooked && showtime.seatsBooked.length ? showtime.seatsBooked.join(', ') : 'Chưa có ghế nào'}</td>
                    <td>
                        <button class="delete" data-id="${showtime._id}">Xóa</button>
                    </td>
                `;
                showtimesTableBody.appendChild(row);
            });
            document.querySelectorAll(".delete").forEach(button => {
                button.addEventListener("click", (e) => {
                    const id = e.target.getAttribute("data-id");
                    deleteShowtime(id);
                });
            });
        } catch (error) {
            console.error("Error loading showtimes:", error);
            showtimesTableBody.innerHTML = "<tr><td colspan='6'>Lỗi khi tải danh sách suất chiếu</td></tr>";
        }
    }

    async function loadMoviesForDropdown() {
        try {
            const response = await fetch('http://localhost:8000/api/movies');
            const movies = await response.json();
            showtimeMovieSelect.innerHTML = '<option value="" disabled selected>Chọn phim</option>';
            movies.forEach(movie => {
                const option = document.createElement("option");
                option.value = movie._id;
                option.textContent = movie.Movie;
                showtimeMovieSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error loading movies for dropdown:", error);
        }
    }

    addShowtimeBtn.addEventListener("click", () => {
        addShowtimeTitle.textContent = "Thêm Suất Chiếu";
        submitShowtimeBtn.textContent = "Thêm";
        showtimeIdInput.value = "";
        addShowtimeForm.reset();
        addShowtimeFormSection.classList.remove("hidden");
    });

    cancelShowtimeBtn.addEventListener("click", () => {
        addShowtimeFormSection.classList.add("hidden");
    });

    addShowtimeForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const showtimeData = {
            ID_Movie: showtimeMovieSelect.value,
            ID_Room: showtimeRoomInput.value,
            StartTime: new Date(showtimeStartTimeInput.value),
            TotalSeats: parseInt(showtimeTotalSeatsInput.value)
        };
        try {
            await fetch('http://localhost:8000/api/showtimes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(showtimeData)
            });
            addShowtimeFormSection.classList.add("hidden");
            loadShowtimes();
        } catch (error) {
            console.error("Error saving showtime:", error);
            alert("Lỗi khi lưu suất chiếu: " + error.message);
        }
    });

    async function deleteShowtime(id) {
        if (confirm("Bạn có chắc chắn muốn xóa suất chiếu này?")) {
            try {
                await fetch(`http://localhost:8000/api/showtimes/${id}`, {
                    method: 'DELETE'
                });
                loadShowtimes();
            } catch (error) {
                console.error("Error deleting showtime:", error);
                alert("Lỗi khi xóa suất chiếu: " + error.message);
            }
        }
    }

    // Load showtimes and movies for dropdown on page load
    loadShowtimes();
    loadMoviesForDropdown();
});