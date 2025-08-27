/* Debounce Utility */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/* Particle System Class */
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.particleCount = window.innerWidth < 768 ? 30 : 60;
    this.mouse = { x: 0, y: 0 };
    this.init();
    this.bindEvents();
  }

  init() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        color: `hsl(${Math.random() * 60 + 200}, 70%, 60%)`
      });
    }
  }

  bindEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    });
  }

  update() {
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Mouse interaction
      const dx = this.mouse.x - particle.x;
      const dy = this.mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 100) {
        particle.vx += dx * 0.0001;
        particle.vy += dy * 0.0001;
      }

      // Boundary check
      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

      // Keep particles in bounds
      particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
      particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(particle => {
      this.ctx.save();
      this.ctx.globalAlpha = particle.opacity;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    // Draw connections
    this.particles.forEach((particle, i) => {
      this.particles.slice(i + 1).forEach(otherParticle => {
        const dx = particle.x - otherParticle.x;
        const dy = particle.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          this.ctx.save();
          this.ctx.globalAlpha = (100 - distance) / 100 * 0.2;
          this.ctx.strokeStyle = particle.color;
          this.ctx.lineWidth = 0.5;
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(otherParticle.x, otherParticle.y);
          this.ctx.stroke();
          this.ctx.restore();
        }
      });
    });
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

/* Initialize Everything on DOMContentLoaded */
document.addEventListener('DOMContentLoaded', () => {
  /* Theme Toggle Logic */
  const themeButton = document.querySelector('.theme-button');
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  };

  // Apply saved theme or system preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  if (themeButton) {
    themeButton.addEventListener('click', () => {
      const currentTheme = localStorage.getItem('theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
    });
  }

  /* Smooth Scrolling with Lenis */
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothTouch: true,
    touchMultiplier: 1.5,
    smoothWheel: true,
    wheelMultiplier: 0.7,
    infinite: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  /* Create Particle Canvas */
  const particleCanvas = document.createElement('canvas');
  particleCanvas.id = 'particle-canvas';
  particleCanvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -2;
    pointer-events: none;
    opacity: 0.6;
  `;
  document.body.appendChild(particleCanvas);

  const particleSystem = new ParticleSystem(particleCanvas);
  particleSystem.animate();

  /* Lazy Load SVG Animations with GSAP */
  const animationContainers = document.querySelectorAll('.animation-container');
  const animationObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        gsap.fromTo(
          entry.target.querySelector('svg'),
          { opacity: 0, scale: 0.8, rotationY: -180 },
          { opacity: 1, scale: 1, rotationY: 0, duration: 0.8, ease: 'back.out(1.7)' }
        );
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '100px' });

  animationContainers.forEach(container => animationObserver.observe(container));

  /* Enhanced Splash Screen Animation with GSAP */
  const splashScreen = document.getElementById('splash-screen');
  const splashLogo = document.getElementById('splash-logo');
  if (splashScreen && splashLogo) {
    gsap.fromTo(
      splashLogo,
      {
        x: '-100vw',
        y: '100vh',
        scale: 0.5,
        rotation: -45,
        opacity: 0,
      },
      {
        x: '80vw',
        y: '-80vh',
        scale: 1.2,
        rotation: 360,
        opacity: 1,
        duration: 0.3,
        ease: 'elastic.out(1, 0.5)',
        onComplete: () => {
          gsap.to(splashLogo, {
            scale: 1,
            duration: 0,
            ease: 'power2.out',
          });
        },
      }
    );

    gsap.to(splashScreen, {
      opacity: 0,
      duration: 0.5,
      delay: 0.5,
      ease: 'power2.out',
      onComplete: () => {
        splashScreen.classList.add('hidden');
      },
    });
  }

  /* Hamburger Toggle and Sidebar */
  const hamburgerToggle = document.getElementById('hamburger-toggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarBackdrop = document.getElementById('sidebar-backdrop');

  if (hamburgerToggle && sidebar && sidebarBackdrop) {
    // Toggle sidebar
    hamburgerToggle.addEventListener('click', () => {
      const isOpen = sidebar.classList.contains('open');
      sidebar.classList.toggle('open');
      hamburgerToggle.classList.toggle('open');
      sidebarBackdrop.classList.toggle('open');
      
      gsap.to(sidebar, {
        x: isOpen ? '-100%' : '0%',
        duration: 0.4,
        ease: 'back.out(1.7)',
      });

      gsap.to(sidebarBackdrop, {
        opacity: isOpen ? 0 : 1,
        duration: 0.4,
        ease: 'power3.out',
        onComplete: () => {
          if (!isOpen) {
            sidebarBackdrop.style.display = 'block';
          } else {
            sidebarBackdrop.style.display = 'none';
          }
        },
      });

      // Animate sidebar items with stagger
      gsap.fromTo(
        '.sidebar-item',
        { opacity: 0, x: -30, rotationY: -90 },
        { opacity: 1, x: 0, rotationY: 0, stagger: 0.1, duration: 0.6, ease: 'back.out(1.7)', delay: isOpen ? 0 : 0.2 }
      );
    });

    // Close sidebar on backdrop click
    sidebarBackdrop.addEventListener('click', () => {
      sidebar.classList.remove('open');
      hamburgerToggle.classList.remove('open');
      sidebarBackdrop.classList.remove('open');

      gsap.to(sidebar, { x: '-100%', duration: 0.4, ease: 'power3.out' });
      gsap.to(sidebarBackdrop, {
        opacity: 0,
        duration: 0.4,
        ease: 'power3.out',
        onComplete: () => {
          sidebarBackdrop.style.display = 'none';
        },
      });
    });

    // Close sidebar on click outside (desktop or mobile)
    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !hamburgerToggle.contains(e.target) && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        hamburgerToggle.classList.remove('open');
        sidebarBackdrop.classList.remove('open');

        gsap.to(sidebar, { x: '-100%', duration: 0.4, ease: 'power3.out' });
        gsap.to(sidebarBackdrop, {
          opacity: 0,
          duration: 0.4,
          ease: 'power3.out',
          onComplete: () => {
            sidebarBackdrop.style.display = 'none';
          },
        });
      }
    });

    // Touch swipe to close
    let touchStartX = 0;
    document.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    });

    document.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      if (sidebar.classList.contains('open') && touchStartX - touchEndX > 50) {
        sidebar.classList.remove('open');
        hamburgerToggle.classList.remove('open');
        sidebarBackdrop.classList.remove('open');

        gsap.to(sidebar, { x: '-100%', duration: 0.4, ease: 'power3.out' });
        gsap.to(sidebarBackdrop, {
          opacity: 0,
          duration: 0.4,
          ease: 'power3.out',
          onComplete: () => {
            sidebarBackdrop.style.display = 'none';
          },
        });
      }
    });

    // Enhanced hover animations for sidebar items
    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        gsap.to(item, {
          scale: 1.05,
          rotationY: 5,
          z: 20,
          duration: 0.3,
          ease: 'power2.out',
        });
      });
      item.addEventListener('mouseleave', () => {
        gsap.to(item, {
          scale: 1,
          rotationY: 0,
          z: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      });
    });
  }

  /* Project Filter with Debounce */
  const projectFilter = document.getElementById('project-filter');
  const projectCards = document.querySelectorAll('.project-card');
  if (projectFilter && projectCards.length) {
    const filterProjects = debounce((filter) => {
      projectCards.forEach(card => {
        if (filter === 'all' || card.dataset.type === filter) {
          card.style.display = 'block';
          gsap.fromTo(card, 
            { opacity: 0, y: 30, rotationX: -90 }, 
            { opacity: 1, y: 0, rotationX: 0, duration: 0.6, ease: 'back.out(1.7)' }
          );
        } else {
          gsap.to(card, {
            opacity: 0,
            y: -20,
            rotationX: 90,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
              card.style.display = 'none';
            }
          });
        }
      });
    }, 200);

    projectFilter.addEventListener('change', (e) => {
      filterProjects(e.target.value);
    });
  }

  /* Enhanced GSAP Animations */
  gsap.from('.card', {
    opacity: 0,
    y: 50,
    rotationX: -30,
    stagger: 0.2,
    duration: 0.8,
    ease: 'back.out(1.7)',
    scrollTrigger: {
      trigger: '.card',
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    },
  });

  gsap.from('header h1', {
    opacity: 0,
    x: -50,
    rotationY: -45,
    duration: 1,
    ease: 'back.out(1.7)',
    scrollTrigger: {
      trigger: 'header',
      start: 'top 85%',
    },
  });

  /* Advanced Three.js Background with Multiple Geometries */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('webgl-background'), 
    alpha: true,
    antialias: true
  });
  
  const isMobile = window.innerWidth <= 768;
  renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  camera.position.z = 8;

  // Create multiple geometric objects
  const objects = [];
  
  // Floating spheres
  for (let i = 0; i < 8; i++) {
    const geometry = new THREE.SphereGeometry(0.3 + Math.random() * 0.4, 16, 16);
    const material = new THREE.MeshBasicMaterial({ 
      color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.7, 0.6),
      transparent: true,
      opacity: 0.6,
      wireframe: Math.random() > 0.5
    });
    const sphere = new THREE.Mesh(geometry, material);
    
    sphere.position.set(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 10
    );
    
    sphere.userData = {
      originalPosition: { ...sphere.position },
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      },
      floatSpeed: Math.random() * 0.01 + 0.005,
      floatRange: Math.random() * 2 + 1
    };
    
    scene.add(sphere);
    objects.push(sphere);
  }

  // Floating torus rings
  for (let i = 0; i < 5; i++) {
    const geometry = new THREE.TorusGeometry(0.8 + Math.random() * 0.5, 0.2, 8, 20);
    const material = new THREE.MeshBasicMaterial({ 
      color: new THREE.Color().setHSL(Math.random() * 0.2 + 0.7, 0.8, 0.5),
      transparent: true,
      opacity: 0.4,
      wireframe: true
    });
    const torus = new THREE.Mesh(geometry, material);
    
    torus.position.set(
      (Math.random() - 0.5) * 25,
      (Math.random() - 0.5) * 25,
      (Math.random() - 0.5) * 8
    );
    
    torus.userData = {
      originalPosition: { ...torus.position },
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.015,
        y: (Math.random() - 0.5) * 0.015,
        z: (Math.random() - 0.5) * 0.015
      },
      floatSpeed: Math.random() * 0.008 + 0.003,
      floatRange: Math.random() * 1.5 + 0.5
    };
    
    scene.add(torus);
    objects.push(torus);
  }

  // Floating boxes
  for (let i = 0; i < 6; i++) {
    const size = 0.4 + Math.random() * 0.6;
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshBasicMaterial({ 
      color: new THREE.Color().setHSL(Math.random() * 0.15 + 0.15, 0.7, 0.6),
      transparent: true,
      opacity: 0.5,
      wireframe: Math.random() > 0.3
    });
    const box = new THREE.Mesh(geometry, material);
    
    box.position.set(
      (Math.random() - 0.5) * 22,
      (Math.random() - 0.5) * 22,
      (Math.random() - 0.5) * 6
    );
    
    box.userData = {
      originalPosition: { ...box.position },
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.025,
        y: (Math.random() - 0.5) * 0.025,
        z: (Math.random() - 0.5) * 0.025
      },
      floatSpeed: Math.random() * 0.012 + 0.006,
      floatRange: Math.random() * 2.5 + 1
    };
    
    scene.add(box);
    objects.push(box);
  }

  // Mouse interaction
  const mouse = { x: 0, y: 0 };
  let mouseInfluence = 0;

  window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    mouseInfluence = 1;
  });

  // Gradually reduce mouse influence
  setInterval(() => {
    mouseInfluence *= 0.95;
  }, 50);

  let animationId;
  let time = 0;

  function animate() {
    animationId = requestAnimationFrame(animate);
    time += 0.01;
    
    objects.forEach((obj, index) => {
      // Rotation
      obj.rotation.x += obj.userData.rotationSpeed.x;
      obj.rotation.y += obj.userData.rotationSpeed.y;
      obj.rotation.z += obj.userData.rotationSpeed.z;
      
      // Floating motion
      obj.position.y = obj.userData.originalPosition.y + 
        Math.sin(time * obj.userData.floatSpeed + index) * obj.userData.floatRange;
      
      obj.position.x = obj.userData.originalPosition.x + 
        Math.cos(time * obj.userData.floatSpeed * 0.7 + index) * (obj.userData.floatRange * 0.5);
      
      // Mouse interaction
      if (mouseInfluence > 0.1) {
        const distanceFromMouse = Math.sqrt(
          Math.pow(mouse.x * 10 - obj.position.x, 2) + 
          Math.pow(mouse.y * 10 - obj.position.y, 2)
        );
        
        if (distanceFromMouse < 5) {
          const force = (5 - distanceFromMouse) / 5 * mouseInfluence;
          obj.position.x += (mouse.x * 10 - obj.position.x) * force * 0.02;
          obj.position.y += (mouse.y * 10 - obj.position.y) * force * 0.02;
          
          // Add some rotation based on mouse movement
          obj.rotation.x += force * 0.05;
          obj.rotation.z += force * 0.03;
        }
      }
    });
    
    // Gentle camera movement
    camera.position.x = Math.sin(time * 0.2) * 2;
    camera.position.y = Math.cos(time * 0.15) * 1;
    camera.lookAt(0, 0, 0);
    
    renderer.render(scene, camera);
  }

  const canvasObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!animationId) animate();
      } else {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    });
  });
  canvasObserver.observe(document.getElementById('webgl-background'));

  const debouncedResize = debounce(() => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 1.5));
  }, 100);

  window.addEventListener('resize', debouncedResize);
  animate();

  /* Enhanced Hero Canvas with Dynamic Geometry */
  const heroCanvas = document.querySelector('.hero-canvas');
  if (heroCanvas) {
    const heroRenderer = new THREE.WebGLRenderer({ 
      canvas: heroCanvas, 
      alpha: true,
      antialias: true
    });
    const heroHeight = isMobile ? 150 : 250;
    heroRenderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 1.5));
    heroRenderer.setSize(window.innerWidth, heroHeight);
    heroRenderer.setClearColor(0x000000, 0);
    
    const heroScene = new THREE.Scene();
    const heroCamera = new THREE.PerspectiveCamera(75, window.innerWidth / heroHeight, 0.1, 1000);
    heroCamera.position.z = 6;

    // Create morphing geometry
    const heroObjects = [];
    
    // Main central object that morphs
    const heroGeometry = new THREE.IcosahedronGeometry(1.2, 1);
    const heroMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x28a745,
      transparent: true,
      opacity: 0.8,
      wireframe: true
    });
    const heroMesh = new THREE.Mesh(heroGeometry, heroMaterial);
    heroScene.add(heroMesh);
    heroObjects.push(heroMesh);

    // Orbiting smaller objects
    for (let i = 0; i < 4; i++) {
      const orbitGeometry = new THREE.TetrahedronGeometry(0.3);
      const orbitMaterial = new THREE.MeshBasicMaterial({ 
        color: new THREE.Color().setHSL(0.3 + i * 0.1, 0.8, 0.6),
        transparent: true,
        opacity: 0.6
      });
      const orbitMesh = new THREE.Mesh(orbitGeometry, orbitMaterial);
      
      orbitMesh.userData = {
        angle: (i / 4) * Math.PI * 2,
        radius: 3,
        speed: 0.02 + i * 0.005
      };
      
      heroScene.add(orbitMesh);
      heroObjects.push(orbitMesh);
    }

    let heroAnimationId;
    let heroTime = 0;

    function heroAnimate() {
      heroAnimationId = requestAnimationFrame(heroAnimate);
      heroTime += 0.01;
      
      // Main object rotation and scaling
      heroMesh.rotation.x += 0.01;
      heroMesh.rotation.y += 0.015;
      heroMesh.scale.setScalar(1 + Math.sin(heroTime * 2) * 0.1);
      
      // Update orbiting objects
      heroObjects.slice(1).forEach((obj, index) => {
        obj.userData.angle += obj.userData.speed;
        obj.position.x = Math.cos(obj.userData.angle) * obj.userData.radius;
        obj.position.y = Math.sin(obj.userData.angle) * obj.userData.radius * 0.5;
        obj.position.z = Math.sin(obj.userData.angle * 2) * 1;
        
        obj.rotation.x += 0.02;
        obj.rotation.y += 0.025;
      });
      
      // Camera oscillation
      heroCamera.position.x = Math.sin(heroTime * 0.5) * 0.5;
      heroCamera.position.y = Math.cos(heroTime * 0.3) * 0.3;
      heroCamera.lookAt(0, 0, 0);
      
      heroRenderer.render(heroScene, heroCamera);
    }

    const heroCanvasObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!heroAnimationId) heroAnimate();
        } else {
          cancelAnimationFrame(heroAnimationId);
          heroAnimationId = null;
        }
      });
    });
    heroCanvasObserver.observe(heroCanvas);

    const debouncedHeroResize = debounce(() => {
      const newHeroHeight = isMobile ? 150 : 250;
      heroCamera.aspect = window.innerWidth / newHeroHeight;
      heroCamera.updateProjectionMatrix();
      heroRenderer.setSize(window.innerWidth, newHeroHeight);
      heroRenderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 1.5));
    }, 100);

    window.addEventListener('resize', debouncedHeroResize);
    heroAnimate();
  }

  /* Parallax Effect */
  let ticking = false;
  function updateParallax() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.parallax-element');
    
    parallaxElements.forEach((element, index) => {
      const speed = (index + 1) * 0.5;
      const yPos = -(scrolled * speed);
      element.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
    
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  });

  /* Interactive Card Hover Effects */
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mouseenter', (e) => {
      gsap.to(card, {
        rotationX: 5,
        rotationY: 5,
        scale: 1.02,
        z: 50,
        duration: 0.4,
        ease: 'power2.out'
      });
    });

    card.addEventListener('mouseleave', (e) => {
      gsap.to(card, {
        rotationX: 0,
        rotationY: 0,
        scale: 1,
        z: 0,
        duration: 0.4,
        ease: 'power2.out'
      });
    });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / centerY * -10;
      const rotateY = (x - centerX) / centerX * 10;
      
      gsap.to(card, {
        rotationX: rotateX,
        rotationY: rotateY,
        duration: 0.2,
        ease: 'power2.out'
      });
    });
  });

  /* Live Clock */
  function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' });
    const clockElement = document.getElementById('live-clock');
    if (clockElement) {
      clockElement.textContent = `${timeString} IST`;
    }
  }
  setInterval(updateClock, 1000);
  updateClock();

  /* Sound Button */
  const soundButton = document.querySelector('.sound-button');
  if (soundButton) {
    soundButton.addEventListener('click', () => {
      console.log('Sound toggled');
      // Add sound toggle logic here
      gsap.to(soundButton, {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
    });
  }

  /* Dynamic Background Color Based on Time */
  function updateBackgroundGradient() {
    const hour = new Date().getHours();
    let hue1, hue2;
    
    if (hour >= 6 && hour < 12) {
      // Morning: warm colors
      hue1 = 200; hue2 = 240;
    } else if (hour >= 12 && hour < 18) {
      // Afternoon: bright colors
      hue1 = 180; hue2 = 220;
    } else if (hour >= 18 && hour < 22) {
      // Evening: warm/orange colors
      hue1 = 250; hue2 = 290;
    } else {
      // Night: cool/purple colors
      hue1 = 260; hue2 = 300;
    }
    
    const isDark = document.body.classList.contains('dark');
    const opacity = isDark ? 0.03 : 0.05;
    
    document.body.style.setProperty('--dynamic-gradient', 
      `linear-gradient(45deg, 
        hsla(${hue1}, 70%, 60%, ${opacity}), 
        hsla(${hue2}, 70%, 60%, ${opacity}), 
        hsla(${hue1 + 20}, 70%, 60%, ${opacity}), 
        hsla(${hue1}, 70%, 60%, ${opacity}))`
    );
  }

  // Update gradient every minute
  updateBackgroundGradient();
  setInterval(updateBackgroundGradient, 60000);

  /* Intersection Observer for Animations */
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);

  // Observe all elements with data-animate attribute
  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
});

/* CSS Custom Properties Update */
document.documentElement.style.setProperty('--dynamic-gradient', 
  'linear-gradient(45deg, rgba(59, 130, 246, 0.05), rgba(168, 85, 247, 0.05))');
  
  