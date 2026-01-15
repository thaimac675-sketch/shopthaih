// --- 1. CẤU HÌNH FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyC75Af-i4AXLH6X...",
    authDomain: "shopthai-ea4c1.firebaseapp.com",
    databaseURL: "https://shopthai-ea4c1-default-rtdb.firebaseio.com",
    projectId: "shopthai-ea4c1",
    storageBucket: "shopthai-ea4c1.appspot.com",
    messagingSenderId: "114276793671",
    appId: "1:114276793671:web:0b257c70c675ef715f7d23"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const currentUser = localStorage.getItem("currentUser");

// --- 2. XỬ LÝ HEADER (CHẶN LỖI NHÁY CHỮ ĐĂNG NHẬP) ---
function updateHeaderUI() {
    const header = document.getElementById('userHeader');
    if (!header) return;

    if (currentUser) {
        // Hiện khung User ngay lập tức từ LocalStorage
        header.innerHTML = `
            <div style="text-align:right; font-size:12px;">
                <b style="color:#e11d48;">👤 ${currentUser}</b> | <b id="headerBalance" style="color:green;">...đ</b><br>
                <a href="naptien.html" style="color:green; font-weight:bold; text-decoration:none;">[Nạp]</a>
                <a href="lichsu.html" style="color:orange; font-weight:bold; text-decoration:none;">[Lịch sử]</a>
                <a href="#" onclick="logout()" style="color:gray; text-decoration:none; margin-left:5px;">[Thoát]</a>
            </div>`;

        // Cập nhật số dư thực tế từ Firebase
        db.ref('users/' + currentUser).on('value', (s) => {
            const data = s.val() || { balance: 0 };
            const balanceEl = document.getElementById('headerBalance');
            if (balanceEl) balanceEl.innerText = data.balance.toLocaleString() + "đ";
        });
    } else {
        header.innerHTML = `<a href="login.html" style="font-weight:bold; text-decoration:none; color:#64748b;">Đăng nhập</a>`;
    }
}

function logout() {
    localStorage.removeItem("currentUser");
    location.href = "index.html";
}

// --- 3. XỬ LÝ MUA ACC (DÙNG TRONG CHITIET.HTML) ---
function buyAcc() {
    if (!currentUser) return alert("Vui lòng đăng nhập để mua Acc!");
    
    const accId = localStorage.getItem("viewingAccId");
    if (!accId) return alert("Không tìm thấy thông tin Acc!");

    db.ref('shop_accs/' + accId).once('value', (snapshot) => {
        const acc = snapshot.val();
        if (!acc) return alert("Acc này đã bị ai đó mua mất rồi!");

        const price = parseInt(acc.price);

        db.ref('users/' + currentUser).once('value', (userSnap) => {
            const user = userSnap.val() || { balance: 0 };
            
            if (user.balance < price) {
                return alert("Bạn không đủ tiền! Vui lòng nạp thêm.");
            }

            if (confirm(`Bạn có chắc muốn mua Acc này với giá ${price.toLocaleString()}đ?`)) {
                // 1. Trừ tiền khách
                db.ref('users/' + currentUser + '/balance').set(user.balance - price);

                // 2. Lưu vào lịch sử mua của khách
                const buyTime = new Date().toLocaleString();
                db.ref('bought_accs/' + currentUser + '/' + accId).set({
                    ...acc,
                    time: buyTime
                });

                // 3. Xóa Acc khỏi shop để người khác không thấy
                db.ref('shop_accs/' + accId).remove();

                alert("Mua thành công! Vào phần Lịch Sử để xem tài khoản mật khẩu.");
                window.location.href = "lichsu.html";
            }
        });
    });
}

// --- 4. LOGIC TRANG CHỦ & TÌM KIẾM ---
function loadProducts() {
    db.ref('shop_accs').on('value', (snapshot) => {
        const data = snapshot.val();
        const cats = ["2000", "500", "250", "150"];
        cats.forEach(c => { 
            const el = document.getElementById('container-' + c);
            if (el) el.innerHTML = ""; 
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
            const container = document.getElementById('container-' + acc.cat);
            if (container) container.innerHTML += html;
        }
    });
}

function searchGuest() {
    let input = document.getElementById('guestSearchID').value.toLowerCase();
    let cards = document.getElementsByClassName('card');
    for (let card of cards) {
        let title = card.getAttribute('data-title');
        let id = card.getAttribute('data-id');
        card.style.display = (title.includes(input) || id.includes(input)) ? "" : "none";
    }
}

// --- 5. LOGIC ADMIN ---
function addMoneyManual() {
    const user = document.getElementById('add_user').value.trim();
    const amount = document.getElementById('add_amount').value;
    if (!user || !amount) return alert("Vui lòng nhập đủ tên và tiền!");

    db.ref('users/' + user).once('value', (s) => {
        if (s.exists()) {
            db.ref('users/' + user + '/balance').transaction(c => (c || 0) + parseInt(amount));
            alert("Cộng tiền thành công!");
        } else alert("Tài khoản không tồn tại!");
    });
}

function loadAdminData() {
    db.ref('shop_accs').on('value', (s) => {
        const list = document.getElementById('admin-acc-list');
        if (!list) return;
        list.innerHTML = "";
        const data = s.val();
        for (let id in data) {
            list.innerHTML += `
                <tr>
                    <td><b>${data[id].tk}</b></td>
                    <td>${parseInt(data[id].price).toLocaleString()}đ</td>
                    <td>${data[id].cat}k</td>
                    <td><button onclick="db.ref('shop_accs/${id}').remove()" style="color:red; border:none; cursor:pointer;">Xóa</button></td>
                </tr>`;
        }
    });

    db.ref('all_cards').on('value', (s) => {
        const div = document.getElementById('admin-card-list');
        if (!div) return;
        div.innerHTML = "";
        const cards = s.val();
        for (let id in cards) {
            if (cards[id].status == 0) {
                div.innerHTML += `
                <div style="border:1px solid #ddd; padding:10px; margin-bottom:5px;">
                    <b>Khách: ${cards[id].user}</b> - ${cards[id].amount}đ<br>
                    PIN: ${cards[id].pin} | SER: ${cards[id].serial}<br>
                    <button onclick="approveCard('${id}', '${cards[id].user}', ${cards[id].amount})" style="background:green; color:white;">Duyệt</button>
                </div>`;
            }
        }
    });
}

function approveCard(id, user, amt) {
    db.ref('users/' + user + '/balance').transaction(c => (c || 0) + parseInt(amt));
    db.ref('all_cards/' + id + '/status').set(1);
    alert("Thành công!");
}

// --- 6. LOGIC LỊCH SỬ ---
function loadBuyHistory() {
    const list = document.getElementById('buy-history-list');
    if (!list || !currentUser) return;
    db.ref('bought_accs/' + currentUser).on('value', (s) => {
        list.innerHTML = "";
        const data = s.val();
        if (!data) { list.innerHTML = "<tr><td colspan='4'>Bạn chưa mua Acc nào.</td></tr>"; return; }
        for (let id in data) {
            list.innerHTML += `
                <tr>
                    <td>ID: ${id.slice(-5)}</td>
                    <td style="color:blue; font-weight:bold;">${data[id].tk}</td>
                    <td style="color:red; font-weight:bold;">${data[id].mk}</td>
                    <td>${data[id].time}</td>
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
