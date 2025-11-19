document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('quick-search');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const q = document.getElementById('q').value;
      const res = await fetch('/api/search?q=' + encodeURIComponent(q));
      const data = await res.json();
      console.log('Search results', data);
      alert('Xem console để xem kết quả tìm kiếm (demo).');
    });
  }
});
