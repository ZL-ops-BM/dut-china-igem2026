(() => {
  const canvas = document.querySelector('[data-motion="hero-particles"]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const makeParticles = () => {
    if (!(canvas instanceof HTMLCanvasElement) || reduceMotion) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let active = true;
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let particles = [];

    const colors = ['rgba(199,255,79,.75)', 'rgba(255,114,94,.62)', 'rgba(255,207,74,.55)', 'rgba(237,246,234,.36)'];
    const reset = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = width < 700 ? 34 : 68;
      particles = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1.5 + Math.random() * (index % 7 === 0 ? 8 : 3),
        speedX: (Math.random() - 0.5) * 0.13,
        speedY: (Math.random() - 0.5) * 0.1,
        color: colors[index % colors.length],
      }));
    };

    const draw = () => {
      if (!active || document.hidden) {
        frame = window.requestAnimationFrame(draw);
        return;
      }
      context.clearRect(0, 0, width, height);
      pointer.x += (pointer.targetX - pointer.x) * 0.035;
      pointer.y += (pointer.targetY - pointer.y) * 0.035;

      particles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        if (particle.x < -20) particle.x = width + 20;
        if (particle.x > width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = height + 20;
        if (particle.y > height + 20) particle.y = -20;
        const depth = (index % 5 + 1) / 5;
        const x = particle.x + pointer.x * depth * 18;
        const y = particle.y + pointer.y * depth * 12;
        context.beginPath();
        context.arc(x, y, particle.radius, 0, Math.PI * 2);
        context.strokeStyle = particle.color;
        context.lineWidth = index % 7 === 0 ? 1.2 : 0.7;
        context.stroke();
      });

      for (let index = 0; index < particles.length - 1; index += 6) {
        const first = particles[index];
        const second = particles[index + 1];
        context.beginPath();
        context.moveTo(first.x, first.y);
        context.lineTo(second.x, second.y);
        context.strokeStyle = 'rgba(199,255,79,.09)';
        context.lineWidth = 1;
        context.stroke();
      }
      frame = window.requestAnimationFrame(draw);
    };

    canvas.addEventListener('pointermove', (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    });
    canvas.addEventListener('pointerleave', () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
    });
    window.addEventListener('resize', reset);
    new IntersectionObserver(([entry]) => { active = entry.isIntersecting; }, { threshold: 0.01 }).observe(canvas);
    reset();
    draw();
    window.addEventListener('pagehide', () => window.cancelAnimationFrame(frame), { once: true });
  };

  const makeTimelines = () => {
    const processLine = document.querySelector('[data-process-line]');
    if (reduceMotion || !window.gsap || !window.ScrollTrigger) {
      if (processLine) processLine.style.transform = 'scaleX(1)';
      return;
    }

    window.gsap.registerPlugin(window.ScrollTrigger);
    const heroItems = window.gsap.utils.toArray('[data-hero-reveal]');
    const heroTimeline = window.gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTimeline
      .from(heroItems[0], { autoAlpha: 0, x: -24, duration: 0.45 }, 0.18)
      .from(heroItems.slice(1, 4), { autoAlpha: 0, y: 54, duration: 0.78, stagger: 0.12, ease: 'expo.out' }, 0.28)
      .from(heroItems[4], { autoAlpha: 0, x: 32, duration: 0.62, ease: 'sine.out' }, 0.58)
      .from('.home-hero__orbit--one', { scale: 0.72, autoAlpha: 0, rotation: -18, duration: 1.1, ease: 'circ.out' }, 0.32)
      .from('.home-hero__orbit--two', { scale: 0.45, autoAlpha: 0, rotation: 24, duration: 0.88, ease: 'back.out(1.4)' }, 0.5);

    const processTimeline = window.gsap.timeline({
      scrollTrigger: { trigger: '[data-motion="process-rail"]', start: 'top 78%', end: 'bottom 62%', scrub: 0.65 },
    });
    processTimeline
      .to(processLine, { scaleX: 1, duration: 1, ease: 'none' }, 0)
      .from('[data-process-step]', { autoAlpha: 0, y: 36, duration: 0.7, stagger: 0.16, ease: 'power2.out' }, 0.08);
  };

  makeParticles();
  makeTimelines();
})();
