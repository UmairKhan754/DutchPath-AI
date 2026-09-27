/* =========================================================
   DUTCHPATH AI
   Main Landing Page JavaScript
   =========================================================

   File:
   js/index.js

   Main responsibilities:
   1. Navbar scroll behaviour
   2. Mobile navigation
   3. Smooth scrolling
   4. Scroll reveal animations
   5. Three.js 3D hero visualization
   6. Interactive particles
   7. Orbit rings
   8. Floating nodes
   9. Mouse interaction
   10. Responsive canvas
   11. Reduced-motion support
   12. Button navigation
   13. Footer year
   ========================================================= */


/* =========================================================
   1. GLOBAL DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /*
     * Everything starts after the HTML document
     * has completely loaded.
     */

    initializeNavbar();
    initializeMobileMenu();
    initializeSmoothScrolling();
    initializeRevealAnimations();
    initializeButtons();
    initializeFooterYear();
    initializeHero3D();

});


/* =========================================================
   2. NAVBAR
   ========================================================= */

function initializeNavbar() {

    const navbar = document.querySelector(".navbar");

    /*
     * If navbar does not exist, stop here.
     * This prevents JavaScript errors.
     */

    if (!navbar) {
        return;
    }


    /*
     * Check the current scroll position.
     */

    function updateNavbar() {

        if (window.scrollY > 40) {

            navbar.classList.add("scrolled");

        } else {

            navbar.classList.remove("scrolled");

        }

    }


    /*
     * Run once immediately.
     */

    updateNavbar();


    /*
     * Run every time user scrolls.
     */

    window.addEventListener(
        "scroll",
        updateNavbar,
        { passive: true }
    );

}


/* =========================================================
   3. MOBILE MENU
   ========================================================= */

function initializeMobileMenu() {

    const mobileMenuButton = document.querySelector(".mobile-menu");
    const navLinks = document.querySelector(".nav-links");

    /*
     * If mobile navigation elements do not exist,
     * there is nothing to initialize.
     */

    if (!mobileMenuButton || !navLinks) {
        return;
    }


    /*
     * Open / close mobile menu.
     */

    mobileMenuButton.addEventListener("click", () => {

        navLinks.classList.toggle("mobile-open");
        mobileMenuButton.classList.toggle("active");

    });


    /*
     * Close menu after clicking a navigation link.
     */

    const links = navLinks.querySelectorAll("a");

    links.forEach((link) => {

        link.addEventListener("click", () => {

            navLinks.classList.remove("mobile-open");
            mobileMenuButton.classList.remove("active");

        });

    });


    /*
     * Close menu if user clicks outside it.
     */

    document.addEventListener("click", (event) => {

        const clickedInsideMenu =
            navLinks.contains(event.target);

        const clickedButton =
            mobileMenuButton.contains(event.target);


        if (
            !clickedInsideMenu &&
            !clickedButton
        ) {

            navLinks.classList.remove("mobile-open");
            mobileMenuButton.classList.remove("active");

        }

    });

}


/* =========================================================
   4. SMOOTH SCROLLING
   ========================================================= */

function initializeSmoothScrolling() {

    /*
     * Select all internal links.
     *
     * Example:
     *
     * href="#features"
     * href="#process"
     * href="#about"
     */

    const internalLinks =
        document.querySelectorAll('a[href^="#"]');


    internalLinks.forEach((link) => {

        link.addEventListener("click", (event) => {

            const targetId =
                link.getAttribute("href");


            /*
             * Ignore empty "#".
             */

            if (
                !targetId ||
                targetId === "#"
            ) {
                return;
            }


            const targetElement =
                document.querySelector(targetId);


            /*
             * If target exists,
             * smoothly scroll to it.
             */

            if (targetElement) {

                event.preventDefault();

                targetElement.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });

}


/* =========================================================
   5. SCROLL REVEAL ANIMATIONS
   ========================================================= */

function initializeRevealAnimations() {

    /*
     * Find elements which should appear
     * when they enter the viewport.
     */

    const revealElements =
        document.querySelectorAll(".reveal");


    /*
     * If browser doesn't support IntersectionObserver,
     * simply display everything.
     */

    if (!("IntersectionObserver" in window)) {

        revealElements.forEach((element) => {

            element.classList.add("revealed");

        });

        return;
    }


    /*
     * IntersectionObserver watches elements
     * entering the viewport.
     */

    const observer =
        new IntersectionObserver(
            (entries, observerInstance) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("revealed");

                        /*
                         * Once revealed, we don't need
                         * to observe it anymore.
                         */

                        observerInstance.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -50px 0px"
            }
        );


    /*
     * Observe every reveal element.
     */

    revealElements.forEach((element) => {

        observer.observe(element);

    });

}


/* =========================================================
   6. BUTTONS
   ========================================================= */

function initializeButtons() {

    /*
     * MAIN CTA BUTTONS
     *
     * We search for buttons / links using
     * their existing classes.
     */

    const primaryButtons =
        document.querySelectorAll(".btn-primary");


    primaryButtons.forEach((button) => {

        button.addEventListener("click", (event) => {

            /*
             * If this button already has a real href,
             * allow normal navigation.
             */

            const href =
                button.getAttribute("href");


            if (
                href &&
                href !== "#" &&
                href.startsWith("#")
            ) {

                return;

            }


            /*
             * If chat.html exists,
             * navigate there.
             */

            if (
                button.dataset.action === "chat" ||
                button.classList.contains("start-chat")
            ) {

                window.location.href = "chat.html";

                return;

            }

        });

    });


    /*
     * Explicit chat links.
     */

    const chatLinks =
        document.querySelectorAll(
            '[data-action="chat"]'
        );


    chatLinks.forEach((element) => {

        element.addEventListener("click", () => {

            window.location.href = "chat.html";

        });

    });


    /*
     * Secondary buttons can have simple hover
     * interaction handled by CSS.
     *
     * Here we add keyboard accessibility feedback.
     */

    const allButtons =
        document.querySelectorAll("button");


    allButtons.forEach((button) => {

        button.addEventListener("keydown", (event) => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                /*
                 * Let browser handle native button
                 * behaviour.
                 */

                return;

            }

        });

    });

}


/* =========================================================
   7. FOOTER YEAR
   ========================================================= */

function initializeFooterYear() {

    /*
     * Look for an element such as:
     *
     * <span id="year"></span>
     *
     * or:
     *
     * <span class="current-year"></span>
     */

    const yearElements =
        document.querySelectorAll(
            "#year, .current-year"
        );


    const currentYear =
        new Date().getFullYear();


    yearElements.forEach((element) => {

        element.textContent =
            currentYear;

    });

}


/* =========================================================
   8. THREE.JS HERO
   ========================================================= */

function initializeHero3D() {

    /*
     * Find the canvas from the HTML.
     */

    const canvas =
        document.getElementById("hero-canvas");


    /*
     * If canvas doesn't exist,
     * skip the 3D scene.
     */

    if (!canvas) {
        return;
    }


    /*
     * Check if Three.js loaded correctly.
     */

    if (typeof THREE === "undefined") {

        console.warn(
            "Three.js was not loaded. 3D hero disabled."
        );

        return;

    }


    /*
     * Respect reduced motion settings.
     */

    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    /*
     * =====================================================
     * SCENE
     * =====================================================
     */

    const scene =
        new THREE.Scene();


    /*
     * Camera.
     */

    const camera =
        new THREE.PerspectiveCamera(
            42,
            1,
            0.1,
            1000
        );


    camera.position.set(
        0,
        0,
        8
    );


    /*
     * Renderer.
     */

    const renderer =
        new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true
        });


    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio || 1,
            2
        )
    );


    renderer.setClearColor(
        0x000000,
        0
    );


    /*
     * =====================================================
     * HERO GROUP
     * =====================================================
     *
     * Everything inside this group will move together.
     */

    const heroGroup =
        new THREE.Group();


    scene.add(heroGroup);


    /* =====================================================
       9. MAIN SPHERE
       ===================================================== */

    const sphereGeometry =
        new THREE.IcosahedronGeometry(
            2.05,
            5
        );


    const sphereMaterial =
        new THREE.MeshPhysicalMaterial({
            color: 0x071827,
            emissive: 0x082b42,
            emissiveIntensity: 0.8,
            roughness: 0.28,
            metalness: 0.42,
            transparent: true,
            opacity: 0.88,
            wireframe: false
        });


    const sphere =
        new THREE.Mesh(
            sphereGeometry,
            sphereMaterial
        );


    heroGroup.add(sphere);


    /* =====================================================
       10. SPHERE WIREFRAME
       ===================================================== */

    const wireGeometry =
        new THREE.IcosahedronGeometry(
            2.08,
            3
        );


    const wireMaterial =
        new THREE.MeshBasicMaterial({
            color: 0x5ee7ff,
            wireframe: true,
            transparent: true,
            opacity: 0.16
        });


    const wireSphere =
        new THREE.Mesh(
            wireGeometry,
            wireMaterial
        );


    heroGroup.add(wireSphere);


    /* =====================================================
       11. INNER GLOW SPHERE
       ===================================================== */

    const innerGeometry =
        new THREE.SphereGeometry(
            1.5,
            64,
            64
        );


    const innerMaterial =
        new THREE.MeshBasicMaterial({
            color: 0x0c3954,
            transparent: true,
            opacity: 0.18
        });


    const innerSphere =
        new THREE.Mesh(
            innerGeometry,
            innerMaterial
        );


    heroGroup.add(innerSphere);


    /* =====================================================
       12. LIGHTING
       ===================================================== */

    /*
     * Ambient light.
     */

    const ambientLight =
        new THREE.AmbientLight(
            0x8fdfff,
            1.2
        );


    scene.add(ambientLight);


    /*
     * Main cyan light.
     */

    const cyanLight =
        new THREE.PointLight(
            0x5ee7ff,
            22,
            20
        );


    cyanLight.position.set(
        4,
        3,
        5
    );


    scene.add(cyanLight);


    /*
     * Purple light.
     */

    const purpleLight =
        new THREE.PointLight(
            0x7c6cff,
            20,
            20
        );


    purpleLight.position.set(
        -4,
        -2,
        3
    );


    scene.add(purpleLight);


    /*
     * Green light.
     */

    const greenLight =
        new THREE.PointLight(
            0x2de2a6,
            12,
            15
        );


    greenLight.position.set(
        2,
        -4,
        -2
    );


    scene.add(greenLight);


    /* =====================================================
       13. ORBIT RINGS
       ===================================================== */

    function createOrbit(
        radius,
        rotationX,
        rotationY,
        rotationZ,
        color,
        opacity
    ) {

        const points = [];


        const segments = 128;


        for (
            let i = 0;
            i <= segments;
            i++
        ) {

            const angle =
                (i / segments) *
                Math.PI *
                2;


            points.push(
                new THREE.Vector3(
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius,
                    0
                )
            );

        }


        const geometry =
            new THREE.BufferGeometry()
                .setFromPoints(points);


        const material =
            new THREE.LineBasicMaterial({
                color: color,
                transparent: true,
                opacity: opacity
            });


        const line =
            new THREE.Line(
                geometry,
                material
            );


        line.rotation.x =
            rotationX;

        line.rotation.y =
            rotationY;

        line.rotation.z =
            rotationZ;


        heroGroup.add(line);


        return line;

    }


    const orbitOne =
        createOrbit(
            2.65,
            1.1,
            0.3,
            0.15,
            0x5ee7ff,
            0.32
        );


    const orbitTwo =
        createOrbit(
            3.05,
            0.45,
            1.0,
            0.5,
            0x7c6cff,
            0.25
        );


    const orbitThree =
        createOrbit(
            3.4,
            1.5,
            -0.4,
            1.1,
            0x2de2a6,
            0.18
        );


    /* =====================================================
       14. ORBITING DOTS
       ===================================================== */

    function createOrbitDot(
        radius,
        color,
        angle,
        orbitRotation
    ) {

        const geometry =
            new THREE.SphereGeometry(
                0.065,
                16,
                16
            );


        const material =
            new THREE.MeshBasicMaterial({
                color: color
            });


        const dot =
            new THREE.Mesh(
                geometry,
                material
            );


        dot.userData.radius =
            radius;

        dot.userData.angle =
            angle;

        dot.userData.orbitRotation =
            orbitRotation;

        dot.userData.speed =
            0.004 + Math.random() * 0.004;


        heroGroup.add(dot);


        return dot;

    }


    const orbitDots = [];


    /*
     * Cyan dots.
     */

    for (let i = 0; i < 4; i++) {

        orbitDots.push(
            createOrbitDot(
                2.65,
                0x5ee7ff,
                (Math.PI * 2 / 4) * i,
                1
            )
        );

    }


    /*
     * Purple dots.
     */

    for (let i = 0; i < 3; i++) {

        orbitDots.push(
            createOrbitDot(
                3.05,
                0x7c6cff,
                (Math.PI * 2 / 3) * i,
                2
            )
        );

    }


    /*
     * Green dots.
     */

    for (let i = 0; i < 3; i++) {

        orbitDots.push(
            createOrbitDot(
                3.4,
                0x2de2a6,
                (Math.PI * 2 / 3) * i,
                3
            )
        );

    }


    /* =====================================================
       15. NETWORK NODES
       ===================================================== */

    const nodeGroup =
        new THREE.Group();


    heroGroup.add(nodeGroup);


    const nodePositions = [
        [-2.7, 1.4, 0.4],
        [2.8, 1.1, -0.2],
        [2.6, -1.5, 0.5],
        [-2.5, -1.4, -0.3],
        [0, 3.0, -0.5],
        [0, -3.0, 0.3],
        [3.4, 0.1, -0.8],
        [-3.4, 0.2, 0.6]
    ];


    const nodeMeshes = [];


    nodePositions.forEach(
        (position, index) => {

            const geometry =
                new THREE.SphereGeometry(
                    index % 2 === 0
                        ? 0.045
                        : 0.035,
                    12,
                    12
                );


            const material =
                new THREE.MeshBasicMaterial({
                    color:
                        index % 3 === 0
                            ? 0x5ee7ff
                            : index % 3 === 1
                                ? 0x7c6cff
                                : 0x2de2a6
                });


            const node =
                new THREE.Mesh(
                    geometry,
                    material
                );


            node.position.set(
                position[0],
                position[1],
                position[2]
            );


            nodeGroup.add(node);

            nodeMeshes.push(node);

        }
    );


    /* =====================================================
       16. CONNECTION LINES
       ===================================================== */

    function createConnection(
        start,
        end,
        color,
        opacity
    ) {

        const points = [
            new THREE.Vector3(
                start[0],
                start[1],
                start[2]
            ),

            new THREE.Vector3(
                end[0],
                end[1],
                end[2]
            )
        ];


        const geometry =
            new THREE.BufferGeometry()
                .setFromPoints(points);


        const material =
            new THREE.LineBasicMaterial({
                color: color,
                transparent: true,
                opacity: opacity
            });


        const line =
            new THREE.Line(
                geometry,
                material
            );


        nodeGroup.add(line);

        return line;

    }


    const connectionColor =
        0x5ee7ff;


    createConnection(
        nodePositions[0],
        nodePositions[1],
        connectionColor,
        0.18
    );


    createConnection(
        nodePositions[1],
        nodePositions[2],
        connectionColor,
        0.14
    );


    createConnection(
        nodePositions[2],
        nodePositions[3],
        connectionColor,
        0.12
    );


    createConnection(
        nodePositions[3],
        nodePositions[0],
        connectionColor,
        0.16
    );


    createConnection(
        nodePositions[0],
        nodePositions[4],
        connectionColor,
        0.13
    );


    createConnection(
        nodePositions[1],
        nodePositions[4],
        connectionColor,
        0.12
    );


    createConnection(
        nodePositions[2],
        nodePositions[5],
        connectionColor,
        0.13
    );


    createConnection(
        nodePositions[3],
        nodePositions[5],
        connectionColor,
        0.11
    );


    createConnection(
        nodePositions[1],
        nodePositions[6],
        connectionColor,
        0.14
    );


    createConnection(
        nodePositions[0],
        nodePositions[7],
        connectionColor,
        0.12
    );


    /* =====================================================
       17. PARTICLE SYSTEM
       ===================================================== */

    const particleCount = 850;


    const particlePositions =
        new Float32Array(
            particleCount * 3
        );


    const particleSizes =
        new Float32Array(
            particleCount
        );


    for (
        let i = 0;
        i < particleCount;
        i++
    ) {

        /*
         * Create a large 3D field around
         * the hero object.
         */

        const radius =
            3.5 +
            Math.random() * 5.5;


        const theta =
            Math.random() *
            Math.PI *
            2;


        const phi =
            Math.acos(
                2 * Math.random() - 1
            );


        const x =
            radius *
            Math.sin(phi) *
            Math.cos(theta);


        const y =
            radius *
            Math.sin(phi) *
            Math.sin(theta);


        const z =
            radius *
            Math.cos(phi);


        particlePositions[
            i * 3
        ] = x;


        particlePositions[
            i * 3 + 1
        ] = y;


        particlePositions[
            i * 3 + 2
        ] = z;


        particleSizes[i] =
            0.5 +
            Math.random() * 1.4;

    }


    const particleGeometry =
        new THREE.BufferGeometry();


    particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(
            particlePositions,
            3
        )
    );


    particleGeometry.setAttribute(
        "size",
        new THREE.BufferAttribute(
            particleSizes,
            1
        )
    );


    const particleMaterial =
        new THREE.PointsMaterial({
            color: 0x5ee7ff,
            size: 0.025,
            transparent: true,
            opacity: 0.5,
            depthWrite: false,
            blending:
                THREE.AdditiveBlending
        });


    const particles =
        new THREE.Points(
            particleGeometry,
            particleMaterial
        );


    scene.add(particles);


    /* =====================================================
       18. OUTER GLOW RINGS
       ===================================================== */

    function createGlowRing(
        radius,
        opacity,
        color
    ) {

        const geometry =
            new THREE.RingGeometry(
                radius,
                radius + 0.012,
                128
            );


        const material =
            new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: opacity,
                side: THREE.DoubleSide,
                blending:
                    THREE.AdditiveBlending
            });


        const ring =
            new THREE.Mesh(
                geometry,
                material
            );


        ring.rotation.x =
            Math.PI / 2;


        heroGroup.add(ring);


        return ring;

    }


    const glowRingOne =
        createGlowRing(
            2.3,
            0.08,
            0x5ee7ff
        );


    const glowRingTwo =
        createGlowRing(
            2.8,
            0.06,
            0x7c6cff
        );


    const glowRingThree =
        createGlowRing(
            3.3,
            0.04,
            0x2de2a6
        );


    /* =====================================================
       19. MOUSE INTERACTION
       ===================================================== */

    let mouseX = 0;
    let mouseY = 0;

    let targetMouseX = 0;
    let targetMouseY = 0;


    function handleMouseMove(event) {

        /*
         * Convert mouse position to
         * normalized coordinates.
         *
         * Range:
         * -1 to +1
         */

        targetMouseX =
            (event.clientX /
                window.innerWidth) *
                2 -
            1;


        targetMouseY =
            (event.clientY /
                window.innerHeight) *
                2 -
            1;

    }


    /*
     * Don't use mouse movement when
     * reduced motion is enabled.
     */

    if (!reducedMotion) {

        window.addEventListener(
            "mousemove",
            handleMouseMove,
            { passive: true }
        );

    }


    /* =====================================================
       20. RESIZE HANDLING
       ===================================================== */

    const heroVisual =
        document.querySelector(".hero-visual");


    function resizeRenderer() {

        if (!heroVisual) {
            return;
        }


        const width =
            heroVisual.clientWidth;


        const height =
            heroVisual.clientHeight;


        if (
            width <= 0 ||
            height <= 0
        ) {
            return;
        }


        camera.aspect =
            width / height;


        /*
         * Adjust camera for different
         * screen sizes.
         */

        if (width < 600) {

            camera.position.z = 9;

        } else if (width < 900) {

            camera.position.z = 8.5;

        } else {

            camera.position.z = 8;

        }


        camera.updateProjectionMatrix();


        renderer.setSize(
            width,
            height,
            false
        );

    }


    resizeRenderer();


    window.addEventListener(
        "resize",
        resizeRenderer
    );


    /* =====================================================
       21. ANIMATION CLOCK
       ===================================================== */

    const clock =
        new THREE.Clock();


    /* =====================================================
       22. ANIMATION LOOP
       ===================================================== */

    function animate() {

        requestAnimationFrame(
            animate
        );


        const elapsed =
            clock.getElapsedTime();


        /*
         * Smooth mouse movement.
         */

        if (!reducedMotion) {

            mouseX +=
                (
                    targetMouseX -
                    mouseX
                ) * 0.035;


            mouseY +=
                (
                    targetMouseY -
                    mouseY
                ) * 0.035;

        }


        /* =================================================
           SPHERE ROTATION
           ================================================= */

        if (!reducedMotion) {

            sphere.rotation.y =
                elapsed * 0.12;

            sphere.rotation.x =
                Math.sin(elapsed * 0.18)
                * 0.08;


            wireSphere.rotation.y =
                -elapsed * 0.08;

            wireSphere.rotation.x =
                elapsed * 0.05;


            innerSphere.rotation.y =
                elapsed * 0.05;

        }


        /* =================================================
           ORBIT ROTATION
           ================================================= */

        if (!reducedMotion) {

            orbitOne.rotation.z =
                elapsed * 0.08;


            orbitTwo.rotation.z =
                -elapsed * 0.055;


            orbitThree.rotation.z =
                elapsed * 0.035;

        }


        /* =================================================
           ORBIT DOT MOVEMENT
           ================================================= */

        orbitDots.forEach(
            (dot) => {

                if (!reducedMotion) {

                    dot.userData.angle +=
                        dot.userData.speed;

                }


                const radius =
                    dot.userData.radius;


                const angle =
                    dot.userData.angle;


                /*
                 * Basic circular position.
                 */

                let x =
                    Math.cos(angle) *
                    radius;


                let y =
                    Math.sin(angle) *
                    radius;


                let z = 0;


                /*
                 * Different orbit planes.
                 */

                if (
                    dot.userData.orbitRotation ===
                    1
                ) {

                    z =
                        Math.sin(angle) *
                        radius *
                        0.35;

                }


                if (
                    dot.userData.orbitRotation ===
                    2
                ) {

                    x =
                        Math.cos(angle) *
                        radius;

                    z =
                        Math.sin(angle) *
                        radius *
                        0.55;

                }


                if (
                    dot.userData.orbitRotation ===
                    3
                ) {

                    y =
                        Math.sin(angle) *
                        radius *
                        0.55;

                    z =
                        Math.cos(angle) *
                        radius *
                        0.65;

                }


                dot.position.set(
                    x,
                    y,
                    z
                );

            }
        );


        /* =================================================
           PARTICLE ROTATION
           ================================================= */

        if (!reducedMotion) {

            particles.rotation.y =
                elapsed * 0.012;


            particles.rotation.x =
                Math.sin(elapsed * 0.04)
                * 0.025;

        }


        /* =================================================
           NODE PULSING
           ================================================= */

        nodeMeshes.forEach(
            (node, index) => {

                if (!reducedMotion) {

                    const pulse =
                        1 +
                        Math.sin(
                            elapsed * 2 +
                            index
                        ) *
                        0.22;


                    node.scale.set(
                        pulse,
                        pulse,
                        pulse
                    );

                }

            }
        );


        /* =================================================
           HERO GROUP MOUSE MOVEMENT
           ================================================= */

        if (!reducedMotion) {

            heroGroup.rotation.y +=
                (
                    mouseX * 0.35 -
                    heroGroup.rotation.y
                ) * 0.015;


            heroGroup.rotation.x +=
                (
                    mouseY * 0.20 -
                    heroGroup.rotation.x
                ) * 0.015;

        }


        /* =================================================
           FLOATING MOTION
           ================================================= */

        if (!reducedMotion) {

            heroGroup.position.y =
                Math.sin(
                    elapsed * 0.6
                ) * 0.07;

        }


        /* =================================================
           GLOW RINGS
           ================================================= */

        if (!reducedMotion) {

            glowRingOne.rotation.z =
                elapsed * 0.04;


            glowRingTwo.rotation.z =
                -elapsed * 0.025;


            glowRingThree.rotation.z =
                elapsed * 0.018;

        }


        /* =================================================
           LIGHT MOVEMENT
           ================================================= */

        if (!reducedMotion) {

            cyanLight.position.x =
                Math.sin(elapsed * 0.4) * 4;


            cyanLight.position.y =
                Math.cos(elapsed * 0.35) * 3;


            purpleLight.position.x =
                Math.cos(elapsed * 0.3) * -4;


            purpleLight.position.y =
                Math.sin(elapsed * 0.25) * -3;

        }


        /*
         * Render final scene.
         */

        renderer.render(
            scene,
            camera
        );

    }


    /*
     * Start animation.
     */

    animate();


    /* =====================================================
       23. VISIBILITY OPTIMIZATION
       ===================================================== */

    /*
     * If the user switches to another browser tab,
     * reduce unnecessary animation calculations.
     */

    let pageVisible = true;


    document.addEventListener(
        "visibilitychange",
        () => {

            pageVisible =
                !document.hidden;

        }
    );


    /*
     * Optional additional optimization:
     *
     * Stop heavy visual movement while page
     * is not visible.
     *
     * The render loop continues, but the scene
     * itself becomes static.
     */

    const originalAnimate =
        animate;


    /*
     * We don't replace the animation function here.
     * The visibility state is intentionally kept
     * available for future optimization.
     */

}


/* =========================================================
   24. GLOBAL ERROR PROTECTION
   ========================================================= */

/*
 * Catch unexpected JavaScript errors so that
 * one small component doesn't completely break
 * the rest of the website.
 */

window.addEventListener(
    "error",
    (event) => {

        console.error(
            "DutchPath AI JavaScript Error:",
            event.error || event.message
        );

    }
);


/* =========================================================
   25. CONSOLE BRANDING
   ========================================================= */

console.log(
    "%cDutchPath AI",
    "font-size: 22px; font-weight: 800;"
);


console.log(
    "%cAI-powered Netherlands study & visa guidance.",
    "font-size: 13px;"
);


/* =========================================================
   END OF DUTCHPATH AI JAVASCRIPT
   ========================================================= */