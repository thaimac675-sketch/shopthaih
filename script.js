// --- CONFIG FIREBASE (Thay bằng mã của bạn) ---
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

// --- 1. TRANG CHỦ & TÌM KIẾM KHÁCH ---
function loadProducts() {
    db.ref('shop_accs').on('value', (snapshot) => {
        const data = snapshot.val();
        const cats = ["2000", "500", "250", "150"];
        cats.forEach(c => { if(document.getElementById('container-'+c)) document.getElementById('container-'+c).innerHTML = ""; });

        for (let id in data) {
            const acc = data[id];
            const html = `
                <div class="card" data-id="${id}" data-title="${acc.title.toLowerCase()}">
                    <img src="${acc.img}">
                    <div class="card-body">
                        <h3 style="font-size:12px;">${acc.title} (ID: ${id.slice(-5)})</h3>
                        <div class="price">${parseInt(acc.price).toLocaleString()}đ</div>
                        <button class="btn-view" onclick="localStorage.setItem('viewingAccId','${id}'); window.location.href='chitiet.html'">XEM CHI TIẾT</button>
                    </div>
                </div>`;
            if(document.getElementById('container-' + acc.cat)) {
                document.getElementById('container-' + acc.cat).innerHTML += html;
            }
        }
    });
}

function searchGuest() {
    let input = document.getElementById('guestSearchID').value.toLowerCase();
    let cards = document.getElementsByClassName('card');
    for (let card of cards) {
        card.style.display = (card.getAttribute('data-title').includes(input) || card.getAttribute('data-id').includes(input)) ? "" : "none";
    }
}

// --- 2. QUẢN LÝ ADMIN (CỘNG TIỀN, TÌM KIẾM, DUYỆT THẺ) ---
function addMoneyManual() {
    const user = document.getElementById('add_user').value.trim();
    const amount = document.getElementById('add_amount').value;
    if (!user || !amount) return alert("Nhập đủ tên và tiền!");

    db.ref('users/' + user).once('value', (s) => {
        if (s.exists()) {
            db.ref('users/' + user + '/balance').transaction(c => (c || 0) + parseInt(amount));
            alert("Đã cộng tiền thành công!");
        } else alert("Tài khoản không tồn tại!");
    });
}

function searchAdmin() {
    let input = document.getElementById('adminSearchInput').value.toLowerCase();
    let rows = document.getElementById('admin-acc-list').getElementsByTagName('tr');
    for (let row of rows) {
        row.style.display = row.innerText.toLowerCase().includes(input) ? "" : "none";
    }
}

function loadAdminData() {
    // Danh sách Acc để tránh đăng trùng
    db.ref('shop_accs').on('value', (s) => {
        const list = document.getElementById('admin-acc-list');
        if(!list) return;
        list.innerHTML = "";
        const data = s.val();
        for(let id in data) {
            list.innerHTML += `<tr>
                <td><b>${data[id].tk}</b></td>
                <td>${parseInt(data[id].price).toLocaleString()}đ</td>
                <td>${data[id].cat}k</td>
                <td><button onclick="db.ref('shop_accs/${id}').remove()" style="color:red;">Xóa</button></td>
            </tr>`;
        }
    });
    // Duyệt thẻ
    db.ref('all_cards').on('value', (s) => {
        const div = document.getElementById('admin-card-list');
        if(!div) return;
        div.innerHTML = "";
        const cards = s.val();
        for(let id in cards) {
            if(cards[id].status == 0) {
                div.innerHTML += `<div style="border:1px solid #ddd; padding:10px; margin-bottom:5px;">
                    User: ${cards[id].user} | ${cards[id].amount}đ<br>
                    PIN: ${cards[id].pin} | SER: ${cards[id].serial}<br>
                    <button onclick="approveCard('${id}', '${cards[id].user}', ${cards[id].amount})" style="background:green; color:white;">Duyệt</button>
                </div>`;
            }
        }
    });
}

// --- 3. LỊCH SỬ MUA HÀNG (DÀNH CHO KHÁCH) ---
function loadBuyHistory() {
    const list = document.getElementById('buy-history-list');
    if(!list || !currentUser) return;
    db.ref('bought_accs/' + currentUser).on('value', (s) => {
        list.innerHTML = "";
        const data = s.val();
        if(!data) { list.innerHTML = "<tr><td colspan='4'>Bạn chưa mua Acc nào.</td></tr>"; return; }
        for(let id in data) {
            list.innerHTML += `<tr>
                <td>ID: ${id.slice(-5)}</td>
                <td style="color:blue; font-weight:bold;">${data[id].tk}</td>
                <td style="color:red; font-weight:bold;">${data[id].mk}</td>
                <td>${data[id].time || 'Vừa xong'}</td>
            </tr>`;
        }
    });
}

function loadCardHistory() {
    const list = document.getElementById('card-history-list');
    if(!list || !currentUser) return;
    db.ref('all_cards').orderByChild('user').equalTo(currentUser).on('value', (s) => {
        list.innerHTML = "";
        const data = s.val();
        for(let id in data) {
            const st = ["Chờ duyệt", "Thành công", "Thẻ sai"][data[id].status];
            list.innerHTML += `<tr>
                <td>${data[id].telco}</td>
                <td>${parseInt(data[id].amount).toLocaleString()}đ</td>
                <td class="status-${data[id].status}">${st}</td>
                <td>${data[id].time}</td>
            </tr>`;
        }
    });
}

// --- TIỆN ÍCH CHUNG ---
function updateHeaderUI() {
    const header = document.getElementById('userHeader');
    if (!header || !currentUser) return;
    db.ref('users/' + currentUser).on('value', (s) => {
        const data = s.val() || { balance: 0 };
        header.innerHTML = `
            <div style="text-align:right; font-size:12px;">
                <b>👤 ${currentUser}</b> | <b style="color:green;">${data.balance.toLocaleString()}đ</b><br>
                <a href="naptien.html" style="color:green;">[Nạp]</a>
                <a href="lichsu.html" style="color:orange;">[Lịch sử]</a>
                <a href="#" onclick="localStorage.clear(); location.reload();" style="color:gray;">[Thoát]</a>
            </div>`;
    });
}

window.onload = function() {
    if(document.getElementById('container-2000')) loadProducts();
    if(document.getElementById('admin-acc-list')) loadAdminData();
    updateHeaderUI();
};
