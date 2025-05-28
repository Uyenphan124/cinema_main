const formatTimestamp = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
};

async function loadMoviesToDropdown() {
    const showtimeMovieInput = document.getElementById("showtime-movie");
    if (!showtimeMovieInput) {
        console.error("showtime-movie element not found!");
        return;
    }
    showtimeMovieInput.innerHTML = '<option value="" disabled selected>Chọn phim</option>';

    try {
        const response = await fetch('http://localhost:8000/api/movies');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const movies = await response.json();
        movies.forEach((movie) => {
            const option = document.createElement("option");
            option.value = movie._id;
            option.textContent = movie.Movie || "N/A";
            showtimeMovieInput.appendChild(option);
        });
    } catch (error) {
        console.error("Lỗi khi tải danh sách phim vào dropdown:", error);
        showtimeMovieInput.innerHTML = '<option value="" disabled selected>Lỗi tải phim</option>';
    }
}

async function loadShowtimes() {
    const showtimesTableBody = document.getElementById("showtimes-table-body");
    if (!showtimesTableBody) {
        console.error("showtimes-table-body element not found!");
        return;
    }
    showtimesTableBody.innerHTML = "<tr><td colspan='6'>Đang tải...</td></tr>";

    try {
        const showtimesResponse = await fetch('http://localhost:8000/api/showtimes');
        if (!showtimesResponse.ok) throw new Error(`HTTP error! status: ${showtimesResponse.status}`);
        const showtimes = await showtimesResponse.json();

        showtimesTableBody.innerHTML = "";

        if (!showtimes.length) {
            showtimesTableBody.innerHTML = "<tr><td colspan='6'>Không có suất chiếu nào</td></tr>";
            return;
        }

        showtimes.forEach((showtime) => {
            const movieTitle = showtime.ID_Movie && showtime.ID_Movie.Movie ? showtime.ID_Movie.Movie : "Không tìm thấy phim";

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${showtime._id}</td>
                <td>${movieTitle}</td>
                <td>Rạp ${showtime.ID_Room || "N/A"}</td>
                <td>${showtime.StartTime ? formatTimestamp(showtime.StartTime) : "N/A"}</td>
                <td>${showtime.TotalSeats || "N/A"}</td>
                <td>
                    <button class="edit" data-id="${showtime._id}">Sửa</button>
                    <button class="delete" data-id="${showtime._id}">Xóa</button>
                </td>
            `;
            showtimesTableBody.appendChild(row);
        });

        document.querySelectorAll(".edit").forEach(button => {
            button.addEventListener("click", (e) => {
                const docId = e.target.getAttribute("data-id");
                editShowtime(docId);
            });
        });

        document.querySelectorAll(".delete").forEach(button => {
            button.addEventListener("click", (e) => {
                const docId = e.target.getAttribute("data-id");
                deleteShowtime(docId);
            });
        });
    } catch (error) {
        console.error("Lỗi khi tải danh sách suất chiếu:", error);
        showtimesTableBody.innerHTML = `<tr><td colspan='6'>Lỗi: ${error.message}</td></tr>`;
    }
}

let isEditShowtimeMode = false;
let currentShowtimeDocId = null;

document.addEventListener("DOMContentLoaded", () => {
    const addShowtimeBtn = document.getElementById("add-showtime-btn");
    const addShowtimePopup = document.getElementById("add-showtime-popup");
    const closeAddShowtimePopup = document.getElementById("close-add-showtime-popup");
    const addShowtimeForm = document.getElementById("add-showtime-form");
    const addShowtimeTitle = document.getElementById("add-showtime-title");
    const showtimeIdInput = document.getElementById("showtime-id");
    const showtimeMovieInput = document.getElementById("showtime-movie");
    const showtimeRoomInput = document.getElementById("showtime-room");
    const showtimeStartTimeInput = document.getElementById("showtime-start-time");
    const showtimeTotalSeatsInput = document.getElementById("showtime-total-seats");
    const submitShowtimeBtn = document.getElementById("submit-showtime-btn");

    if (!addShowtimeBtn || !addShowtimePopup || !closeAddShowtimePopup || !addShowtimeForm || 
        !addShowtimeTitle || !showtimeIdInput || !showtimeMovieInput || !showtimeRoomInput || 
        !showtimeStartTimeInput || !showtimeTotalSeatsInput || !submitShowtimeBtn) {
        console.error("Một hoặc nhiều phần tử DOM không được tìm thấy trong showtime-admin.js!");
        return;
    }

    addShowtimeBtn.addEventListener("click", (e) => {
        if (!e.isTrusted) {
            console.log("Ignoring automatic click event on addShowtimeBtn");
            return;
        }
        isEditShowtimeMode = false;
        addShowtimeTitle.textContent = "Thêm Suất Chiếu";
        submitShowtimeBtn.textContent = "Thêm";
        showtimeIdInput.value = "";
        addShowtimeForm.reset();
        loadMoviesToDropdown();
        addShowtimePopup.classList.remove("hidden");
    });

    closeAddShowtimePopup.addEventListener("click", () => {
        addShowtimePopup.classList.add("hidden");
    });

    addShowtimeForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const showtimeData = {
            ID_Movie: showtimeMovieInput.value,
            ID_Room: showtimeRoomInput.value,
            StartTime: new Date(showtimeStartTimeInput.value),
            TotalSeats: parseInt(showtimeTotalSeatsInput.value)
        };

        try {
            let response;
            if (isEditShowtimeMode) {
                response = await fetch(`http://localhost:8000/api/showtimes/${currentShowtimeDocId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(showtimeData)
                });
            } else {
                response = await fetch('http://localhost:8000/api/showtimes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(showtimeData)
                });
            }

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || "Lỗi khi lưu suất chiếu");
            }

            addShowtimePopup.classList.add("hidden");
            loadShowtimes();
        } catch (error) {
            console.error("Lỗi khi lưu suất chiếu:", error);
            alert("Lỗi khi lưu suất chiếu: " + error.message);
        }
    });

    async function editShowtime(docId) {
        try {
            const response = await fetch(`http://localhost:8000/api/showtimes/${docId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const showtime = await response.json();

            currentShowtimeDocId = docId;
            showtimeIdInput.value = docId;
            showtimeMovieInput.value = showtime.ID_Movie ? showtime.ID_Movie._id : "";
            showtimeRoomInput.value = showtime.ID_Room || "";
            showtimeStartTimeInput.value = showtime.StartTime ? new Date(showtime.StartTime).toISOString().slice(0, 16) : "";
            showtimeTotalSeatsInput.value = showtime.TotalSeats || "";
            isEditShowtimeMode = true;
            addShowtimeTitle.textContent = "Sửa Suất Chiếu";
            submitShowtimeBtn.textContent = "Sửa";
            loadMoviesToDropdown();
            addShowtimePopup.classList.remove("hidden");
        } catch (error) {
            console.error("Lỗi khi sửa suất chiếu:", error);
            alert("Lỗi khi sửa suất chiếu: " + error.message);
        }
    }

    async function deleteShowtime(docId) {
        if (confirm("Bạn có chắc chắn muốn xóa suất chiếu này?")) {
            try {
                const response = await fetch(`http://localhost:8000/api/showtimes/${docId}`, {
                    method: 'DELETE'
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                loadShowtimes();
            } catch (error) {
                console.error("Lỗi khi xóa suất chiếu:", error);
                alert("Lỗi khi xóa suất chiếu: " + error.message);
            }
        }
    }
});