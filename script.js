// 1. CẤU HÌNH FIREBASE CHUẨN (Lấy từ video của bạn)
const firebaseConfig = {
  apiKey: "AIzaSyC75Af-i4AXLH6X...",
  authDomain: "shopthai-ea4c1.firebaseapp.com",
  databaseURL: "https://shopthai-ea4c1-default-rtdb.firebaseio.com",
  projectId: "shopthai-ea4c1",
  storageBucket: "shopthai-ea4c1.appspot.com",
  messagingSenderId: "114276793671",
  appId: "1:114276793671:web:0b257c70c675ef715f7d23",
  measurementId: "G-4SXB85FS4K"
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const currentUser = localStorage.getItem("currentUser");

// 2. CHỨC NĂNG CHO TRANG CHỦ (INDEX.HTML)
function loadProducts() {
    const list = document.getElementById('acc-list') || document.getElementById('acc-container');
    if (!list) return;

    db.ref('shop_accs').on('value', (snapshot) => {
        const data = snapshot.val();
        list.innerHTML = "";
        for (let id in data) {
            const acc = data[id];
            list.innerHTML += `
                <div class="card">
                    <img src="${acc.img}" onerror="this.src='https://via.placeholder.com/150'">
                    <div class="card-body">
                        <h3 style="font-size:13px; margin:0;">${acc.title}</h3>
                        <div class="price">${parseInt(acc.price).toLocaleString()}đ</div>
                        <button class="btn-view" onclick="goDetail('${id}')">XEM CHI TIẾT</button>
                    </div>
                </div>`;
        }
    });
}

function goDetail(id) {
    localStorage.setItem("viewingAccId", id);
    window.location.href = "chitiet.html";
}

// 3. CHỨC NĂNG CHO TRANG ADMIN (ADMIN.HTML)
function adminSaveAcc() {
    const id = Date.now();
    const data = {
        id: id,
        title: document.getElementById('t').value,
        img: document.getElementById('img').value,
        price: document.getElementById('pr').value,
        cat: document.getElementById('cat').value,
        tk: document.getElementById('tk_acc').value,
        mk: document.getElementById('mk_acc').value,
        tuong: document.getElementById('tg') ? document.getElementById('tg').value : 0,
        skin: document.getElementById('sk') ? document.getElementById('sk').value : 0
    };

    if(!data.title || !data.price) return alert("Vui lòng nhập đủ tên và giá!");

    db.ref('shop_accs/' + id).set(data).then(() => {
        alert("Đã đăng Acc thành công lên Server!");
        location.reload();
    });
}

// 4. CHỨC NĂNG NẠP TIỀN (NAPTIEN.HTML)
function sendCard() {
    if (!currentUser) return alert("Vui lòng đăng nhập!");
    const telco = document.getElementById('telco').value;
    const amount = document.getElementById('amount').value;
    const serial = document.getElementById('serial').value.trim();
    const pin = document.getElementById('pin').value.trim();

    if (!serial || !pin) return alert("Nhập đủ Serial và Mã thẻ!");

    const id = Date.now();
    db.ref('all_cards/' + id).set({
        id, user: currentUser, telco, amount, serial, pin, status: 0, time: new Date().toLocaleString()
    }).then(() => {
        alert("Gửi thẻ thành công! Chờ Admin duyệt.");
        location.reload();
    });
}

// 5. CẬP NHẬT HEADER (HIỆN TÊN VÀ TIỀN)
function updateHeaderUI() {
    const userHeader = document.getElementById('userHeader');
    if (userHeader && currentUser) {
        db.ref('users/' + currentUser).on('value', (s) => {
            const data = s.val() || { balance: 0 };
            userHeader.innerHTML = `
                <div style="text-align: right; font-size: 12px;">
                    <b>👤 ${currentUser}</b> | <b style="color:green;">${(data.balance || 0).toLocaleString()}đ</b><br>
                    <a href="naptien.html" style="color:green; font-weight:bold;">[Nạp]</a> | 
                    <a href="lichsu.html" style="color:blue;">[Lịch sử]</a> | 
                    <a href="#" onclick="localStorage.clear(); location.reload();" style="color:gray;">[Thoát]</a>
                </div>`;
        });
    }
}

// TỰ ĐỘNG CHẠY KHI TRANG WEB TẢI XONG
window.onload = function() {
    updateHeaderUI();
    loadProducts();
};
