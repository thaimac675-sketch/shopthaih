// --- Cấu hình Firebase chuẩn của shopthai-ea4c1 ---
const firebaseConfig = {
    apiKey: "AIzaSyC75Af-i4AXLH6X...",
    authDomain: "shopthai-ea4c1.firebaseapp.com",
    databaseURL: "https://shopthai-ea4c1-default-rtdb.firebaseio.com",
    projectId: "shopthai-ea4c1",
    storageBucket: "shopthai-ea4c1.appspot.com",
    messagingSenderId: "114276793671",
    appId: "1:114276793671:web:0b257c70c675ef715f7d23"
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const currentUser = localStorage.getItem("currentUser");

// 1. Hàm hiển thị tiền và Header (Dùng cho index, lichsu, naptien)
function updateHeaderUI() {
    const userHeader = document.getElementById('userHeader');
    if (userHeader && currentUser) {
        db.ref('users/' + currentUser).on('value', (s) => {
            const data = s.val() || { balance: 0 };
            userHeader.innerHTML = `
                <div style="text-align: right; font-size: 12px;">
                    <b>👤 ${currentUser}</b> | <b style="color:green;">${data.balance.toLocaleString()}đ</b><br>
                    <a href="lichsu.html" style="color:blue;">[Lịch sử]</a> | 
                    <a href="#" onclick="logout()" style="color:gray;">[Thoát]</a>
                </div>`;
        });
    }
}

function logout() { localStorage.clear(); location.reload(); }

// 2. Hàm nạp thẻ (Dùng cho naptien.html)
function sendCard() {
    const telco = document.getElementById('telco').value;
    const amount = document.getElementById('amount').value;
    const serial = document.getElementById('serial').value.trim();
    const pin = document.getElementById('pin').value.trim();

    if (!serial || !pin) return alert("Vui lòng nhập đủ mã thẻ!");

    const id = Date.now();
    db.ref('all_cards/' + id).set({
        id, user: currentUser, telco, amount, serial, pin, status: 0, time: new Date().toLocaleString()
    }).then(() => alert("Gửi thẻ thành công! Chờ Admin duyệt."));
}

// 3. Hàm Đăng Acc (Dùng cho admin.html)
function adminSaveAcc() {
    const id = Date.now();
    const data = {
        id,
        title: document.getElementById('t').value,
        img: document.getElementById('img').value,
        price: document.getElementById('pr').value,
        cat: document.getElementById('cat').value,
        tk: document.getElementById('tk_acc').value,
        mk: document.getElementById('mk_acc').value
    };
    db.ref('shop_accs/' + id).set(data).then(() => alert("Đã đăng Acc thành công!"));
}

// Tự động chạy cập nhật Header khi load trang
if (typeof firebase !== 'undefined') {
    updateHeaderUI();
}
