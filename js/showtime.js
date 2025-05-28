const formatDateToDayMonth = (date) => new Date(date).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit' });
const formatTimeToHourMinute = (date) => new Date(date).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' });

async function fetchShowtimes(movieId) {
    const showtimeList = document.getElementById('showtime-list');
    if (!showtimeList) {
        console.error('showtime-list element not found!');
        return;
    }

    showtimeList.innerHTML = '<p>Đang tải lịch chiếu...</p>';

    try {
        const response = await fetch(`http://localhost:8000/api/showtimes/by-movie/${movieId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const showtimes = await response.json();

        if (!showtimes.length) {
            showtimeList.innerHTML = '<p class="no-showtimes">Không có lịch chiếu</p>';
            return;
        }

        const showtimesByDate = {};
        showtimes.forEach((showtime) => {
            const startTime = new Date(showtime.StartTime);
            if (isNaN(startTime)) return;
            const dateKey = formatDateToDayMonth(startTime);
            if (!showtimesByDate[dateKey]) showtimesByDate[dateKey] = [];
            showtimesByDate[dateKey].push({
                time: startTime,
                room: showtime.ID_Room,
                docId: showtime._id,
                movieName: showtime.ID_Movie?.Movie || '',
                startTimeRaw: showtime.StartTime
            });
        });

        const sortedDates = Object.keys(showtimesByDate).sort((a, b) => {
            const [dayA, monthA] = a.split('/').map(Number);
            const [dayB, monthB] = b.split('/').map(Number);
            return new Date(2025, monthA - 1, dayA) - new Date(2025, monthB - 1, dayB);
        });


        showtimeList.innerHTML = `
            <div class="showtime-date-tabs" id="showtime-date-tabs"></div>
            <div class="showtime-slots" id="showtime-slots"></div>
            <div style="text-align:right;margin-top:10px;">
                <button class="book-ticket-btn" id="book-ticket-btn" disabled>Đặt vé</button>
            </div>
        `;

        const dateTabsContainer = document.getElementById('showtime-date-tabs');
        const slotsContainer = document.getElementById('showtime-slots');
        const bookBtn = document.getElementById('book-ticket-btn');

        let currentSelectedDate = sortedDates[0];
        let currentSelectedShowtimeId = null;

        let selectedMovieName = '';
        let selectedShowtimeTime = '';

        
        sortedDates.forEach((date, index) => {
            const tab = document.createElement('div');
            tab.classList.add('showtime-date-tab');
            tab.textContent = date;
            tab.dataset.date = date;
            if (index === 0) tab.classList.add('active');
            dateTabsContainer.appendChild(tab);
        });

       
        const updateShowtimes = (selectedDate) => {
            slotsContainer.innerHTML = '';
            currentSelectedDate = selectedDate;
            currentSelectedShowtimeId = null;
            bookBtn.disabled = true;
            if (showtimesByDate[selectedDate]) {
                showtimesByDate[selectedDate].forEach(showtime => {
                    const slot = document.createElement('div');
                    slot.classList.add('showtime-slot');
                    slot.textContent = `${formatTimeToHourMinute(showtime.time)} - Phòng ${showtime.room}`;
                    slot.style.cursor = 'pointer';
                    slot.onclick = () => {
                        
                        currentSelectedShowtimeId = showtime.docId;
                        selectedMovieName = showtime.movieName || '';
                        
                        if (showtime.startTimeRaw) {
                            const d = new Date(showtime.startTimeRaw);
                            selectedShowtimeTime = d.toISOString().slice(0, 10); // "2025-05-10"
                        } else if (showtime.time) {
                            const d = new Date(showtime.time);
                            selectedShowtimeTime = d.toISOString().slice(0, 10);
                        } else {
                            selectedShowtimeTime = '';
                        }
                        document.querySelectorAll('.showtime-slot').forEach(s => s.classList.remove('selected'));
                        slot.classList.add('selected');

                        bookBtn.disabled = false;
                    };

                    slotsContainer.appendChild(slot);
                });
            }
        };

        dateTabsContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('showtime-date-tab')) {
                document.querySelectorAll('.showtime-date-tab').forEach(t => t.classList.remove('active'));
                event.target.classList.add('active');
                updateShowtimes(event.target.dataset.date);
            }
        });

        
        bookBtn.addEventListener('click', () => {
            if (currentSelectedShowtimeId) {
                // Lưu thông tin vào localStorage
                localStorage.setItem('selectedShowtimeId', currentSelectedShowtimeId);
                localStorage.setItem('selectedMovieName', selectedMovieName); // tên phim
                localStorage.setItem('selectedShowtimeTime', selectedShowtimeTime); // ngày giờ
                window.location.href = 'seat.html';
            }
        });

        if (sortedDates.length > 0) updateShowtimes(sortedDates[0]);
    } catch (error) {
        console.error('Lỗi khi tải lịch chiếu:', error);
        showtimeList.innerHTML = `<p>Lỗi: ${error.message}</p>`;
    }
}

export { fetchShowtimes };