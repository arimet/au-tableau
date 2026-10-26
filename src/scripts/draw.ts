// Progressive enhancement: scenes are fully drawn by default. With motion allowed, arm them
// (hide the drawing), then play once when 40% of the scene is on screen. The button replays.
const scenes = document.querySelectorAll<HTMLElement>('.scene');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduced && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const { isIntersecting, target } of entries) {
        if (!isIntersecting) continue;
        target.classList.add('is-playing');
        observer.unobserve(target);
      }
    },
    { threshold: 0.4 },
  );

  for (const scene of scenes) {
    scene.classList.add('is-armed');
    observer.observe(scene);
    scene.querySelector('.replay')?.addEventListener('click', () => {
      scene.classList.remove('is-playing');
      void scene.offsetWidth; // force a reflow so the animations restart
      scene.classList.add('is-playing');
    });
  }
}
