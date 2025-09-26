// ==== LocalStorage Cart ====
function getCart(){ return JSON.parse(localStorage.getItem('cart') || '[]'); }
function saveCart(c){ localStorage.setItem('cart', JSON.stringify(c)); }
function cartCount(){ return getCart().reduce((s,i)=>s+i.qty,0); }
function cartTotalCents(){ return getCart().reduce((s,i)=>s + i.price_cents*i.qty, 0); }

// Add to cart from a button inside .single-menu block
function addToCartFromButton(btn){
  const card = btn.closest('.single-menu');
  const id = card.dataset.productId;
  const name = card.dataset.name || id;
  const price = Number(card.dataset.priceCents || '0');
  const c = getCart();
  const ex = c.find(x=>x.id===id);
  ex ? ex.qty++ : c.push({ id, name, price_cents: price, qty: 1 });
  saveCart(c);
  refreshCartCount();
}

function refreshCartCount(){
  const el = document.querySelector('#cart-count');
  if (el) el.textContent = cartCount();
}

// Render cart table on cart.html
function renderCartTable(tbodySel, totalSel){
  const tbody = document.querySelector(tbodySel);
  const total = document.querySelector(totalSel);
  if (!tbody || !total) return;

  const c = getCart();
  tbody.innerHTML = c.map(i => `
    <tr data-id="${i.id}">
      <td>${i.name}</td>
      <td>$${(i.price_cents/100).toFixed(2)}</td>
      <td><input type="number" min="1" value="${i.qty}" class="qty-input"></td>
      <td>
        <button class="btn btn-sm btn-update">Update</button>
        <button class="btn btn-sm btn-remove">Remove</button>
      </td>
    </tr>
  `).join('');
  total.textContent = (cartTotalCents()/100).toFixed(2);
}

// Global listeners
document.addEventListener('click', e => {
  const addBtn = e.target.closest('[data-add-to-cart]');
  if (addBtn) addToCartFromButton(addBtn);

  if (e.target.matches('.btn-update')){
    const row = e.target.closest('tr');
    const id = row.getAttribute('data-id');
    const qty = Math.max(1, Number(row.querySelector('.qty-input').value||1));
    const c = getCart();
    const it = c.find(x=>x.id===id);
    if (it) it.qty = qty;
    saveCart(c);
    renderCartTable('#cart-body','#cart-total');
    refreshCartCount();
  }

  if (e.target.matches('.btn-remove')){
    const row = e.target.closest('tr');
    const id = row.getAttribute('data-id');
    saveCart(getCart().filter(x=>x.id!==id));
    renderCartTable('#cart-body','#cart-total');
    refreshCartCount();
  }
});

document.addEventListener('DOMContentLoaded', refreshCartCount);

// expose for cart.html
window.renderCartTable = renderCartTable;
