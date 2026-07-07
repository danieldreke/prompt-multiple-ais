(function () {
  var theme = localStorage.getItem('theme') || 'auto';
  var isLight = theme === 'light' || (theme === 'auto' && matchMedia('(prefers-color-scheme: light)').matches);
  if (isLight) document.body.classList.add('light');
})();
