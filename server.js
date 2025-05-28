const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/cinema_db')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// ===== SCHEMAS ===== //
const movieSchema = new mongoose.Schema({
    Movie: String,
    Country: String,
    Genre: String,
    Release_Date: Date,
    Time_minutes: Number,
    Description: String,
    img: String
}, { _id: true });

const upcomingMovieSchema = new mongoose.Schema({
    Movie: String,
    Country: String,
    Genre: String,
    Release_Date: Date,
    Time_minutes: Number,
    Description: String,
    img: String
}, { _id: true, collection: 'upcoming_movies' });


const showtimeSchema = new mongoose.Schema({
    ID_Movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
    ID_Room: String,
    StartTime: Date,
    TotalSeats: Number,
    seatsBooked: [String]
},{ _id: true });


const userSchema = new mongoose.Schema({
    id: String,
    FULLNAME: String,
    Age: Number,
    Gender: Boolean,
    Phone: String,
    Email: String,
    password: String
});

// ===== MODELS ===== //
const Movie = mongoose.model('Movie', movieSchema);
const UpcomingMovie = mongoose.model('UpcomingMovie', upcomingMovieSchema);
const Showtime = mongoose.model('Showtime', showtimeSchema);
const User = mongoose.model('User', userSchema);

// ===== ROUTES ===== //

// ==== USERS ==== //
app.post('/api/users/register', async (req, res) => {
    const { id, FULLNAME, Age, Gender, Phone, Email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ id, FULLNAME, Age, Gender, Phone, Email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'Đăng ký thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi đăng ký' });
    }
});

app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ Email: { $regex: new RegExp('^' + email + '$', 'i') } });
        if (!user) return res.status(401).json({ message: 'Email không tồn tại' });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: 'Mật khẩu không đúng' });

        res.json({ user: { id: user.id, FULLNAME: user.FULLNAME, Email: user.Email }, message: 'Đăng nhập thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server nội bộ' });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi lấy danh sách người dùng' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xoá người dùng' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi xoá người dùng' });
    }
});

// ==== MOVIES ==== //
app.get('/api/movies', async (req, res) => {
    try {
        const movies = await Movie.find();
        if (!movies.length) return res.status(404).json({ message: 'Không tìm thấy phim nào' });
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách phim' });
    }
});

app.get('/api/movies/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ message: 'Không tìm thấy phim' });
        res.json(movie);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi lấy phim' });
    }
});

app.post('/api/movies', async (req, res) => {
    try {
        const movie = new Movie(req.body);
        await movie.save();
        res.status(201).json({ message: 'Tạo phim thành công', movie });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tạo phim' });
    }
});

app.put('/api/movies/:id', async (req, res) => {
    try {
        const updated = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: 'Cập nhật thành công', updated });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi cập nhật phim' });
    }
});

app.delete('/api/movies/:id', async (req, res) => {
    try {
        await Movie.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xoá phim' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi xoá phim' });
    }
});

// ==== UPCOMING MOVIES ==== //
app.get('/api/upcoming-movies', async (req, res) => {
    try {
        const movies = await UpcomingMovie.find();
        if (!movies.length) return res.status(404).json({ message: 'Không có phim sắp chiếu nào' });
        res.json(movies);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server nội bộ' });
    }
});

app.get('/api/upcoming-movies/:id', async (req, res) => {
    try {
        const movie = await UpcomingMovie.findById(req.params.id);
        if (!movie) return res.status(404).json({ message: 'Không tìm thấy phim' });
        res.json(movie);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy phim sắp chiếu' });
    }
});

app.post('/api/upcoming-movies', async (req, res) => {
    try {
        const movie = new UpcomingMovie(req.body);
        await movie.save();
        res.status(201).json({ message: 'Tạo phim sắp chiếu thành công', movie });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi tạo phim' });
    }
});

app.put('/api/upcoming-movies/:id', async (req, res) => {
    try {
        const updated = await UpcomingMovie.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: 'Cập nhật thành công', updated });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi cập nhật phim' });
    }
});

app.delete('/api/upcoming-movies/:id', async (req, res) => {
    try {
        await UpcomingMovie.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xoá phim sắp chiếu' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi xoá phim' });
    }
});

// ==== SHOWTIMES ==== //
app.get('/api/showtimes', async (req, res) => {
    try {
        const showtimes = await Showtime.find().populate('ID_Movie');
        if (!showtimes.length) return res.status(404).json({ message: 'Không có suất chiếu nào' });
        res.json(showtimes);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi lấy danh sách suất chiếu' });
    }
});


app.get('/api/showtimes/by-movie/:movieId', async (req, res) => {
    try {
        // Lấy các suất chiếu và kèm thông tin phim
        const showtimes = await Showtime.find({ ID_Movie: req.params.movieId }).populate('ID_Movie');
        res.json(showtimes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/showtimes/:id', async (req, res) => {
    try {
        const showtime = await Showtime.findById(req.params.id).populate('ID_Movie');
        if (!showtime) return res.status(404).json({ message: 'Không tìm thấy suất chiếu' });
        res.json(showtime);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy suất chiếu' });
    }
});

app.post('/api/showtimes', async (req, res) => {
    try {
        const showtime = new Showtime({
            ID_Movie: req.body.ID_Movie,
            ID_Room: req.body.ID_Room,
            StartTime: req.body.StartTime,
            TotalSeats: req.body.TotalSeats, // nếu vẫn muốn lưu tổng số ghế
            seatsBooked: [] // luôn khởi tạo rỗng
        });
        await showtime.save();
        res.status(201).json({ message: 'Thêm suất chiếu thành công', showtime });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi thêm suất chiếu' });
    }
});

app.put('/api/showtimes/:id', async (req, res) => {
    try {
        const updated = await Showtime.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: 'Cập nhật suất chiếu thành công', updated });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi cập nhật suất chiếu' });
    }
});

app.delete('/api/showtimes/:id', async (req, res) => {
    try {
        await Showtime.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xoá suất chiếu' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi xoá suất chiếu' });
    }
});
// Chỉ lấy _id và StartTime
app.get('/api/showtimes/short', async (req, res) => {
    try {
        const showtimes = await Showtime.find({}, "_id StartTime");
        res.json(showtimes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Lấy danh sách ghế đã đặt

app.get("/api/booked-seats/:showtimeId", async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.showtimeId);
    if (!showtime) return res.status(404).json({ error: "Không tìm thấy suất chiếu" });
    res.json({ bookedSeats: showtime.seatsBooked });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Đặt ghế
app.post("/api/book-seat/:showtimeId", async (req, res) => {
  try {
    const { seats } = req.body;
    const { showtimeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(showtimeId)) {
      return res.status(400).json({ error: "showtimeId không hợp lệ" });
    }

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) return res.status(404).json({ error: "Không tìm thấy suất chiếu" });

   
    const alreadyBooked = seats.some(seat => showtime.seatsBooked.includes(seat));
    if (alreadyBooked) return res.status(400).json({ error: "Có ghế đã bị đặt!" });

    showtime.seatsBooked.push(...seats);
    await showtime.save();

    res.json({ success: true, bookedSeats: showtime.seatsBooked });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// ===== START SERVER ===== //
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server started on http://localhost:${PORT}`);
});
