// --- 1. CẤU HÌNH FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyC75Af-i4AXLH6X...", // Giữ nguyên của bạn
    authDomain: "shopthai-ea4c1.firebaseapp.com",
    databaseURL: "https://shopthai-ea4c1-default-rtdb.firebaseio.com",
    projectId: "shopthai-ea4c1",
    storageBucket: "shopthai-ea4c1.appspot.com",
    messagingSenderId: "114276793671",
    appId: "1:114276793671:web:0b257c70c675ef715f7d23"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();
const currentUser = localStorage.getItem("currentUser");

// --- 2. XỬ LÝ GIAO DIỆN HEADER (FIX LỖI NHÁY ĐĂNG NHẬP) ---
function updateHeaderUI() {
    const header = document.getElementById('userHeader');
    if (!header) return;

    if (currentUser) {
        // Hiện ngay lập tức để chặn chữ "Đăng nhập"
        header.innerHTML = `
            <div style="text-align:right; font-size:12px;">
                <b style="color:#e11d48;">👤 ${currentUser}</b> | <b id="headerBalance" style="color:green;">...đ</b><br>
                <a href="naptien.html" style="color:green; font-weight:bold; text-decoration:none;">[Nạp]</a>
                <a href="lichsu.html" style="color:orange; font-weight:bold; text-decoration:none;">[Lịch sử]</a>
                <a href="#" onclick="logout()" style="color:gray; text-decoration:none; margin-left:5px;">[Thoát]</a>
            </div>`;

        db.ref('users/' + currentUser + '/balance').on('value', (s) => {
            const balance = s.val() || 0;
            const balanceEl = document.getElementById('headerBalance');
            if (balanceEl) balanceEl.innerText = balance.toLocaleString() + "đ";
        });
    } else {
        header.innerHTML = `<a href="login.html" style="font-weight:bold; text-decoration:none; color:#64748b;">Đăng nhập</a>`;
    }
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

// --- 3. QUẢN LÝ ADMIN: CỘNG TIỀN - DUYỆT THẺ - ĐĂNG ACC ---

// Hàm cộng tiền thủ công (ATM/Momo)
function addMoneyManual() {
    const username = document.getElementById('add_user').value.trim();
    const amount = parseInt(document.getElementById('add_amount').value);

    if (!username || isNaN(amount)) return alert("Vui lòng điền đủ tên khách và số tiền!");

    db.ref('users/' + username).once('value', (snapshot) => {
        if (snapshot.exists()) {
            db.ref('users/' + username + '/balance').transaction((current) => {
                return (current || 0) + amount;
            }).then(() => {
                alert(`Thành công! Đã cộng ${amount.toLocaleString()}đ cho ${username}`);
                document.getElementById('add_amount').value = "";
            });
        } else {
            alert("Tài khoản khách hàng này không tồn tại!");
        }
    });
}

// Hàm đăng Acc mới
function adminSaveAcc() {
    const tk = document.getElementById('tk_acc').value.trim();
    const mk = document.getElementById('mk_acc').value.trim();
    const price = document.getElementById('pr').value;
    const cat = document.getElementById('cat').value;
    const title = document.getElementById('t').value;
    const img = document.getElementById('img').value;

    if (!tk || !mk || !price) return alert("Vui lòng nhập đủ Tài khoản, Mật khẩu và Giá!");

    const accData = { 
        tk, mk, price: parseInt(price), cat, title, img, 
        status: "available",
        createdAt: firebase.database.ServerValue.TIMESTAMP 
    };

    db.ref('shop_accs').push(accData).then(() => {
        alert("Đăng Acc thành công!");
        document.getElementById('tk_acc').value = "";
        document.getElementById('mk_acc').value = "";
    }).catch(err => alert("Lỗi: " + err.message));
}

// Hàm tải dữ liệu quản lý cho Admin
function loadAdminData() {
    const accList = document.getElementById('admin-acc-list');
    const cardList = document.getElementById('admin-card-list');

    // Tải danh sách Acc đã đăng
    if (accList) {
        db.ref('shop_accs').on('value', (snapshot) => {
            accList.innerHTML = "";
            const data = snapshot.val();
            if (!data) {
                accList.innerHTML = "<tr><td colspan='3'>Chưa có Acc nào.</td></tr>";
                return;
            }
            for (let id in data) {
                const acc = data[id];
                accList.innerHTML += `
                    <tr>
                        <td style="padding:10px; border-bottom:1px solid #eee;">${acc.tk}</td>
                        <td>${parseInt(acc.price).toLocaleString()}đ</td>
                        <td><button onclick="deleteAcc('${id}')" style="color:red; border:none; background:none; cursor:pointer;">[Xóa]</button></td>
                    </tr>`;
            }
        });
    }

    // Tải danh sách thẻ chờ duyệt
    if (cardList) {
        db.ref('all_cards').on('value', (snapshot) => {
            cardList.innerHTML = "";
            const cards = snapshot.val();
            let hasPending = false;
            for (let id in cards) {
                if (cards[id].status === 0) {
                    hasPending = true;
                    cardList.innerHTML += `
                        <div style="border:1px solid #ddd; padding:10px; margin-bottom:10px; background:#fff;">
                            <b>User: ${cards[id].user}</b> | ${cards[id].amount}đ<br>
                            Mã: ${cards[id].pin} | Seri: ${cards[id].serial}<br>
                            <button onclick="approveCard('${id}', '${cards[id].user}', ${cards[id].amount})" style="background:green; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Duyệt</button>
                            <button onclick="db.ref('all_cards/${id}/status').set(2)" style="background:red; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Thẻ Sai</button>
                        </div>`;
                }
            }
            if (!hasPending) cardList.innerHTML = "Không có thẻ nào chờ duyệt.";
        });
    }
}

function deleteAcc(id) {
    if (confirm("Xóa Acc này khỏi shop?")) db.ref('shop_accs/' + id).remove();
}

function approveCard(id, user, amt) {
    db.ref('users/' + user + '/balance').transaction(c => (c || 0) + parseInt(amt));
    db.ref('all_cards/' + id + '/status').set(1);
    alert("Đã duyệt thẻ!");
}

function searchAdmin() {
    const input = document.getElementById('adminSearchInput').value.toLowerCase();
    const rows = document.getElementById('admin-acc-list').getElementsByTagName('tr');
    for (let row of rows) {
        row.style.display = row.innerText.toLowerCase().includes(input) ? "" : "none";
    }
}

// --- 4. TRANG CHỦ & LỊCH SỬ ---
function loadProducts() {
    db.ref('shop_accs').on('value', (snapshot) => {
        const data = snapshot.val();
        const cats = ["2000", "500", "250", "150"];
        cats.forEach(c => { 
            const container = document.getElementById('container-' + c);
            if (container) container.innerHTML = ""; 
        });

        for (let id in data) {
            const acc = data[id];
            const html = `
                <div class="card" data-title="${acc.title.toLowerCase()}" data-id="${id}">
                    <img src="${acc.img}" onerror="this.src='https://via.placeholder.com/150'">
                    <div class="card-body">
                        <h3 style="font-size:12px; height:32px; overflow:hidden;">${acc.title} (ID: ${id.slice(-5)})</h3>
                        <div class="price">${parseInt(acc.price).toLocaleString()}đ</div>
                        <button onclick="localStorage.setItem('viewingAccId','${id}'); window.location.href='chitiet.html'">XEM CHI TIẾT</button>
                    </div>
                </div>`;
            const target = document.getElementById('container-' + acc.cat);
            if (target) target.innerHTML += html;
        }
    });
}

function loadBuyHistory() {
    const list = document.getElementById('buy-history-list');
    if (!list || !currentUser) return;
    db.ref('bought_accs/' + currentUser).on('value', (s) => {
        list.innerHTML = "";
        const data = s.val();
        if (!data) { list.innerHTML = "<tr><td colspan='4'>Chưa mua Acc nào.</td></tr>"; return; }
        for (let id in data) {
            list.innerHTML += `
                <tr>
                    <td>ID: ${id.slice(-5)}</td>
                    <td style="color:blue;"><b>${data[id].tk}</b></td>
                    <td style="color:red;"><b>${data[id].mk}</b></td>
                    <td>${data[id].time || 'Vừa xong'}</td>
                </tr>`;
        }
    });
}

// --- KHỞI CHẠY ---
window.onload = function() {
    updateHeaderUI();
    if (document.getElementById('container-2000')) loadProducts();
    if (document.getElementById('admin-acc-list')) loadAdminData();
    if (document.getElementById('buy-history-list')) loadBuyHistory();
};
