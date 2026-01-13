function showModal(title, message, showAction = false) {
    document.getElementById("modalTitle").innerText = title;
    document.getElementById("modalMessage").innerText = message;
    const actionBtn = document.getElementById("modalAction");
    
    if (showAction) {
        actionBtn.style.display = "inline-block";
        actionBtn.onclick = () => window.location.href = "login.html";
    } else {
        actionBtn.style.display = "none";
    }
    
    document.getElementById("customModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("customModal").style.display = "none";
}

function buy() {
    // Thay thế alert cũ bằng Modal chuyên nghiệp
    showModal("THÔNG BÁO", "Vui lòng đăng nhập và nạp tiền để mua tài khoản này!", true);
}

function filter(type) {
    let cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.style.display = (type === 'all' || card.classList.contains(type)) ? 'block' : 'none';
    });
}
function handleView() {
    const loggedUser = localStorage.getItem("currentUser");

    if (!loggedUser) {
        // Kiểm tra xem phần tử Modal có tồn tại không
        const modal = document.getElementById("customModal");
        if (modal) {
            showModal("THÔNG BÁO", "Bạn vui lòng đăng nhập để xem chi tiết tài khoản này!", true);
        } else {
            // Nếu quên chưa dán HTML Modal thì hiện alert tạm thời
            alert("Vui lòng đăng nhập để xem tài khoản!");
            window.location.href = "login.html";
        }
    } else {
        // Nếu đã có tài khoản, chuyển hướng ngay
        window.location.href = "chitiet.html";
    }
}

function showModal(title, message, showAction = false) {
    document.getElementById("modalTitle").innerText = title;
    document.getElementById("modalMessage").innerText = message;
    const actionBtn = document.getElementById("modalAction");
    if (showAction) {
        actionBtn.style.display = "inline-block";
        actionBtn.onclick = () => window.location.href = "login.html";
    }
    document.getElementById("customModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("customModal").style.display = "none";
}

