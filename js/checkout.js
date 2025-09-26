// --- helpers shared with cart.js ---
function getCart(){ return JSON.parse(localStorage.getItem('cart') || '[]'); }
function saveCart(c){ localStorage.setItem('cart', JSON.stringify(c)); }
function money(cents){ return (cents/100).toFixed(2); }

// shipping rule: flat 0 for demo, change if needed
const SHIPPING_CENTS = 0;

// render summary
(function renderSummary(){
  const body = document.getElementById('sum-body');
  const items = getCart();
  if (!items.length){
    body.innerHTML = '<tr><td colspan="2">Your cart is empty.</td></tr>';
    document.getElementById('sum-items').textContent = '0.00';
    document.getElementById('sum-ship').textContent = money(SHIPPING_CENTS);
    document.getElementById('sum-total').textContent = '0.00';
    return;
  }
  body.innerHTML = items.map(i => {
    const sub = i.price_cents * i.qty;
    return `<tr><td>${i.name} × ${i.qty}</td><td style="text-align:right">$${money(sub)}</td></tr>`;
  }).join('');
  const itemsTotal = items.reduce((s,i)=>s + i.price_cents*i.qty, 0);
  document.getElementById('sum-items').textContent = money(itemsTotal);
  document.getElementById('sum-ship').textContent = money(SHIPPING_CENTS);
  document.getElementById('sum-total').textContent = money(itemsTotal + SHIPPING_CENTS);
})();

// handle submit
document.getElementById('checkout-form').addEventListener('submit', function(e){
  e.preventDefault();
  const form = new FormData(e.target);
  const order = {
    id: 'ORD-' + Date.now(),
    placed_at: new Date().toISOString(),
    payment: form.get('payment') || 'cod',
    customer: {
      name: form.get('name'),
      phone: form.get('phone'),
      email: form.get('email') || '',
      address: form.get('address'),
      city: form.get('city'),
      postal: form.get('postal'),
      notes: form.get('notes') || ''
    },
    items: getCart(),
    totals: (function(){
      const itemsTotal = getCart().reduce((s,i)=>s + i.price_cents*i.qty, 0);
      return {
        items_cents: itemsTotal,
        shipping_cents: SHIPPING_CENTS,
        grand_cents: itemsTotal + SHIPPING_CENTS
      }
    })(),
    status: 'placed' // since COD
  };

  // save orders list
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));

  // clear cart and go to success
  localStorage.removeItem('cart');
  window.location = 'success.html?order=' + encodeURIComponent(order.id);
});
