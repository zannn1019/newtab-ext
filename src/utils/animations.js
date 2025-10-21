/**
 * Advanced GSAP Animation Utilities
 * High-performance, reusable animation patterns for Zan
 */

import gsap from "gsap";

/**
 * Magnetic Button Effect
 * Buttons subtly attract the cursor as it approaches
 */
export const createMagneticEffect = (element, strength = 0.3) => {
  if (!element) return;

  const handleMouseMove = (e) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    gsap.to(element, {
      x: deltaX,
      y: deltaY,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.3)",
    });
  };

  element.addEventListener("mousemove", handleMouseMove);
  element.addEventListener("mouseleave", handleMouseLeave);

  return () => {
    element.removeEventListener("mousemove", handleMouseMove);
    element.removeEventListener("mouseleave", handleMouseLeave);
  };
};

/**
 * Text Reveal Animation
 * Characters appear with stagger and slight rotation
 */
export const revealText = (element, options = {}) => {
  const {
    duration = 0.6,
    stagger = 0.03,
    ease = "power3.out",
    delay = 0,
  } = options;

  // Split text into characters
  const text = element.textContent;
  element.innerHTML = text
    .split("")
    .map(
      (char) =>
        `<span class="char" style="display: inline-block; opacity: 0;">${
          char === " " ? "&nbsp;" : char
        }</span>`
    )
    .join("");

  const chars = element.querySelectorAll(".char");

  return gsap.fromTo(
    chars,
    {
      opacity: 0,
      y: 20,
      rotationX: -90,
    },
    {
      opacity: 1,
      y: 0,
      rotationX: 0,
      duration,
      stagger,
      ease,
      delay,
    }
  );
};

/**
 * Liquid Morph Transition
 * Creates a fluid blob that morphs between views
 */
export const createLiquidMorph = (options = {}) => {
  const { duration = 1.2, ease = "power4.inOut" } = options;

  // Create SVG morph overlay
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "liquid-morph-overlay");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("preserveAspectRatio", "none");
  svg.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 9999;
  `;

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", "#fff");
  svg.appendChild(path);
  document.body.appendChild(svg);

  const tl = gsap.timeline();

  // Morph in
  tl.fromTo(
    path,
    { attr: { d: "M 0 100 V 100 Q 50 100 100 100 V 100 z" } },
    {
      attr: { d: "M 0 100 V 0 Q 50 0 100 0 V 100 z" },
      duration: duration / 2,
      ease,
    }
  );

  // Morph out
  tl.to(path, {
    attr: { d: "M 0 0 V 0 Q 50 0 100 0 V 0 z" },
    duration: duration / 2,
    ease,
    onComplete: () => {
      svg.remove();
    },
  });

  return tl;
};

/**
 * Glitch Effect
 * Subtle digital glitch animation for emphasis
 */
export const glitchEffect = (element, intensity = "medium") => {
  const intensityMap = {
    low: { duration: 0.1, repeat: 2, distance: 2 },
    medium: { duration: 0.08, repeat: 3, distance: 5 },
    high: { duration: 0.06, repeat: 5, distance: 10 },
  };

  const config = intensityMap[intensity];
  const tl = gsap.timeline();

  for (let i = 0; i < config.repeat; i++) {
    tl.to(element, {
      x: Math.random() * config.distance - config.distance / 2,
      duration: config.duration,
      ease: "steps(1)",
    }).to(element, {
      x: 0,
      duration: config.duration,
      ease: "steps(1)",
    });
  }

  return tl;
};

/**
 * Particle Burst
 * Creates particles that burst from an element
 */
export const particleBurst = (element, count = 20) => {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const particles = [];
  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9998;
  `;
  document.body.appendChild(container);

  for (let i = 0; i < count; i++) {
    const particle = document.createElement("div");
    particle.style.cssText = `
      position: absolute;
      width: 4px;
      height: 4px;
      background: #fff;
      border-radius: 50%;
      left: ${centerX}px;
      top: ${centerY}px;
    `;
    container.appendChild(particle);
    particles.push(particle);
  }

  const tl = gsap.timeline({
    onComplete: () => {
      container.remove();
    },
  });

  particles.forEach((particle, i) => {
    const angle = (Math.PI * 2 * i) / count;
    const distance = 100 + Math.random() * 100;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    tl.to(
      particle,
      {
        x,
        y,
        opacity: 0,
        scale: 0,
        duration: 0.8,
        ease: "power2.out",
      },
      0
    );
  });

  return tl;
};

/**
 * Ripple Effect
 * Creates expanding ripple from click point
 */
export const createRipple = (element, event) => {
  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const ripple = document.createElement("span");
  ripple.style.cssText = `
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    pointer-events: none;
  `;

  element.style.position = "relative";
  element.style.overflow = "hidden";
  element.appendChild(ripple);

  gsap.to(ripple, {
    width: 500,
    height: 500,
    opacity: 0,
    duration: 0.6,
    ease: "power2.out",
    onComplete: () => ripple.remove(),
  });
};

/**
 * Breathing Animation
 * Subtle scale pulse for ambient elements
 */
export const breathingAnimation = (element, options = {}) => {
  const { scale = 1.05, duration = 3, ease = "sine.inOut" } = options;

  return gsap.to(element, {
    scale,
    duration,
    ease,
    repeat: -1,
    yoyo: true,
  });
};

/**
 * Typewriter Effect
 * Text appears character by character
 */
export const typewriter = (element, text, options = {}) => {
  const { speed = 0.05, cursor = true } = options;

  element.textContent = "";
  const chars = text.split("");

  const tl = gsap.timeline();

  chars.forEach((char, i) => {
    tl.call(
      () => {
        element.textContent += char;
      },
      null,
      i * speed
    );
  });

  if (cursor) {
    const cursorElement = document.createElement("span");
    cursorElement.textContent = "|";
    cursorElement.style.opacity = "1";
    element.appendChild(cursorElement);

    gsap.to(cursorElement, {
      opacity: 0,
      duration: 0.5,
      repeat: -1,
      yoyo: true,
      ease: "steps(1)",
    });
  }

  return tl;
};

/**
 * 3D Card Tilt
 * Elements tilt based on mouse position
 */
export const create3DTilt = (element, intensity = 15) => {
  const handleMouseMove = (e) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) / rect.width;
    const deltaY = (e.clientY - centerY) / rect.height;

    gsap.to(element, {
      rotationY: deltaX * intensity,
      rotationX: -deltaY * intensity,
      duration: 0.3,
      ease: "power2.out",
      transformPerspective: 1000,
    });
  };

  const handleMouseLeave = () => {
    gsap.to(element, {
      rotationY: 0,
      rotationX: 0,
      duration: 0.5,
      ease: "power2.out",
    });
  };

  element.addEventListener("mousemove", handleMouseMove);
  element.addEventListener("mouseleave", handleMouseLeave);

  return () => {
    element.removeEventListener("mousemove", handleMouseMove);
    element.removeEventListener("mouseleave", handleMouseLeave);
  };
};
