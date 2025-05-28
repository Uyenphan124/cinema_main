document.addEventListener("DOMContentLoaded", () => {
    const usersTableBody = document.getElementById("users-table-body");
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

    async function loadUsers() {
        usersTableBody.innerHTML = "";
        try {
            const response = await fetch('http://localhost:8000/api/users');
            const users = await response.json();
            if (!users.length) {
                usersTableBody.innerHTML = "<tr><td colspan='7'>Không có user nào</td></tr>";
                return;
            }
            users.forEach((user) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${user.id || "N/A"}</td>
                    <td>${user.FULLNAME || "N/A"}</td>
                    <td>${user.Email || "N/A"}</td>
                    <td>${user.Age || "N/A"}</td>
                    <td>${user.Gender ? "Nam" : "Nữ"}</td>
                    <td>${user.Phone || "N/A"}</td>
                    <td>
                        <button class="delete" data-id="${user._id}">Xóa</button>
                    </td>
                `;
                usersTableBody.appendChild(row);
            });
            document.querySelectorAll(".delete").forEach(button => {
                button.addEventListener("click", (e) => {
                    const id = e.target.getAttribute("data-id");
                    deleteUser(id);
                });
            });
        } catch (error) {
            console.error("Error loading users:", error);
            usersTableBody.innerHTML = "<tr><td colspan='7'>Lỗi khi tải danh sách user</td></tr>";
        }
    }

    async function deleteUser(id) {
        if (confirm("Bạn có chắc chắn muốn xóa user này?")) {
            try {
                await fetch(`http://localhost:8000/api/users/${id}`, {
                    method: 'DELETE'
                });
                loadUsers();
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("Lỗi khi xóa user: " + error.message);
            }
        }
    }

    // Load users on page load
    loadUsers();
});