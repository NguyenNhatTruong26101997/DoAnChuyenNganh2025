// Scroll to Top Button Component
function loadScrollToTop() {
  // Create button HTML
  const buttonHTML = `
    <button id="scrollToTopBtn" class="scroll-to-top-btn" title="Lên đầu trang">
      <i class="fas fa-arrow-up"></i>
    </button>
  `;

  // Add button to body
  document.body.insertAdjacentHTML('beforeend', buttonHTML);

  // Add CSS styles
  const style = document.createElement('style');
  style.textContent = `
    .scroll-to-top-btn {
      position: fixed;
      bottom: 110px;
      right: 30px;
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 20px;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 998;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .scroll-to-top-btn:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
      background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    }

    .scroll-to-top-btn.show {
      opacity: 1;
      visibility: visible;
    }

    .scroll-to-top-btn:active {
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .scroll-to-top-btn {
        bottom: 100px;
        right: 20px;
        width: 45px;
        height: 45px;
        font-size: 18px;
      }
    }
  `;
  document.head.appendChild(style);

  // Get button element
  const scrollBtn = document.getElementById('scrollToTopBtn');

  // Show/hide button based on scroll position
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      scrollBtn.classList.add('show');
    } else {
      scrollBtn.classList.remove('show');
    }
  });

  // Scroll to top when button is clicked
  scrollBtn.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Load scroll to top button when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadScrollToTop);
} else {
  loadScrollToTop();
}
