function buy() {
  alert("Demo shop: Vui lòng đăng nhập và nạp tiền để mua acc.");
}

function filter(type) {
  let cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.style.display = (type === 'all' || card.classList.contains(type)) ? 'block' : 'none';
  });
}


