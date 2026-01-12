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


