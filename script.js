// --- 1. CẤU HÌNH FIREBASE (Kiểm tra kỹ DatabaseURL) ---
const firebaseConfig = {
    apiKey: "AIzaSyC75Af-i4AXLH6X...", 
    authDomain: "shopthai-ea4c1.firebaseapp.com",
    databaseURL: "https://shopthai-ea4c1-default-rtdb.firebaseio.com",
    projectId: "shopthai-ea4c1",
    storageBucket: "shopthai-ea4c1.appspot.com",
    messagingSenderId: "114276793671",
    appId: "1:114276793671:web:0b257c70c675ef715f7d23"
};

// Khởi tạo Firebase với kiểm tra lỗi
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    var db = firebase.database();
} catch (e) {
    console.error("Lỗi khởi tạo Firebase: ", e);
}

const currentUser = localStorage.getItem("currentUser");

// --- 2. QUẢN LÝ ADMIN (ĐĂNG ACC, CỘNG TIỀN, TÌM KIẾM) ---

// Hàm Đăng Acc (Thêm Số Tướng & Số Skin)
function adminSaveAcc() {
    console.log("Đang gọi hàm adminSaveAcc..."); // Kiểm tra trong Console F12
    
    const title = document.getElementById('t').value;
    const img = document.getElementById('img').value;
    const price = document.getElementById('pr').value;
    const tuong = document.getElementById('tuong').value;
    const skin = document.getElementById('skin').value;
    const cat = document.getElementById('cat').value;
    const tk = document.getElementById('tk_acc').value.trim();
    const mk = document.getElementById('mk_acc').value.trim();

    if (!tk || !mk || !price) {
        alert("Vui lòng nhập đủ: Tài khoản, Mật khẩu và Giá!");
        return;
    }

    const newAcc = {
        title: title || "Acc Liên Quân Giá Rẻ",
        img: img || "https://via.placeholder.com/150",
        price: parseInt(price),
        tuong: tuong || 0,
        skin: skin || 0,
        cat: cat,
        tk: tk,
        mk: mk,
        status: "available",
        date: new Date().toLocaleString()
    };

    db.ref('shop_accs').push(newAcc)
        .then(() => {
            alert("✅ ĐĂNG ACC THÀNH CÔNG!");
            // Xóa dữ liệu cũ trong ô nhập
            ['t','img','pr','tuong','skin','tk_acc','mk_acc'].forEach(id => {
                if(document.getElementById(id)) document.getElementById(id).value = "";
            });
        })
        .catch(err => alert("❌ Lỗi khi đăng: " + err.message));
}

// Hàm Cộng Tiền Thủ Công
function addMoneyManual() {
    const user = document.getElementById('add_user').value.trim();
    const amount = parseInt(document.getElementById('add_amount').value);

    if (!user || isNaN(amount)) {
        alert("Vui lòng nhập tên khách và số tiền!");
        return;
    }

    db.ref('users/' + user).once('value').then((s) => {
        if (s.exists()) {
            db.ref('users/' + user + '/balance').transaction(c => (c || 0) + amount)
                .then(() => {
                    alert(`✅ Đã cộng ${amount.toLocaleString()}đ cho tài khoản ${user}`);
                    document.getElementById('add_amount').value = "";
                });
        } else {
            alert("❌ Tài khoản khách này chưa từng đăng nhập vào shop!");
        }
    });
}

// Hàm Tải Danh Sách Acc Quản Lý
function loadAdminData() {
    const list = document.getElementById('admin-acc-list');
    if (!list) return;

    db.ref('shop_accs').on('value', (snapshot) => {
        list.innerHTML = "";
        const data = snapshot.val();
        if (!data) {
            list.innerHTML = "<tr><td colspan='3'>Trống...</td></tr>";
            return;
        }

        for (let id in data) {
            const acc = data[id];
            list.innerHTML += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding:10px;">
                        <b>${acc.tk}</b><br>
                        <small style="color:red;">${acc.tuong} Tướng - ${acc.skin} Skin</small>
                    </td>
                    <td>${acc.price.toLocaleString()}đ</td>
                    <td><button onclick="deleteAcc('${id}')" style="color:red; border:none; background:none; cursor:pointer;">[Xóa]</button></td>
                </tr>`;
        }
    });
}

function deleteAcc(id) {
    if(confirm("Xóa acc này?")) db.ref('shop_accs/' + id).remove();
}

// --- 3. HIỂN THỊ TRANG CHỦ & HEADER ---

function updateHeaderUI() {
    const header = document.getElementById('userHeader');
    if (!header) return;

    if (currentUser) {
        header.innerHTML = `
            <div style="text-align:right; font-size:12px;">
                <b style="color:#e11d48;">👤 ${currentUser}</b> | <b id="headerBalance" style="color:green;">...đ</b><br>
                <a href="lichsu.html" style="color:orange; font-weight:bold; text-decoration:none;">[Lịch sử]</a>
                <a href="#" onclick="localStorage.clear(); location.reload();" style="color:gray; margin-left:5px;">[Thoát]</a>
            </div>`;

        db.ref('users/' + currentUser + '/balance').on('value', (s) => {
            const bal = s.val() || 0;
            if(document.getElementById('headerBalance')) 
                document.getElementById('headerBalance').innerText = bal.toLocaleString() + "đ";
        });
    } else {
        header.innerHTML = `<a href="login.html" style="text-decoration:none; font-weight:bold; color:gray;">Đăng nhập</a>`;
    }
}

function loadProducts() {
    db.ref('shop_accs').on('value', (snapshot) => {
        const data = snapshot.val();
        const cats = ["2000", "500", "250", "150"];
        cats.forEach(c => { if(document.getElementById('container-'+c)) document.getElementById('container-'+c).innerHTML = ""; });

        for (let id in data) {
            const acc = data[id];
            const html = `
                <div class="card">
                    <img src="${acc.img}" onerror="this.src='https://via.placeholder.com/150'">
                    <div class="card-body">
                        <h3 style="font-size:12px; height:32px; overflow:hidden;">${acc.title}</h3>
                        <p style="font-size:11px; color:#666; margin:5px 0;">⚔️ ${acc.tuong} Tướng | 🎭 ${acc.skin} Skin</p>
                        <div class="price">${acc.price.toLocaleString()}đ</div>
                        <button onclick="localStorage.setItem('viewingAccId','${id}'); window.location.href='chitiet.html'">XEM CHI TIẾT</button>
                    </div>
                </div>`;
            const target = document.getElementById('container-' + acc.cat);
            if(target) target.innerHTML += html;
        }
    });
}

// --- KHỞI CHẠY ---
window.onload = function() {
    updateHeaderUI();
    if (document.getElementById('admin-acc-list')) loadAdminData();
    if (document.getElementById('container-2000')) loadProducts();
};
