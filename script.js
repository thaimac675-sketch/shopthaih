function buy() {
  document.getElementById("customAlert").style.display = "flex";
}

function closeAlert() {
  document.getElementById("customAlert").style.display = "none";
}

function filter(type) {
  let cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.style.display = (type === 'all' || card.classList.contains(type)) ? 'block' : 'none';
  });
}


