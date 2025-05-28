document.addEventListener('DOMContentLoaded', () => {
    const adminOptions = document.getElementById('admin-options');
    if (!adminOptions) return;

    adminOptions.addEventListener('change', function (e) {
        const selectedOption = e.target.value;
        let url = "";
        const isAdminTab = window.location.search.includes("admin=1");

        if (selectedOption === "manage-movies") {
            url = "/html/manage-movies.html?admin=1";
        } else if (selectedOption === "manage-upcoming-movies") {
            url = "/html/manage-upcoming-movies.html?admin=1";
        } else if (selectedOption === "manage-showtimes") {
            url = "/html/manage-showtimes.html?admin=1";
        } else if (selectedOption === "manage-users") {
            url = "/html/manage-users.html?admin=1";
        } else if (selectedOption === "home") {
            // Nếu là tab quản lý, đóng tab và focus về tab cinema
            if (isAdminTab && window.opener && !window.opener.closed) {
                window.opener.focus();
                window.opener.location.reload(); // Thêm dòng này để load lại trang chủ
                window.close();
                return;
            }
            url = "/html/cinema.html";
        }

        if (url) {
            if (isAdminTab) {
                window.location.href = url;
            } else {
                // Luôn mở hoặc focus vào tab tên 'adminTab'
                window.open(url, 'adminTab');
            }
        }
        e.target.selectedIndex = 0;
    });
});