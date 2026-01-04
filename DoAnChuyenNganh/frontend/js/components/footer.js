// Footer Component - Reusable Footer
function loadFooter() {
  const footerHTML = `
    <footer class="footer">
      <p style = "text-align: center;">&copy; www.LaptopWorld.vn .</p>
      <p style = "text-align: center;">Điện thoại: 0394127625, Địa chỉ: Càng Long, Vĩnh Long</p>
    </footer>
  `;

  document.getElementById('footer-container').innerHTML = footerHTML;
}

// Newsletter subscription function
function subscribeNewsletter(event) {
  event.preventDefault();
  const email = event.target.querySelector('input[type="email"]').value;

  // Show success message (in real app, this would send to backend)
  alert(`Cảm ơn bạn đã đăng ký! Email ${email} đã được đăng ký nhận tin khuyến mãi.`);
  event.target.reset();
}

// Load footer when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadFooter);
} else {
  loadFooter();
}
