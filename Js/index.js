const outer = document.getElementById("cursor-outer");
const inner = document.getElementById("cursor-inner");

let mouseX = 0,
    mouseY = 0;
let outerX = 0,
    outerY = 0;

document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    inner.style.left = `${mouseX}px`;
    inner.style.top = `${mouseY}px`;
});

function animateOuter() {
    outerX += (mouseX - outerX) / 8;
    outerY += (mouseY - outerY) / 8;
    outer.style.left = `${outerX}px`;
    outer.style.top = `${outerY}px`;
    requestAnimationFrame(animateOuter);
}
animateOuter();

// CLICK EFFECT
document.addEventListener("mousedown", () => {
    outer.classList.add("click-effect");
    inner.classList.add("click-effect");
});

document.addEventListener("mouseup", () => {
    outer.classList.remove("click-effect");
    inner.classList.remove("click-effect");
});

const burger = document.getElementById('burger');
const menu = document.getElementById('menu');
const logo = document.getElementById('logo');
const menuItems = document.querySelectorAll('.menu nav ul li');

gsap.set(menu, { y: '-100%' });  // Initialize menu off screen

let isOpen = false;

burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    isOpen = !isOpen;

    if (isOpen) {
        gsap.to(menu, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            onStart: () => {
                menu.style.pointerEvents = 'auto';
            }
        });

        gsap.to(logo, {
            y: -20,
            opacity: 0.5,
            duration: 0.6,
            ease: 'power2.out'
        });

        gsap.to(menuItems, {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            delay: 0.2,
            ease: 'power2.out'
        });

    } else {
        gsap.to(menuItems, {
            y: 20,
            opacity: 0,
            duration: 0.3,
            stagger: -0.05,
            ease: 'power1.in'
        });

        gsap.to(menu, {
            y: '-100%',
            opacity: 0,
            duration: 0.8,
            ease: 'power3.in',
            onComplete: () => {
                menu.style.pointerEvents = 'none';
            }
        });

        gsap.to(logo, {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out'
        });
    }
});


gsap.registerPlugin(ScrollTrigger);

const moveAmount = 2520; // Image scroll distance

// Unified scroll trigger for everything
const scrollTriggerSettings = {
    trigger: ".scroll-wrapper",
    start: "top top",
    end: "bottom bottom",
    scrub: true,
};

// Horizontal scroll text
gsap.to(".scroll-text", {
    x: () => {
        const textWidth = document.querySelector(".scroll-text").offsetWidth;
        const halfScreen = window.innerWidth / `1.7`;
        return `-${textWidth - halfScreen}px`;
    },
    ease: "none",
    scrollTrigger: scrollTriggerSettings,
});

// Columns scroll in opposite directions
gsap.to(".column-left", {
    y: -moveAmount,
    ease: "none",
    scrollTrigger: scrollTriggerSettings,
});

gsap.to(".column-right", {
    y: moveAmount,
    ease: "none",
    scrollTrigger: scrollTriggerSettings,
});

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("ripple-canvas"),
    alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);

const geometry = new THREE.PlaneBufferGeometry(2, 2);
const uniforms = {
    u_time: {
        value: 0.0,
    },
    u_mouse: {
        value: new THREE.Vector2(0.5, 0.5),
    },
};

const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

const fragmentShader = `
      uniform float u_time;
      uniform vec2 u_mouse;
      varying vec2 vUv;
      void main() {
        vec2 uv = vUv;
        float dist = distance(uv, u_mouse);
        float ripple = sin(dist * 10.0 - u_time * 5.0);
        gl_FragColor = vec4(vec3(0.0, 0.4 + 0.4 * ripple, 0.7), 0.15);
      }
    `;

const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

function animate() {
    uniforms.u_time.value += 0.01;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

window.addEventListener("mousemove", (e) => {
    uniforms.u_mouse.value.x = e.clientX / window.innerWidth;
    uniforms.u_mouse.value.y = 1 - e.clientY / window.innerHeight;
});

// --------------------
// MUSIC TOGGLE SCRIPT
// --------------------

const musicToggle = document.getElementById("musicToggle");
const bgAudio = document.getElementById("bgAudio");
const wavePath = document.getElementById("wavePath");

let playing = false;
let waveAnimationFrame = null;
let startTime = null;

// Wave parameters
const waveLength = 120;
const waveHeight = 10; // amplitude of the wave (vertical)
const waveFrequency = 0.0005;
const wavePoints = 50;


function generateWavePath(time) {
    let path = "M0 15";
    for (let i = 0; i <= wavePoints; i++) {
        const x = (waveLength / wavePoints) * i;
        const phase = time * 2 * Math.PI * waveFrequency;
        const y = 15 + waveHeight * Math.sin((i / wavePoints) * 4 * Math.PI + phase);
        path += ` L${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    return path;
}

function animateWave(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    wavePath.setAttribute("d", generateWavePath(elapsed));
    if (playing) {
        waveAnimationFrame = requestAnimationFrame(animateWave);
    }
}

musicToggle.addEventListener("click", (e) => {
    playing = !playing;

    if (playing) {
        bgAudio.play();
        musicToggle.classList.add("playing");
        startTime = null;
        waveAnimationFrame = requestAnimationFrame(animateWave);
    } else {
        bgAudio.pause();
        musicToggle.classList.remove("playing");
        cancelAnimationFrame(waveAnimationFrame);
        wavePath.setAttribute("d", "M0 15 L120 15"); // flat line
    }

    // Ripple effect on click
    const ripple = document.createElement("span");
    ripple.classList.add("ripple");
    const rect = musicToggle.getBoundingClientRect();
    ripple.style.width = ripple.style.height = "60px";
    ripple.style.left = `${e.clientX - rect.left - 30}px`;
    ripple.style.top = `${e.clientY - rect.top - 30}px`;
    musicToggle.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
});

// Initialize wave as flat line on load
wavePath.setAttribute("d", "M0 15 L120 15");

// Optional: Pause audio when page hidden and resume when visible (improve UX)
document.addEventListener("visibilitychange", () => {
    if (document.hidden && playing) {
        bgAudio.pause();
    } else if (!document.hidden && playing) {
        bgAudio.play();
    }
});