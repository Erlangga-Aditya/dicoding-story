const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy-load');
      observer.unobserve(img);
    }
  });
});

export const observeLazyLoad = (selector) => {
  const lazyImages = document.querySelectorAll(selector);
  lazyImages.forEach((img) => {
    lazyLoadObserver.observe(img);
  });
};

export default lazyLoadObserver;
