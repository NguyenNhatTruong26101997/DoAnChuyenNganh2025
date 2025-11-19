/*
  main.js - Frontend helper: fetch API, render products, cart handling
*/

const apiFetch = async (path, opts = {}) => {
  const res = await fetch('/api' + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  return res;
};

function formatCurrency(v) {
  return v == null ? '' : v.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

async function renderProducts(containerSelector, q = '') {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const res = await apiFetch('/search?q=' + encodeURIComponent(q));
  const data = await res.json().catch(() => ({}));
  const rows = data.results || [];
  container.innerHTML = '';
  rows.forEach(p => {
    const col = document.createElement('div');
    col.className = 'col';
    col.innerHTML = `
      <div class="card h-100">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${p.TenSanPham || p.Ten || 'Sản phẩm'}</h5>
          <p class="card-text text-truncate">${(p.MoTaSanPham || p.MoTa || '')}</p>
          <div class="mt-auto">
            <p class="mb-1 fw-bold">${formatCurrency(p.GiaSanPham || p.price || 0)}</p>
            <div class="d-flex gap-2">
              <a class="btn btn-sm btn-outline-primary" href="/pages/product.html?id=${p.IdSanPham}">Xem</a>
              <button class="btn btn-sm btn-success" data-add='${JSON.stringify({ id: p.IdSanPham, name: p.TenSanPham, price: p.GiaSanPham })}'>Thêm vào giỏ</button>
            </div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
  // bind add buttons
  container.querySelectorAll('button[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const info = JSON.parse(btn.getAttribute('data-add'));
      addToCart(info.id, info.name, info.price);
      alert('Đã thêm vào giỏ');
    });
  });
}

function getCart() {
  try { return JSON.parse(localStorage.getItem('lw_cart') || '[]'); } catch { return []; }
}

function saveCart(items) { localStorage.setItem('lw_cart', JSON.stringify(items)); }

function addToCart(productId, name, price) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.productId == productId);
  if (idx >= 0) cart[idx].quantity += 1;
  else cart.push({ productId, name, price: Number(price || 0), quantity: 1 });
  saveCart(cart);
}

function removeFromCart(productId) {
  const cart = getCart().filter(i => i.productId != productId);
  saveCart(cart);
}

async function submitOrder(userId = null, address = null) {
  const cart = getCart();
  if (!cart.length) return { error: 'Giỏ hàng trống' };
  const items = cart.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price }));
  const body = { userId, items, total: cart.reduce((s, i) => s + i.price * i.quantity, 0), address };
  const res = await apiFetch('/orders', { method: 'POST', body: JSON.stringify(body) });
  const data = await res.json();
  if (res.ok && data.orderId) {
    // clear cart
    saveCart([]);
  }
  return data;
}

function renderCart(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const cart = getCart();
  container.innerHTML = '';
  if (!cart.length) { container.innerHTML = '<p>Giỏ hàng trống</p>'; return; }
  const table = document.createElement('table');
  table.className = 'table';
  table.innerHTML = `<thead><tr><th>Sản phẩm</th><th>SL</th><th>Giá</th><th>Thành tiền</th><th></th></tr></thead>`;
  const tbody = document.createElement('tbody');
  cart.forEach(i => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i.name}</td><td>${i.quantity}</td><td>${formatCurrency(i.price)}</td><td>${formatCurrency(i.price * i.quantity)}</td><td><button class="btn btn-sm btn-danger" data-remove='${i.productId}'>Xóa</button></td>`;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  const foot = document.createElement('div');
  foot.className = 'mt-3';
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  foot.innerHTML = `<p class="fw-bold">Tổng: ${formatCurrency(total)}</p><a class="btn btn-primary" href="/pages/checkout.html">Tiến hành đặt hàng</a>`;
  container.appendChild(table);
  container.appendChild(foot);
  container.querySelectorAll('button[data-remove]').forEach(b => b.addEventListener('click', () => {
    removeFromCart(b.getAttribute('data-remove'));
    renderCart(containerSelector);
  }));
}

document.addEventListener('DOMContentLoaded', () => {
  // quick search on pages that have #featured
  const quick = document.getElementById('quick-search');
  if (quick) {
    quick.addEventListener('submit', async (e) => {
      e.preventDefault();
      const q = document.getElementById('q').value;
      // if we are on index page, render there, otherwise go to search page
      if (document.querySelector('#featured')) {
        await renderProducts('#featured', q);
      } else {
        location.href = '/pages/search.html?q=' + encodeURIComponent(q);
      }
    });
  }

  // initial load featured products
  if (document.querySelector('#featured')) renderProducts('#featured', '');

  // render cart on cart page
  if (document.querySelector('#cart-root')) renderCart('#cart-root');

  // admin users list
  if (document.querySelector('#admin-users')) {
    (async () => {
      const r = await apiFetch('/admin/users');
      const j = await r.json().catch(() => ({}));
      const rows = j.users || [];
      const root = document.querySelector('#admin-users');
      root.innerHTML = '';
      rows.forEach(u => {
        const div = document.createElement('div');
        div.className = 'mb-2';
        div.textContent = `${u.IdUser} — ${u.HoTen} — ${u.Email} — ${u.ThoiDiemTao}`;
        root.appendChild(div);
      });
    })();
  }

  // product page load
  if (document.querySelector('#product-root')) {
    (async () => {
      const params = new URLSearchParams(location.search);
      const id = params.get('id');
      if (!id) { document.querySelector('#product-root').innerHTML = '<p>Missing product id</p>'; return; }
      const res = await apiFetch('/search?q=' + encodeURIComponent(id));
      const j = await res.json().catch(() => ({}));
      const p = (j.results || []).find(x => String(x.IdSanPham) === String(id)) || (j.results || [])[0] || null;
      if (!p) { document.querySelector('#product-root').innerHTML = '<p>Sản phẩm không tồn tại</p>'; return; }
      document.querySelector('#product-root').innerHTML = `
        <h2>${p.TenSanPham}</h2>
        <p class="text-muted">${formatCurrency(p.GiaSanPham)}</p>
        <p>${p.MoTaSanPham || ''}</p>
        <button id="add-to-cart" class="btn btn-success">Thêm vào giỏ</button>
      `;
      document.getElementById('add-to-cart').addEventListener('click', () => { addToCart(p.IdSanPham, p.TenSanPham, p.GiaSanPham); alert('Đã thêm vào giỏ'); });
    })();
  }

  // invoice page
  if (document.querySelector('#invoice-root')) {
    (async () => {
      const params = new URLSearchParams(location.search);
      const id = params.get('orderId');
      if (!id) { document.querySelector('#invoice-root').innerHTML = '<p>Vui lòng cung cấp orderId</p>'; return; }
      const r = await fetch('/api/invoice/' + encodeURIComponent(id));
      const j = await r.json().catch(() => ({}));
      if (j.error) { document.querySelector('#invoice-root').innerHTML = `<p>${j.error}</p>`; return; }
      const order = j.order; const items = j.items || [];
      let html = `<h4>Hóa đơn: ${order.MaDonHang || order.IdDonHang}</h4>`;
      html += `<p>Tổng: ${formatCurrency(order.TongTien || order.SoTien || 0)}</p>`;
      html += '<ul>' + items.map(it => `<li>${it.SanPhamId} x ${it.SoLuong} = ${formatCurrency(it.GiaBan)}</li>`).join('') + '</ul>';
      document.querySelector('#invoice-root').innerHTML = html;
    })();
  }
});

