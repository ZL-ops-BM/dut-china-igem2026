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
    const pointer = { x: -9999, y: -9999 };
    let particles = [];

    const colors = ['199,255,79', '255,114,94', '255,207,74', '237,246,234'];
    const reset = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = width < 700 ? 40 : 68;
      particles = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: index % 12 === 0 ? 4.5 + Math.random() * 2.5 : 1.6 + Math.random() * 2,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.4,
        color: colors[index % colors.length],
        alpha: 0.45 + Math.random() * 0.4,
      }));
    };

    const draw = () => {
      if (!active || document.hidden) {
        frame = window.requestAnimationFrame(draw);
        return;
      }
      context.clearRect(0, 0, width, height);

      // soft spring toward the pointer (world coordinates)
      particles.forEach((particle) => {
        const dx = pointer.x - particle.x;
        const dy = pointer.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 && dist > 0.001) {
          const pull = (1 - dist / 150) * 0.45;
          particle.speedX += (dx / dist) * pull;
          particle.speedY += (dy / dist) * pull;
        }

        // gentle damping keeps motion stable near the pointer
        particle.speedX *= 0.965;
        particle.speedY *= 0.965;

        const speed = Math.sqrt(particle.speedX * particle.speedX + particle.speedY * particle.speedY);
        const maxSpeed = 1.6;
        if (speed > maxSpeed) {
          particle.speedX = (particle.speedX / speed) * maxSpeed;
          particle.speedY = (particle.speedY / speed) * maxSpeed;
        }

        particle.x += particle.speedX;
        particle.y += particle.speedY;
        if (particle.x < -20) particle.x = width + 20;
        if (particle.x > width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = height + 20;
        if (particle.y > height + 20) particle.y = -20;

        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(${particle.color},${particle.alpha})`;
        context.fill();
      });

      // proximity network: links fade in between close particles and light up
      // as they gather around the pointer
      context.lineWidth = 1;
      for (let i = 0; i < particles.length - 1; i++) {
        const first = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const second = particles[j];
          const dx = first.x - second.x;
          const dy = first.y - second.y;
          const distanceSquared = dx * dx + dy * dy;
          if (distanceSquared < 11025) { // 105px threshold
            const distance = Math.sqrt(distanceSquared);
            context.strokeStyle = `rgba(199,255,79,${(1 - distance / 105) * 0.3})`;
            context.beginPath();
            context.moveTo(first.x, first.y);
            context.lineTo(second.x, second.y);
            context.stroke();
          }
        }
      }

      frame = window.requestAnimationFrame(draw);
    };

    canvas.addEventListener('pointermove', (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    });
    canvas.addEventListener('pointerleave', () => {
      pointer.x = -9999;
      pointer.y = -9999;
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
