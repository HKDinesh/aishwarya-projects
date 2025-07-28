document.addEventListener('DOMContentLoaded', () => {
  // Check if dependencies are loaded
  if (typeof THREE === 'undefined') {
    console.error('Three.js failed to load. Please check the CDN or network connection.');
    return;
  }
  if (typeof Lenis === 'undefined') {
    console.error('Lenis failed to load. Please check the CDN or network connection.');
    return;
  }
  if (typeof lottie === 'undefined') {
    console.error('Lottie failed to load. Please check the CDN or network connection.');
    return;
  }

  // Initialize Lenis for smooth scrolling with parallax
  const lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  // Parallax effect on scroll
  lenis.on('scroll', ({ scroll }) => {
    document.querySelectorAll('.services-section, .projects-section, .progressContainer, .cta, .our-vision, .live-comments').forEach((section, index) => {
      const offset = scroll - (section.offsetTop || 0);
      section.style.transform = `translateY(${offset * (0.05 * (index + 1))}px)`;
    });
  });

  // Navbar toggle
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('navLinks');
  const navIcon = navToggle.querySelector('i');
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    if (navLinks.classList.contains('active')) {
      navIcon.classList.remove('fa-bars');
      navIcon.classList.add('fa-times');
    } else {
      navIcon.classList.remove('fa-times');
      navIcon.classList.add('fa-bars');
    }
  });

  // Splash screen
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.body.classList.add('loaded');
    }, 2000); // Delay for splash screen
  });

  // Project filter
  document.getElementById('project-filter').addEventListener('change', function () {
    const val = this.value;
    document.querySelectorAll('.project-card').forEach((card) => {
      card.style.display = val === 'all' || card.dataset.type === val ? '' : 'none';
    });
  });

  // Live clock
  function updateClock() {
    const now = new Date();
    document.getElementById('live-clock').textContent = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Custom Cursor
  const cursor = document.querySelector('.cursor');
  const cursorText = document.querySelector('.cursor__text');
  document.addEventListener('mousemove', (e) => {
    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    cursor.classList.remove('cursor--hidden');
  });

  document.addEventListener('mouseleave', () => {
    cursor.classList.add('cursor--hidden');
  });

  document.querySelectorAll('a, button, .card').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor--active');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor--active');
    });
  });

  // Three.js Particle Background
  const canvas = document.getElementById('webgl-background');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const particlesGeometry = new THREE.BufferGeometry();
  const particleCount = 5000;
  const posArray = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    posArray[i] = (Math.random() - 0.5) * 100;
    posArray[i + 1] = (Math.random() - 0.5) * 100;
    posArray[i + 2] = (Math.random() - 0.5) * 100;
    velocities[i] = (Math.random() - 0.5) * 0.01;
    velocities[i + 1] = (Math.random() - 0.5) * 0.01;
    velocities[i + 2] = (Math.random() - 0.5) * 0.01;
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const material = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x97c80e,
    transparent: true,
    opacity: 0.6,
  });

  const particles = new THREE.Points(particlesGeometry, material);
  scene.add(particles);

  camera.position.z = 5;

  // Mouse interaction
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  function animate() {
    requestAnimationFrame(animate);
    particles.rotation.y += 0.002;
    const positions = particlesGeometry.attributes.position.array;
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] += velocities[i] + mouseX * 0.001;
      positions[i + 1] += velocities[i + 1] + mouseY * 0.001;
      positions[i + 2] += velocities[i + 2];
      if (Math.abs(positions[i]) > 50) velocities[i] *= -1;
      if (Math.abs(positions[i + 1]) > 50) velocities[i + 1] *= -1;
      if (Math.abs(positions[i + 2]) > 50) velocities[i + 2] *= -1;
    }
    particlesGeometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  // Hero Section Three.js Effect
  const heroCanvas = document.querySelector('.hero-canvas');
  const heroScene = new THREE.Scene();
  const heroCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const heroRenderer = new THREE.WebGLRenderer({ canvas: heroCanvas, alpha: true });
  heroRenderer.setSize(window.innerWidth, window.innerHeight);

  const heroGeometry = new THREE.TorusGeometry(2, 0.4, 16, 100);
  const heroMaterial = new THREE.MeshBasicMaterial({ color: 0x1a73e8, wireframe: true });
  const torus = new THREE.Mesh(heroGeometry, heroMaterial);
  heroScene.add(torus);

  heroCamera.position.z = 5;

  function animateHero() {
    requestAnimationFrame(animateHero);
    torus.rotation.x += 0.01;
    torus.rotation.y += 0.01;
    heroRenderer.render(heroScene, heroCamera);
  }
  animateHero();

  window.addEventListener('resize', () => {
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroCamera.aspect = window.innerWidth / window.innerHeight;
    heroCamera.updateProjectionMatrix();
  });

  // Lottie Animations
  const lottieContainers = document.querySelectorAll('.lottie-animation-container');
  lottieContainers.forEach((container, index) => {
    try {
      lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: `https://assets.lottiefiles.com/packages/lf20_${index % 2 ? '3pgxyh' : 'j3t2y0'}.json`, // Alternating animations
      });
    } catch (e) {
      console.error('Failed to load Lottie animation:', e);
    }
  });

  // Lottie for Splash Screen
  const splashLottie = document.querySelector('#splash-screen .lottie-animation-container');
  try {
    lottie.loadAnimation({
      container: splashLottie,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'https://assets.lottiefiles.com/packages/lf20_1z4b6k.json', // Splash-specific animation
    });
  } catch (e) {
    console.error('Failed to load splash Lottie animation:', e);
  }

  // Lottie for WhatsApp Button
  const whatsappBtn = document.querySelector('.whatsapp-btn');
  const whatsappLottie = whatsappBtn.querySelector('.lottie-animation-container');
  whatsappBtn.addEventListener('mouseenter', () => {
    whatsappLottie.style.opacity = '1';
  });
  whatsappBtn.addEventListener('mouseleave', () => {
    whatsappLottie.style.opacity = '0';
  });

  // Lottie for Floating WhatsApp
  const floatingWhatsapp = document.querySelector('.floating-whatsapp');
  const floatingLottie = floatingWhatsapp.querySelector('.lottie-animation-container');
  floatingWhatsapp.addEventListener('mouseenter', () => {
    floatingLottie.style.opacity = '0.4';
  });
  floatingWhatsapp.addEventListener('mouseleave', () => {
    floatingLottie.style.opacity = '0';
  });
});