(function(){
  const prefers = window.matchMedia('(prefers-color-scheme: dark)');
  document.documentElement.dataset.theme = prefers.matches ? 'dark' : 'light';
})();
