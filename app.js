const initialData = {
    currentUser: null,
    rooms: [
        { id: 1, room_code: "P.101", building: "Tòa A", capacity: 4, current_count: 2, price: 1200000, status: "Còn trống" },
        { id: 2, room_code: "P.102", building: "Tòa A", capacity: 4, current_count: 4, price: 1200000, status: "Đã đầy" },
        { id: 3, room_code: "P.201", building: "Tòa B", capacity: 6, current_count: 3, price: 900000, status: "Còn trống" },
        { id: 4, room_code: "P.202", building: "Tòa B", capacity: 6, current_count: 6, price: 900000, status: "Đã đầy" }
    ],
    registrations: [
        { id: 1, student_name: "Nguyễn Văn Sinh", room_code: "P.101", date: "2026-03-01", status: "Chờ duyệt" }
    ],
    payments: [
        { id: 1, month: "Tháng 02/2026", student_name: "Nguyễn Văn Sinh", amount: 1200000, date: "2026-02-10", status: "Đã thanh toán" },
        { id: 2, month: "Tháng 03/2026", student_name: "Nguyễn Văn Sinh", amount: 1200000, date: "-", status: "Chưa thanh toán" }
    ],
    maintenance: [
        { id: 1, title: "Hỏng bóng đèn", room: "P.101", description: "Bóng đèn bàn học bị cháy.", status: "Đang xử lý" }
    ]
};

function initStorage() {
    if (!localStorage.getItem("smartdorm_data")) {
        localStorage.setItem("smartdorm_data", JSON.stringify(initialData));
    }
}

function getData() {
    return JSON.parse(localStorage.getItem("smartdorm_data"));
}

function saveData(data) {
    localStorage.setItem("smartdorm_data", JSON.stringify(data));
}

document.getElementById("login-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();

    let role = "";
    let name = "";
    if (user === "student" && pass === "123456") {
        role = "student";
        name = "Nguyễn Văn Sinh (Sinh viên)";
    } else if (user === "manager" && pass === "123456") {
        role = "manager";
        name = "Quản trị viên (Admin)";
    } else {
        alert("Sai tên đăng nhập hoặc mật khẩu! Vui lòng dùng tài khoản demo.");
        return;
    }

    const data = getData();
    data.currentUser = { username: user, role: role, name: name };
    saveData(data);

    loadApp();
});

document.getElementById("btn-logout").addEventListener("click", function() {
    const data = getData();
    data.currentUser = null;
    saveData(data);
    document.getElementById("main-screen").classList.remove("active");
    document.getElementById("login-screen").classList.add("active");
});

function loadApp() {
    const data = getData();
    if (!data.currentUser) return;

    document.getElementById("login-screen").classList.remove("active");
    document.getElementById("main-screen").classList.add("active");
    document.getElementById("user-display-name").innerText = data.currentUser.name;

    setupNavigation(data.currentUser.role);
    renderDashboard();
    renderRooms();
    renderRegistrations();
    renderPayments();
    renderMaintenance();
}

function setupNavigation(role) {
    const navLinks = document.getElementById("nav-links");
    let html = `
        <li onclick="switchTab('dashboard')" class="active">📊 Tổng quan</li>
        <li onclick="switchTab('rooms')">🏠 Danh sách Phòng</li>
    `;
    if (role === "manager") {
        html += `<li onclick="switchTab('registrations')">📝 Duyệt Đăng Ký</li>`;
    }
    html += `
        <li onclick="switchTab('payments')">💳 Hóa đơn Thanh toán</li>
        <li onclick="switchTab('maintenance')">🛠 Báo hỏng thiết bị</li>
    `;
    navLinks.innerHTML = html;

    if (role === "manager") {
        document.getElementById("btn-add-room").style.display = "block";
    }
}

function switchTab(tabName) {
    document.querySelectorAll(".sidebar ul li").forEach(li => li.classList.remove("active"));
    event.currentTarget.classList.add("active");

    document.querySelectorAll(".tab-content").forEach(tc => tc.classList.remove("active"));
    document.getElementById(`tab-${tabName}`).classList.add("active");
}

function renderDashboard() {
    const data = getData();
    document.getElementById("stat-rooms").innerText = data.rooms.length;
    document.getElementById("stat-empty-rooms").innerText = data.rooms.filter(r => r.status === "Còn trống").length;
    document.getElementById("stat-students").innerText = "42";
    document.getElementById("stat-pending").innerText = data.registrations.filter(r => r.status === "Chờ duyệt").length;
}

function renderRooms() {
    const data = getData();
    const tbody = document.querySelector("#rooms-table tbody");
    tbody.innerHTML = "";

    data.rooms.forEach(room => {
        let actionBtn = "";
        if (data.currentUser.role === "student" && room.status === "Còn trống") {
            actionBtn = `<button class="btn btn-sm btn-primary" onclick="registerRoom('${room.room_code}')">Đăng ký</button>`;
        } else if (data.currentUser.role === "manager") {
            actionBtn = `<button class="btn btn-sm btn-danger" onclick="deleteRoom(${room.id})">Xóa</button>`;
        } else {
            actionBtn = `<span class="text-muted">Không khả dụng</span>`;
        }

        tbody.innerHTML += `
            <tr>
                <td><strong>${room.room_code}</strong></td>
                <td>${room.building}</td>
                <td>${room.capacity} người</td>
                <td>${room.current_count}/${room.capacity}</td>
                <td>${room.price.toLocaleString()} đ</td>
                <td><span class="badge ${room.status === 'Còn trống' ? 'badge-success' : 'badge-danger'}">${room.status}</span></td>
                <td>${actionBtn}</td>
            </tr>
        `;
    });
}

function registerRoom(roomCode) {
    const data = getData();
    data.registrations.push({
        id: data.registrations.length + 1,
        student_name: data.currentUser.name.split(" (")[0],
        room_code: roomCode,
        date: new Date().toISOString().split('T')[0],
        status: "Chờ duyệt"
    });
    saveData(data);
    alert("Gửi yêu cầu đăng ký phòng thành công! Vui lòng chờ Admin phê duyệt.");
    renderRegistrations();
    renderDashboard();
}

function renderRegistrations() {
    const data = getData();
    const tbody = document.querySelector("#registrations-table tbody");
    tbody.innerHTML = "";

    data.registrations.forEach((reg, index) => {
        let action = reg.status === "Chờ duyệt" && data.currentUser.role === "manager" ? `
            <button class="btn btn-sm btn-primary" onclick="approveReg(${reg.id}, 'Đã duyệt')">Duyệt</button>
            <button class="btn btn-sm btn-danger" onclick="approveReg(${reg.id}, 'Từ chối')">Từ chối</button>
        ` : `<span class="badge ${reg.status === 'Đã duyệt' ? 'badge-success' : 'badge-danger'}">${reg.status}</span>`;

        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${reg.student_name}</td>
                <td><strong>${reg.room_code}</strong></td>
                <td>${reg.date}</td>
                <td>${action}</td>
            </tr>
        `;
    });
}

function approveReg(id, status) {
    const data = getData();
    const reg = data.registrations.find(r => r.id === id);
    if (reg) {
        reg.status = status;
        if (status === "Đã duyệt") {
            const room = data.rooms.find(r => r.room_code === reg.room_code);
            if (room) {
                room.current_count += 1;
                if (room.current_count >= room.capacity) room.status = "Đã đầy";
            }
        }
        saveData(data);
        renderRegistrations();
        renderRooms();
        renderDashboard();
    }
}

function renderPayments() {
    const data = getData();
    const tbody = document.querySelector("#payments-table tbody");
    tbody.innerHTML = "";

    data.payments.forEach(pay => {
        tbody.innerHTML += `
            <tr>
                <td>${pay.month}</td>
                <td>${pay.student_name}</td>
                <td>${pay.amount.toLocaleString()} đ</td>
                <td>${pay.date}</td>
                <td><span class="badge ${pay.status === 'Đã thanh toán' ? 'badge-success' : 'badge-warning'}">${pay.status}</span></td>
                <td>${pay.status === 'Chưa thanh toán' ? `<button class="btn btn-sm btn-primary" onclick="payBill(${pay.id})">Thanh toán</button>` : 'Hoàn tất'}</td>
            </tr>
        `;
    });
}

function payBill(id) {
    const data = getData();
    const pay = data.payments.find(p => p.id === id);
    if (pay) {
        pay.status = "Đã thanh toán";
        pay.date = new Date().toISOString().split('T')[0];
        saveData(data);
        renderPayments();
        alert("Thanh toán thành công hóa đơn tiền phòng!");
    }
}

function renderMaintenance() {
    const data = getData();
    const tbody = document.querySelector("#maintenance-table tbody");
    tbody.innerHTML = "";

    data.maintenance.forEach(m => {
        let action = data.currentUser.role === "manager" ? `
            <button class="btn btn-sm btn-primary" onclick="updateMaint(${m.id})">Đổi trạng thái</button>
        ` : `<span>${m.status}</span>`;

        tbody.innerHTML += `
            <tr>
                <td><strong>${m.title}</strong></td>
                <td>${m.room}</td>
                <td>${m.description}</td>
                <td><span class="badge badge-warning">${m.status}</span></td>
                <td>${action}</td>
            </tr>
        `;
    });
}

document.getElementById("btn-add-maintenance")?.addEventListener("click", () => {
    document.getElementById("modal-maintenance").style.display = "flex";
});

function closeModal() {
    document.getElementById("modal-maintenance").style.display = "none";
}

document.getElementById("maintenance-form")?.addEventListener("submit", function(e) {
    e.preventDefault();
    const title = document.getElementById("maint-title").value;
    const desc = document.getElementById("maint-desc").value;

    const data = getData();
    data.maintenance.push({
        id: data.maintenance.length + 1,
        title: title,
        room: "P.101",
        description: desc,
        status: "Đang chờ xử lý"
    });
    saveData(data);
    closeModal();
    renderMaintenance();
    alert("Gửi yêu cầu sửa chữa thành công!");
});

function updateMaint(id) {
    const data = getData();
    const m = data.maintenance.find(x => x.id === id);
    if(m) {
        m.status = "Đã hoàn thành";
        saveData(data);
        renderMaintenance();
        alert("Đã cập nhật trạng thái sự cố!");
    }
}

window.onload = function() {
    initStorage();
    const data = getData();
    if (data.currentUser) {
        loadApp();
    }
};
document.getElementById("search-room")?.addEventListener("input", function(e) {
    const keyword = e.target.value.toLowerCase().trim();
    const data = getData();
    const tbody = document.querySelector("#rooms-table tbody");
    tbody.innerHTML = "";

    const filteredRooms = data.rooms.filter(room => room.room_code.toLowerCase().includes(keyword));

    filteredRooms.forEach(room => {
        let actionBtn = "";
        if (data.currentUser.role === "student" && room.status === "Còn trống") {
            actionBtn = `<button class="btn btn-sm btn-primary" onclick="registerRoom('${room.room_code}')">Đăng ký</button>`;
        } else if (data.currentUser.role === "manager") {
            actionBtn = `<button class="btn btn-sm btn-danger" onclick="deleteRoom(${room.id})">Xóa</button>`;
        } else {
            actionBtn = `<span class="text-muted">Không khả dụng</span>`;
        }

        tbody.innerHTML += `
            <tr>
                <td><strong>${room.room_code}</strong></td>
                <td>${room.building}</td>
                <td>${room.capacity} người</td>
                <td>${room.current_count}/${room.capacity}</td>
                <td>${room.price.toLocaleString()} đ</td>
                <td><span class="badge ${room.status === 'Còn trống' ? 'badge-success' : 'badge-danger'}">${room.status}</span></td>
                <td>${actionBtn}</td>
            </tr>
        `;
    });
});

document.getElementById("btn-add-room")?.addEventListener("click", function() {
    const roomCode = prompt("Nhập mã phòng mới (Ví dụ: P.103):");
    if (!roomCode) return;
    
    const building = prompt("Nhập tên tòa nhà (Ví dụ: Tòa A):", "Tòa A");
    const capacity = parseInt(prompt("Nhập sức chứa tối đa:", "4")) || 4;
    const price = parseFloat(prompt("Nhập giá phòng (VNĐ/tháng):", "1200000")) || 1200000;

    const data = getData();
    const exist = data.rooms.some(r => r.room_code.toLowerCase() === roomCode.toLowerCase());
    if (exist) {
        alert("Mã phòng này đã tồn tại trong hệ thống!");
        return;
    }

    data.rooms.push({
        id: data.rooms.length + 1,
        room_code: roomCode,
        building: building,
        capacity: capacity,
        current_count: 0,
        price: price,
        status: "Còn trống"
    });

    saveData(data);
    renderRooms();
    renderDashboard();
    alert("Thêm phòng mới thành công!");
});

function deleteRoom(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa phòng này không?")) return;
    const data = getData();
    data.rooms = data.rooms.filter(r => r.id !== id);
    saveData(data);
    renderRooms();
    renderDashboard();
    alert("Đã xóa phòng thành công!");
}