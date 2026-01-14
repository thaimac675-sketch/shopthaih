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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const currentUser = localStorage.getItem("currentUser");

// --- TRANG CHỦ: Tải Acc theo từng khu vực ---
function loadProducts() {
    db.ref('shop_accs').on('value', (snapshot) => {
        const data = snapshot.val();
        const cats = ["50", "150", "500", "2000"];
        cats.forEach(c => { if(document.getElementById('container-'+c)) document.getElementById('container-'+c).innerHTML = ""; });

        for (let id in data) {
            const acc = data[id];
            const html = `
                <div class="card">
                    <img src="${acc.img}" onerror="this.src='https://via.placeholder.com/150'">
                    <div class="card-body">
                        <h3 style="font-size:13px; margin:0;">${acc.title}</h3>
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

// --- ADMIN: Duyệt thẻ cào ---
function loadAdminCards() {
    const list = document.getElementById('admin-card-list');
    if(!list) return;
    db.ref('all_cards').on('value', (snapshot) => {
        list.innerHTML = "";
        const cards = snapshot.val();
        for(let id in cards) {
            if(cards[id].status == 0) {
                list.innerHTML += `
                <div style="border:1px solid #ddd; padding:10px; margin-bottom:5px; background:#fff;">
                    <b>User: ${cards[id].user}</b> - ${cards[id].telco} (${cards[id].amount}đ)<br>
                    PIN: ${cards[id].pin} - SER: ${cards[id].serial}<br>
                    <button onclick="approveCard('${id}', '${cards[id].user}', ${cards[id].amount})" style="background:green; color:white;">Duyệt</button>
                    <button onclick="db.ref('all_cards/${id}/status').set(2)" style="background:red; color:white;">Sai</button>
                </div>`;
            }
        }
    });
}

function approveCard(id, user, amount) {
    db.ref('users/' + user + '/balance').transaction(c => (c || 0) + parseInt(amount));
    db.ref('all_cards/' + id + '/status').set(1);
    alert("Đã cộng tiền!");
}

// Chạy khi load
window.onload = function() {
    if(document.getElementById('userHeader')) updateHeaderUI();
    if(document.getElementById('container-50')) loadProducts();
    if(document.getElementById('admin-card-list')) loadAdminCards();
};

function updateHeaderUI() {
    if (!currentUser) return;
    db.ref('users/' + currentUser).on('value', (s) => {
        const data = s.val() || { balance: 0 };
        document.getElementById('userHeader').innerHTML = `<b>${currentUser}</b> | <b style="color:green;">${(data.balance || 0).toLocaleString()}đ</b>`;
    });
}
