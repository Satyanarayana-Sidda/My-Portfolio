document.addEventListener('DOMContentLoaded', () => {
    // ── VIEWPORT OCCLUSION CHECKER FOR 60FPS OPTIMIZATION ─────
    function inView(id) {
        const el = document.getElementById(id);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.bottom >= -150 && rect.top <= window.innerHeight + 150;
    }


    // ── 1. CUSTOM CURSOR TRACKING ────────────────────────────
    const cur = document.getElementById('cur');
    const cur2 = document.getElementById('cur2');
    let cx = 0, cy = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
        cx = e.clientX;
        cy = e.clientY;
        if (cur) {
            cur.style.left = cx + 'px';
            cur.style.top = cy + 'px';
        }
    });

    // Smooth damp loop for outer trailing circle
    (function cursorLoop() {
        rx += (cx - rx) * 0.14;
        ry += (cy - ry) * 0.14;
        if (cur2) {
            cur2.style.left = rx + 'px';
            cur2.style.top = ry + 'px';
        }
        requestAnimationFrame(cursorLoop);
    })();

    // Custom hover scaling for interactive elements
    document.querySelectorAll('a, button, .gc, .btn3, .pCard, .ctL, .tb').forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (cur) cur.style.transform = 'translate(-50%, -50%) scale(3.5)';
            if (cur2) cur2.style.transform = 'translate(-50%, -50%) scale(1.6)';
        });
        el.addEventListener('mouseleave', () => {
            if (cur) cur.style.transform = 'translate(-50%, -50%) scale(1)';
            if (cur2) cur2.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    });

    // ── 2. PRELOADER STATUS TIMER & 3D LOADING ORB ───────────
    const lB = document.getElementById('lBar');
    const lT = document.getElementById('lTxt');
    const loader = document.getElementById('loader');
    const loadCanvas = document.getElementById('loaderCanvas');
    
    // Global flight coordinates trigger for background intro zoom
    window.introFlightActive = false;
    window.flightProgress = 0;

    // Create Three.js environment for loader canvas if it exists
    let loaderRenderer, loaderScene, loaderCamera, loaderMesh, loaderRing;
    if (loadCanvas) {
        loaderRenderer = new THREE.WebGLRenderer({ canvas: loadCanvas, alpha: true, antialias: true });
        loaderRenderer.setSize(250, 250);
        loaderRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        loaderScene = new THREE.Scene();
        loaderCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 10);
        loaderCamera.position.z = 3.5;

        // Glowing Loading Core (Icosahedron wireframe)
        const loaderGeo = new THREE.IcosahedronGeometry(0.8, 1);
        const loaderMat = new THREE.MeshBasicMaterial({ color: 0x00ffee, wireframe: true, transparent: true, opacity: 0.75 });
        loaderMesh = new THREE.Mesh(loaderGeo, loaderMat);
        loaderScene.add(loaderMesh);

        // Holographic Outer Orbit Ring
        const ringGeo = new THREE.TorusGeometry(1.25, 0.02, 8, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x7b2fff, transparent: true, opacity: 0.5 });
        loaderRing = new THREE.Mesh(ringGeo, ringMat);
        loaderRing.rotation.x = Math.PI / 3;
        loaderScene.add(loaderRing);
    }
    
    const preloaderMessages = [
        'INITIALIZING NEURAL NETS...',
        'COMPILING CUSTOM SHADERS...',
        'GENERATING 3D NETWORKS...',
        'CALIBRATING HYPER-GRIDS...',
        'SYSTEM READY'
    ];
    
    let loadPercent = 0;
    const loadInterval = setInterval(() => {
        loadPercent = Math.min(loadPercent + Math.random() * 4.5 + 1.5, 100);
        if (lB) lB.style.width = loadPercent + '%';
        if (lT) {
            lT.textContent = preloaderMessages[Math.min(Math.floor(loadPercent / 22), 4)];
        }

        // Animate 3D Loader Orb
        if (loaderScene && loaderCamera) {
            loaderMesh.rotation.y += 0.01 + (loadPercent / 100) * 0.12;
            loaderMesh.rotation.x += 0.005 + (loadPercent / 100) * 0.05;
            loaderRing.rotation.z -= 0.008 + (loadPercent / 100) * 0.08;
            
            const currentScale = 0.35 + 0.65 * (loadPercent / 100);
            loaderMesh.scale.set(currentScale, currentScale, currentScale);
            loaderRing.scale.set(currentScale, currentScale, currentScale);
            
            // Shift color from purple towards neon cyan
            loaderMesh.material.color.setHSL(0.5 + 0.12 * (loadPercent / 100), 1.0, 0.5);
            loaderRing.material.color.setHSL(0.7 - 0.22 * (loadPercent / 100), 1.0, 0.5);
            
            loaderRenderer.render(loaderScene, loaderCamera);
        }
        
        if (loadPercent >= 100) {
            clearInterval(loadInterval);
            window.introFlightActive = true; // Trigger camera cinematic zoom flight!
            
            setTimeout(() => {
                if (loader) loader.classList.add('gone');
                // Trigger typing simulation after loader is dismissed
                setTimeout(startTyping, 400);
            }, 500);
        }
    }, 30);

    // ── 3. HUD DATE & REAL-TIME LOCAL CLOCK ──────────────────
    const hBL = document.getElementById('hBL');
    const updateHudClock = () => {
        const date = new Date();
        const clockStr = date.toLocaleTimeString('en-IN') + '\n' + date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
        if (hBL && !hBL.classList.contains('hud-hovered')) {
            hBL.textContent = clockStr.toUpperCase();
        }
    };
    setInterval(updateHudClock, 1000);
    updateHudClock(); // Immediate initial run

    // ── 4. CONSOLE TYPEWRITER TERMINAL SIMULATION ────────────
    const phrases = [
        'Cloud | DevOps Engineer',
        'AWS Solutions Architect',
        'Python & Java Developer',
        'Automation Specialist',
        'Azure Solutions Specialist'
    ];
    let phraseIndex = 0, charIndex = 0, isDeleting = false;
    const typedEl = document.getElementById('typed');

    function typeEffect() {
        const currentText = phrases[phraseIndex];
        
        // Render slice + blinking console block
        if (typedEl) {
            typedEl.innerHTML = (isDeleting ? currentText.slice(0, charIndex) : currentText.slice(0, charIndex + 1)) + '<span class="console-cursor">█</span>';
        }

        if (!isDeleting) {
            charIndex++;
            if (charIndex === currentText.length) {
                isDeleting = true;
                setTimeout(typeEffect, 2000); // Hold phrase on screen
                return;
            }
        } else {
            charIndex--;
            if (charIndex < 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                charIndex = 0;
            }
        }
        setTimeout(typeEffect, isDeleting ? 40 : 80);
    }

    function startTyping() {
        typeEffect();
    }

    // ── 5. BACKGROUND WEBGL SCENE — GPU SHADER PARTICLES ─────
    const bgC = document.getElementById('glCanvas');
    const bgR = new THREE.WebGLRenderer({ canvas: bgC, alpha: true, antialias: true });
    bgR.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    bgR.setSize(window.innerWidth, window.innerHeight);

    const bgS = new THREE.Scene();
    const bgCam = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    bgCam.position.set(300, -600, 1900);

    // GLSL Vertex Shader: Waves, Mouse Gravity, and Click Shockwave Vortex
    const vtx = `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uShockTime;
        uniform vec3 uShockSource;

        attribute float aSize;
        attribute vec3 aColor;
        attribute float aPhase;

        varying vec3 vColor;
        varying float vAlpha;

        void main(){
            vColor = aColor;
            vec3 pos = position;

            // 1. Dynamic Sine-wave base oscillations
            pos.y += sin(uTime * 0.35 + position.x * 0.008 + aPhase) * 10.0;
            pos.x += cos(uTime * 0.28 + position.z * 0.007 + aPhase) * 7.0;
            pos.z += sin(uTime * 0.22 + position.y * 0.006 + aPhase) * 5.0;

            // 2. Interactive Mouse Gravitational Attraction
            vec3 mousePos = vec3(uMouse.x * 800.0, uMouse.y * 500.0, 0.0);
            float distToMouse = distance(pos, mousePos);
            if (distToMouse < 450.0) {
                float pullStrength = (1.0 - (distToMouse / 450.0)) * 32.0;
                pos += normalize(mousePos - pos) * pullStrength;
            }

            // 3. Click Shockwave Vortex Ripple
            if (uShockTime > 0.0 && uShockTime < 2.0) {
                float distToShock = distance(pos, uShockSource);
                float waveFront = uShockTime * 850.0;
                float waveThickness = 120.0;
                float distFromFront = abs(distToShock - waveFront);
                
                if (distFromFront < waveThickness) {
                    float waveFactor = (1.0 - (distFromFront / waveThickness)) * (1.0 - (uShockTime / 2.0)) * 65.0;
                    vec3 waveDir = normalize(pos - uShockSource);
                    vec3 swirlDir = vec3(-waveDir.y, waveDir.x, 0.0) * waveFactor * 0.6;
                    pos += (waveDir * waveFactor * 1.3) + swirlDir;
                }
            }

            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = aSize * (350.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
            vAlpha = 0.5 + 0.4 * sin(uTime * 0.8 + aPhase);
        }
    `;

    const frg = `
        varying vec3 vColor;
        varying float vAlpha;

        void main(){
            vec2 c = gl_PointCoord - vec2(0.5);
            float d = length(c);
            if (d > 0.5) discard;
            float a = smoothstep(0.5, 0.0, d) * vAlpha;
            gl_FragColor = vec4(vColor, a);
        }
    `;

    // Generate 6,000 Particle Elements
    const N = 6000;
    const pG = new THREE.BufferGeometry();
    const pp = new Float32Array(N * 3);
    const pc = new Float32Array(N * 3);
    const ps = new Float32Array(N);
    const ph = new Float32Array(N);

    for (let i = 0; i < N; i++) {
        pp[i * 3] = (Math.random() - 0.5) * 1800;
        pp[i * 3 + 1] = (Math.random() - 0.5) * 1300;
        pp[i * 3 + 2] = (Math.random() - 0.5) * 900;
        
        const categoryColor = Math.random();
        if (categoryColor < 0.38) {
            pc[i * 3] = 0.0; pc[i * 3 + 1] = 0.96; pc[i * 3 + 2] = 0.93; // Neon Cyan
        } else if (categoryColor < 0.66) {
            pc[i * 3] = 0.48; pc[i * 3 + 1] = 0.18; pc[i * 3 + 2] = 1.0; // Neon Purple
        } else {
            pc[i * 3] = 1.0; pc[i * 3 + 1] = 0.23; pc[i * 3 + 2] = 0.67; // Neon Pink
        }
        ps[i] = Math.random() * 3 + 0.4;
        ph[i] = Math.random() * Math.PI * 2;
    }

    pG.setAttribute('position', new THREE.BufferAttribute(pp, 3));
    pG.setAttribute('aColor', new THREE.BufferAttribute(pc, 3));
    pG.setAttribute('aSize', new THREE.BufferAttribute(ps, 1));
    pG.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));

    // Custom Shader Uniforms
    const shaderUniforms = {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uShockTime: { value: 0 },
        uShockSource: { value: new THREE.Vector3(0, 0, 0) }
    };

    const pM = new THREE.ShaderMaterial({
        vertexShader: vtx,
        fragmentShader: frg,
        uniforms: shaderUniforms,
        transparent: true,
        depthWrite: false
    });

    const particlesPoints = new THREE.Points(pG, pM);
    bgS.add(particlesPoints);

    // Dynamic mouse vector tracking inside Shader
    document.addEventListener('mousemove', e => {
        const mx = (e.clientX / window.innerWidth) * 2 - 1;
        const my = -(e.clientY / window.innerHeight) * 2 + 1;
        shaderUniforms.uMouse.value.set(mx, my);
    });

    // Particle Dispersion click trigger
    let shockwaveTime = 0.0;
    const shockSourceVec = new THREE.Vector3();
    
    window.addEventListener('click', e => {
        const mx = (e.clientX / window.innerWidth) * 2 - 1;
        const my = -(e.clientY / window.innerHeight) * 2 + 1;
        shockSourceVec.set(mx * 900, my * 650, 0);
        shockwaveTime = 0.01; // Trigger animation timer
    });

    // ── 6. BACKGROUND WIREFRAME MESHES & GRID PARALLAX ───────
    function createWireframeMesh(geo, colorHex, x, y, z) {
        const mat = new THREE.MeshBasicMaterial({ color: colorHex, wireframe: true, transparent: true, opacity: 0.06 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        
        // Speed parameters for differential Z-depth scrolling parallax
        mesh.userData = {
            bp: [x, y, z],
            pX: Math.random() * 0.16 + 0.06, // Depth movement factor on scroll
            rx: (Math.random() - 0.5) * 0.004,
            ry: (Math.random() - 0.5) * 0.006,
            rz: (Math.random() - 0.5) * 0.003
        };
        return mesh;
    }

    const floatingGeometries = [
        [new THREE.IcosahedronGeometry(130, 1), 0x00ffee, 360, 210, -80],
        [new THREE.OctahedronGeometry(95, 0), 0x7b2fff, -330, -160, -60],
        [new THREE.TorusKnotGeometry(65, 13, 64, 8), 0xff3cac, -100, 290, -120],
        [new THREE.DodecahedronGeometry(85, 0), 0x00ffee, 160, -260, -90],
        [new THREE.IcosahedronGeometry(75, 0), 0x7b2fff, 0, -370, -50],
        [new THREE.TorusGeometry(90, 8, 8, 40), 0x39ff14, 380, -100, -70],
    ];

    const meshObjects = [];
    floatingGeometries.forEach(gData => {
        const mesh = createWireframeMesh(...gData);
        meshObjects.push(mesh);
        bgS.add(mesh);
    });

    // Infinite wireframe horizon grid
    const horizonGrid = new THREE.GridHelper(1600, 42, 0x00ffee, 0x001133);
    horizonGrid.position.y = -310;
    horizonGrid.material.transparent = true;
    horizonGrid.material.opacity = 0.12;
    bgS.add(horizonGrid);

    // Twinkling Star Nebula particles (1,500 glowing stars)
    const starCount = 1500;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starPhases = new Float32Array(starCount);
    for (let i = 0; i < starCount; i++) {
        starPositions[i * 3] = (Math.random() - 0.5) * 2000;
        starPositions[i * 3 + 1] = (Math.random() - 0.5) * 1600;
        starPositions[i * 3 + 2] = (Math.random() - 0.5) * 1000 - 300;
        starPhases[i] = Math.random() * Math.PI * 2;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('aPhase', new THREE.BufferAttribute(starPhases, 1));
    
    const starVtx = `
        uniform float uTime;
        attribute float aPhase;
        varying float vTwinkle;
        void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = 1.8 * (450.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
            vTwinkle = 0.3 + 0.7 * sin(uTime * 1.5 + aPhase);
        }
    `;
    const starFrg = `
        varying float vTwinkle;
        void main() {
            vec2 c = gl_PointCoord - vec2(0.5);
            if (length(c) > 0.5) discard;
            gl_FragColor = vec4(0.0, 1.0, 0.93, vTwinkle * 0.65);
        }
    `;
    const starMat = new THREE.ShaderMaterial({
        vertexShader: starVtx,
        fragmentShader: starFrg,
        uniforms: { uTime: { value: 0 } },
        transparent: true,
        depthWrite: false
    });
    const starsPoints = new THREE.Points(starGeo, starMat);
    bgS.add(starsPoints);

    // Shooting-Star Cyber Data Streams (Laser data packets)
    const cyberStreams = [];
    const streamColors = [0x00ffee, 0x7b2fff, 0xff3cac, 0x39ff14];
    for (let i = 0; i < 6; i++) {
        const streamGeo = new THREE.BufferGeometry();
        const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(-45, 0, 0)];
        streamGeo.setFromPoints(pts);
        const streamMat = new THREE.LineBasicMaterial({
            color: streamColors[i % streamColors.length],
            transparent: true,
            opacity: 0,
            linewidth: 2
        });
        const streamLine = new THREE.Line(streamGeo, streamMat);
        
        streamLine.userData = {
            active: false,
            speed: 12 + Math.random() * 15,
            x: 0,
            y: 0,
            z: 0,
            delay: Math.random() * 150,
            life: 0
        };
        bgS.add(streamLine);
        cyberStreams.push(streamLine);
    }

    // Giant Slow-Rotating Cybernetic Astrolabe Rings
    const giantRing1 = new THREE.Mesh(
        new THREE.TorusGeometry(320, 1.8, 8, 120),
        new THREE.MeshBasicMaterial({ color: 0x00ffee, transparent: true, opacity: 0.03, wireframe: true })
    );
    giantRing1.position.set(0, 0, -250);
    giantRing1.rotation.x = Math.PI / 4;
    bgS.add(giantRing1);

    const giantRing2 = new THREE.Mesh(
        new THREE.TorusGeometry(320, 0.9, 8, 120),
        new THREE.MeshBasicMaterial({ color: 0xff3cac, transparent: true, opacity: 0.015, wireframe: true })
    );
    giantRing2.position.set(0, 0, -250);
    giantRing2.rotation.x = -Math.PI / 6;
    giantRing2.rotation.y = Math.PI / 4;
    bgS.add(giantRing2);

    // Quantum Ocean undulating wave grid (2,500 particles in a dynamic wave terrain)
    const oceanCols = 50;
    const oceanRows = 50;
    const oceanPointsCount = oceanCols * oceanRows;
    const oceanGeo = new THREE.BufferGeometry();
    const oceanPositions = new Float32Array(oceanPointsCount * 3);
    const oceanColorsArray = new Float32Array(oceanPointsCount * 3);

    let oceanIndex = 0;
    const spacing = 35;
    const startX = -((oceanCols - 1) * spacing) / 2;
    const startZ = -((oceanRows - 1) * spacing) / 2;

    for (let c = 0; c < oceanCols; c++) {
        for (let r = 0; r < oceanRows; r++) {
            const px = startX + c * spacing;
            const pz = startZ + r * spacing;
            
            oceanPositions[oceanIndex * 3] = px;
            oceanPositions[oceanIndex * 3 + 1] = -240;
            oceanPositions[oceanIndex * 3 + 2] = pz;

            const ratio = c / oceanCols;
            oceanColorsArray[oceanIndex * 3] = ratio * 0.48;
            oceanColorsArray[oceanIndex * 3 + 1] = (1 - ratio) * 0.96;
            oceanColorsArray[oceanIndex * 3 + 2] = 0.93 + ratio * 0.07;

            oceanIndex++;
        }
    }

    oceanGeo.setAttribute('position', new THREE.BufferAttribute(oceanPositions, 3));
    oceanGeo.setAttribute('color', new THREE.BufferAttribute(oceanColorsArray, 3));

    const oceanMat = new THREE.PointsMaterial({
        size: 2.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.28,
        depthWrite: false
    });

    const oceanPoints = new THREE.Points(oceanGeo, oceanMat);
    bgS.add(oceanPoints);

    // 3D Digital Rain streams (Vertical laser data pipes)
    const rainStreams = [];
    for (let i = 0; i < 20; i++) {
        const streamGeo = new THREE.BufferGeometry();
        const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -60, 0)];
        streamGeo.setFromPoints(pts);
        
        const streamMat = new THREE.LineBasicMaterial({
            color: [0x00ffee, 0x7b2fff, 0x39ff14][i % 3],
            transparent: true,
            opacity: 0,
            linewidth: 1.5
        });
        const rainLine = new THREE.Line(streamGeo, streamMat);
        
        rainLine.userData = {
            active: false,
            speed: 5 + Math.random() * 8,
            x: (Math.random() - 0.5) * 1800,
            y: 800,
            z: (Math.random() - 0.5) * 600 - 200,
            delay: Math.random() * 200,
            life: 0
        };
        bgS.add(rainLine);
        rainStreams.push(rainLine);
    }

    // 3D Cyber-Constellation Neural Network (120 active nodes drawing real-time connections)
    const netCount = 120;
    const netNodes = [];
    const netPositions = new Float32Array(netCount * 3);
    for (let i = 0; i < netCount; i++) {
        const x = (Math.random() - 0.5) * 1600;
        const y = (Math.random() - 0.5) * 1200;
        const z = (Math.random() - 0.5) * 500 - 100;
        
        netNodes.push({
            x, y, z,
            vx: (Math.random() - 0.5) * 0.7,
            vy: (Math.random() - 0.5) * 0.5,
            vz: (Math.random() - 0.5) * 0.4
        });
        
        netPositions[i * 3] = x;
        netPositions[i * 3 + 1] = y;
        netPositions[i * 3 + 2] = z;
    }

    const netGeo = new THREE.BufferGeometry();
    netGeo.setAttribute('position', new THREE.BufferAttribute(netPositions, 3));
    const netMat = new THREE.PointsMaterial({
        color: 0x7b2fff,
        size: 3.5,
        transparent: true,
        opacity: 0.65,
        depthWrite: false
    });
    const netPoints = new THREE.Points(netGeo, netMat);
    bgS.add(netPoints);

    // Connecting line segments geometry
    const maxLines = 400;
    const linePositions = new Float32Array(maxLines * 2 * 3);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
        color: 0x00ffee,
        transparent: true,
        opacity: 0.08,
        depthWrite: false
    });
    const netLines = new THREE.LineSegments(lineGeo, lineMat);
    bgS.add(netLines);

    let smoothMouseX3 = 0, smoothMouseY3 = 0;
    document.addEventListener('mousemove', e => {
        smoothMouseX3 = (e.clientX / window.innerWidth - 0.5) * 45;
        smoothMouseY3 = (e.clientY / window.innerHeight - 0.5) * 30;
    });

    let mainBgTime = 0;
    function bgAnimLoop() {
        requestAnimationFrame(bgAnimLoop);
        
        mainBgTime += 0.007;
        shaderUniforms.uTime.value = mainBgTime;

        // Update twinkling star nebula
        starMat.uniforms.uTime.value = mainBgTime;

        // Animate 3D Cyber-Constellation Network nodes
        const netPosAttr = netGeo.attributes.position;
        netNodes.forEach((node, i) => {
            node.x += node.vx;
            node.y += node.vy;
            node.z += node.vz;

            // boundaries bounce
            if (node.x < -800 || node.x > 800) node.vx *= -1;
            if (node.y < -600 || node.y > 600) node.vy *= -1;
            if (node.z < -350 || node.z > 50) node.vz *= -1;

            netPosAttr.setXYZ(i, node.x, node.y, node.z);
        });
        netPosAttr.needsUpdate = true;

        // Calculate dynamic proximity lines between nodes
        const linePosAttr = lineGeo.attributes.position;
        let lineIndex = 0;
        
        for (let i = 0; i < netCount; i++) {
            const na = netNodes[i];
            for (let j = i + 1; j < netCount; j++) {
                if (lineIndex >= maxLines) break;
                
                const nb = netNodes[j];
                const dx = na.x - nb.x;
                const dy = na.y - nb.y;
                const dz = na.z - nb.z;
                const distSq = dx*dx + dy*dy + dz*dz;
                const maxDist = 170;
                
                if (distSq < maxDist * maxDist) {
                    linePosAttr.setXYZ(lineIndex * 2, na.x, na.y, na.z);
                    linePosAttr.setXYZ(lineIndex * 2 + 1, nb.x, nb.y, nb.z);
                    lineIndex++;
                }
            }
            if (lineIndex >= maxLines) break;
        }
        
        // Hide inactive line segments
        for (let i = lineIndex; i < maxLines; i++) {
            linePosAttr.setXYZ(i * 2, 0, 0, 0);
            linePosAttr.setXYZ(i * 2 + 1, 0, 0, 0);
        }
        lineGeo.drawRange.count = lineIndex * 2;
        linePosAttr.needsUpdate = true;

        // Undulate Quantum Ocean Wave Grid
        const oPosAttr = oceanGeo.attributes.position;
        const oCount = oPosAttr.count;
        for (let i = 0; i < oCount; i++) {
            const px = oPosAttr.getX(i);
            const pz = oPosAttr.getZ(i);

            const u = px * 0.005;
            const v = pz * 0.005;
            const wave1 = Math.sin(u * 4 + mainBgTime * 1.8) * Math.cos(v * 3 + mainBgTime * 1.5) * 35;
            const wave2 = Math.sin(u * 1.5 - mainBgTime * 0.8) * 12;
            const baseHeight = -260 + wave1 + wave2;

            const targetMX = smoothMouseX3 * 22;
            const targetMZ = smoothMouseY3 * 18;
            const dx = px - targetMX;
            const dz = pz - targetMZ;
            const dist = Math.sqrt(dx * dx + dz * dz);
            let ripple = 0;
            if (dist < 320) {
                ripple = (1.0 - dist / 320) * 55 * Math.sin(mainBgTime * 3 + dist * 0.05);
            }

            oPosAttr.setY(i, baseHeight + ripple);
        }
        oPosAttr.needsUpdate = true;

        // Animate 3D vertical digital rain streams
        rainStreams.forEach(stream => {
            if (!stream.userData.active) {
                stream.userData.delay--;
                if (stream.userData.delay <= 0) {
                    stream.userData.active = true;
                    stream.userData.x = (Math.random() - 0.5) * 1800;
                    stream.userData.y = 800;
                    stream.userData.z = (Math.random() - 0.5) * 600 - 200;
                    stream.position.set(stream.userData.x, stream.userData.y, stream.userData.z);
                    stream.userData.life = 150;
                    stream.material.opacity = 0;
                }
            } else {
                stream.userData.y -= stream.userData.speed;
                stream.position.y = stream.userData.y;
                
                if (stream.userData.life > 120) {
                    stream.material.opacity = (150 - stream.userData.life) / 30 * 0.35;
                } else if (stream.userData.life < 30) {
                    stream.material.opacity = stream.userData.life / 30 * 0.35;
                } else {
                    stream.material.opacity = 0.35;
                }
                
                stream.userData.life--;
                if (stream.userData.y < -800 || stream.userData.life <= 0) {
                    stream.userData.active = false;
                    stream.userData.delay = 50 + Math.random() * 150;
                    stream.material.opacity = 0;
                }
            }
        });

        // Animate shooting star cyber data streams
        cyberStreams.forEach(stream => {
            if (!stream.userData.active) {
                stream.userData.delay--;
                if (stream.userData.delay <= 0) {
                    stream.userData.active = true;
                    stream.userData.x = -1000;
                    stream.userData.y = (Math.random() - 0.5) * 800;
                    stream.userData.z = (Math.random() - 0.5) * 500 - 150;
                    stream.position.set(stream.userData.x, stream.userData.y, stream.userData.z);
                    stream.material.opacity = 0;
                    stream.userData.life = 100;
                }
            } else {
                stream.userData.x += stream.userData.speed;
                stream.position.x = stream.userData.x;
                
                if (stream.userData.life > 80) {
                    stream.material.opacity = (100 - stream.userData.life) / 20 * 0.6;
                } else if (stream.userData.life < 20) {
                    stream.material.opacity = stream.userData.life / 20 * 0.6;
                } else {
                    stream.material.opacity = 0.6;
                }
                
                stream.userData.life--;
                if (stream.userData.x > 1000 || stream.userData.life <= 0) {
                    stream.userData.active = false;
                    stream.userData.delay = 100 + Math.random() * 250;
                    stream.material.opacity = 0;
                }
            }
        });

        // Rotate giant deep astrolabe rings
        giantRing1.rotation.z += 0.0004;
        giantRing2.rotation.z -= 0.0003;

        // Increment click dispersion timer
        if (shockwaveTime > 0.0) {
            shockwaveTime += 0.02;
            if (shockwaveTime > 2.0) {
                shockwaveTime = 0.0;
            }
        }
        shaderUniforms.uShockTime.value = shockwaveTime;
        shaderUniforms.uShockSource.value.copy(shockSourceVec);

        // Rotate wireframe meshes and apply differential scroll parallax
        meshObjects.forEach(mesh => {
            mesh.rotation.x += mesh.userData.rx;
            mesh.rotation.y += mesh.userData.ry;
            mesh.rotation.z += mesh.userData.rz || 0;
            
            // Y-scroll differential Z-depth displacement
            mesh.position.y = mesh.userData.bp[1] + window.scrollY * mesh.userData.pX;
        });

        // Dynamic forward road slide for horizon grid
        horizonGrid.position.y = -310 + window.scrollY * 0.11;
        horizonGrid.rotation.x = window.scrollY * 0.0003;

        // Cinematic camera entrance zoom-in glide flight transition
        if (window.introFlightActive) {
            window.flightProgress += 0.0075;
            if (window.flightProgress >= 1) {
                window.introFlightActive = false;
                window.flightProgress = 1;
            }
            bgCam.position.x = THREE.MathUtils.lerp(300, smoothMouseX3, window.flightProgress);
            bgCam.position.y = THREE.MathUtils.lerp(-600, -smoothMouseY3, window.flightProgress);
            bgCam.position.z = THREE.MathUtils.lerp(1900, 500, window.flightProgress);
        } else {
            bgCam.position.x += (smoothMouseX3 - bgCam.position.x) * 0.022;
            bgCam.position.y += (-smoothMouseY3 - bgCam.position.y) * 0.022;
            bgCam.position.z += (500 + window.scrollY * 0.15 - bgCam.position.z) * 0.025;
        }
        bgCam.lookAt(0, 0, 0);
        
        bgR.render(bgS, bgCam);
    }
    bgAnimLoop();

    // ── 7. HERO NEURAL NETWORK ATTRACTOR CANVAS ──────────────
    const hCv = document.getElementById('hC');
    if (hCv) {
        const hCtx = hCv.getContext('2d');
        const hNodes = [];
        
        function resizeHeroCanvas() {
            hCv.width = hCv.offsetWidth;
            hCv.height = hCv.offsetHeight;
        }
        resizeHeroCanvas();
        window.addEventListener('resize', resizeHeroCanvas);

        for (let i = 0; i < 180; i++) {
            hNodes.push({
                x: (Math.random() - 0.5) * 1800,
                y: (Math.random() - 0.5) * 1000,
                vx: (Math.random() - 0.5) * 0.28,
                vy: (Math.random() - 0.5) * 0.22,
                r: Math.random() * 1.4 + 0.3,
                col: ['rgba(0,255,238,', 'rgba(123,47,255,', 'rgba(255,60,172,'][Math.floor(Math.random() * 3)]
            });
        }

        function heroCanvasLoop() {
            requestAnimationFrame(heroCanvasLoop);
            hCtx.clearRect(0, 0, hCv.width, hCv.height);
            
            const ox = hCv.width / 2;
            const oy = hCv.height / 2;
            const sw = hCv.width / 1800;
            const sh = hCv.height / 1000;
            
            hNodes.forEach(node => {
                node.x += node.vx;
                node.y += node.vy;
                if (node.x < -900 || node.x > 900) node.vx *= -1;
                if (node.y < -500 || node.y > 500) node.vy *= -1;
                
                hCtx.beginPath();
                hCtx.arc(ox + node.x * sw, oy + node.y * sh, node.r, 0, Math.PI * 2);
                hCtx.fillStyle = node.col + '0.55)';
                hCtx.fill();
            });

            for (let i = 0; i < hNodes.length; i++) {
                for (let j = i + 1; j < hNodes.length; j++) {
                    const dx = hNodes[i].x - hNodes[j].x;
                    const dy = hNodes[i].y - hNodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 140) {
                        hCtx.beginPath();
                        hCtx.moveTo(ox + hNodes[i].x * sw, oy + hNodes[i].y * sh);
                        hCtx.lineTo(ox + hNodes[j].x * sw, oy + hNodes[j].y * sh);
                        hCtx.strokeStyle = 'rgba(0,255,238,' + (1 - dist / 140) * 0.07 + ')';
                        hCtx.lineWidth = 0.5;
                        hCtx.stroke();
                    }
                }
            }
        }
        heroCanvasLoop();
    }

    // ── 7.5. HERO 3D CRYSTAL SCENE (Three.js floating geometry) ─
    const heroSceneEl = document.getElementById('heroScene');
    if (heroSceneEl) {
        const hsr = new THREE.WebGLRenderer({ canvas: heroSceneEl, alpha: true, antialias: true });
        hsr.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const hss = new THREE.Scene();
        const hsCam = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
        hsCam.position.set(0, 0, 18);

        function resizeHeroScene() {
            const w = heroSceneEl.offsetWidth;
            const h = heroSceneEl.offsetHeight;
            hsr.setSize(w, h);
            hsCam.aspect = w / h;
            hsCam.updateProjectionMatrix();
        }
        resizeHeroScene();
        window.addEventListener('resize', resizeHeroScene);

        // ── Central spinning torus knot (energy core) ──
        const tkGeo = new THREE.TorusKnotGeometry(1.8, 0.3, 120, 14, 3, 5);
        const tkMat = new THREE.MeshBasicMaterial({ color: 0x00ffee, wireframe: true, transparent: true, opacity: 0.22 });
        const torusKnot = new THREE.Mesh(tkGeo, tkMat);
        torusKnot.position.set(7.5, -1.5, -6);
        hss.add(torusKnot);

        // ── Left floating crystal cluster ──
        const crystals = [];
        const crystalConfigs = [
            { r: 0.65, detail: 1, x: -8.5, y: 2.5, z: -4, rx: 0.006, ry: 0.009, color: 0x00ffee, op: 0.3 },
            { r: 0.45, detail: 0, x: -7.2, y: 0.5, z: -2, rx: -0.008, ry: 0.012, color: 0x7b2fff, op: 0.35 },
            { r: 0.35, detail: 0, x: -9.2, y: -1.0, z: -3.5, rx: 0.010, ry: -0.007, color: 0xff3cac, op: 0.28 },
            { r: 0.5, detail: 1, x: 8, y: 3.5, z: -5, rx: -0.005, ry: 0.011, color: 0x7b2fff, op: 0.25 },
            { r: 0.3, detail: 0, x: 9.5, y: 1.2, z: -3, rx: 0.009, ry: -0.006, color: 0x39ff14, op: 0.3 },
            { r: 0.55, detail: 1, x: -5, y: -3.5, z: -4, rx: 0.007, ry: 0.008, color: 0xff3cac, op: 0.22 },
            { r: 0.4, detail: 0, x: 5.5, y: -4, z: -3, rx: -0.011, ry: 0.005, color: 0x00ffee, op: 0.25 },
            { r: 0.25, detail: 0, x: -10.5, y: 4.5, z: -6, rx: 0.012, ry: 0.009, color: 0x39ff14, op: 0.32 },
        ];

        crystalConfigs.forEach(cfg => {
            const geo = new THREE.IcosahedronGeometry(cfg.r, cfg.detail);
            const mat = new THREE.MeshBasicMaterial({ color: cfg.color, wireframe: true, transparent: true, opacity: cfg.op });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(cfg.x, cfg.y, cfg.z);
            mesh.userData = { rx: cfg.rx, ry: cfg.ry, baseY: cfg.y, phase: Math.random() * Math.PI * 2 };
            hss.add(mesh);
            crystals.push(mesh);
        });

        // ── Floating octahedra ──
        const octas = [];
        [
            { x: -11, y: -0.5, z: -5, r: 0.7, c: 0x00ffee },
            { x: 10.5, y: -1.5, z: -4, r: 0.55, c: 0xff3cac },
            { x: -3, y: 4.5, z: -7, r: 0.4, c: 0x7b2fff }
        ].forEach(o => {
            const g = new THREE.OctahedronGeometry(o.r, 0);
            const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: o.c, wireframe: true, transparent: true, opacity: 0.3 }));
            m.position.set(o.x, o.y, o.z);
            m.userData = { baseY: o.y, phase: Math.random() * Math.PI * 2 };
            hss.add(m);
            octas.push(m);
        });

        // ── Thin orbit torus rings at various tilts ──
        const hsRings = [];
        [
            { r: 3.5, t: 0.015, tx: 0x00ffee, op: 0.15, rx: Math.PI / 3, ry: 0.1, rz: 0 },
            { r: 2.8, t: 0.01, tx: 0x7b2fff, op: 0.12, rx: Math.PI / 5, ry: 0.2, rz: 0.3 },
            { r: 4.2, t: 0.012, tx: 0xff3cac, op: 0.1, rx: Math.PI / 2.5, ry: -0.1, rz: 0.2 },
        ].forEach(ring => {
            const rg = new THREE.TorusGeometry(ring.r, ring.t, 8, 80);
            const rm = new THREE.MeshBasicMaterial({ color: ring.tx, transparent: true, opacity: ring.op });
            const rm3 = new THREE.Mesh(rg, rm);
            rm3.rotation.set(ring.rx, ring.ry, ring.rz);
            rm3.position.set(7, -1.5, -6);
            rm3.userData = { sp: 0.003 + Math.random() * 0.003 };
            hss.add(rm3);
            hsRings.push(rm3);
        });

        // ── Particle field ──
        const hsParticleCount = 400;
        const hsPPos = new Float32Array(hsParticleCount * 3);
        for (let i = 0; i < hsParticleCount; i++) {
            hsPPos[i * 3]     = (Math.random() - 0.5) * 28;
            hsPPos[i * 3 + 1] = (Math.random() - 0.5) * 18;
            hsPPos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 4;
        }
        const hsPGeo = new THREE.BufferGeometry();
        hsPGeo.setAttribute('position', new THREE.BufferAttribute(hsPPos, 3));
        const hsPMat = new THREE.PointsMaterial({ color: 0x00ffee, size: 0.04, transparent: true, opacity: 0.5 });
        hss.add(new THREE.Points(hsPGeo, hsPMat));

        // ── Hero scene mouse tilt ──
        let hsMx = 0, hsMy = 0;
        document.addEventListener('mousemove', e => {
            hsMx = (e.clientX / window.innerWidth - 0.5) * 2;
            hsMy = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        let hsTime = 0;
        function heroSceneLoop() {
            requestAnimationFrame(heroSceneLoop);
            if (!inView('hero')) return;
            hsTime += 0.008;

            // Rotate torus knot
            torusKnot.rotation.x += 0.005;
            torusKnot.rotation.y += 0.008;
            torusKnot.rotation.z += 0.003;

            // Animate crystals
            crystals.forEach((mesh, i) => {
                mesh.rotation.x += mesh.userData.rx;
                mesh.rotation.y += mesh.userData.ry;
                mesh.position.y = mesh.userData.baseY + Math.sin(hsTime * 0.8 + mesh.userData.phase) * 0.25;
            });

            // Animate octahedra
            octas.forEach(m => {
                m.rotation.x += 0.007;
                m.rotation.y += 0.005;
                m.position.y = m.userData.baseY + Math.sin(hsTime * 0.6 + m.userData.phase) * 0.35;
            });

            // Spin rings
            hsRings.forEach(r => { r.rotation.z += r.userData.sp; });

            // Subtle camera drift tracking mouse
            hsCam.position.x += (hsMx * 1.5 - hsCam.position.x) * 0.04;
            hsCam.position.y += (-hsMy * 0.8 - hsCam.position.y) * 0.04;
            hsCam.lookAt(0, 0, 0);

            hsr.render(hss, hsCam);
        }
        heroSceneLoop();
    }

    // ── 8. ABOUT — 3D EFFECTS CANVAS + HTML PHOTO OVERLAY ───
    const aCv = document.getElementById('aC');
    const aR3 = new THREE.WebGLRenderer({ canvas: aCv, alpha: true, antialias: true });
    aR3.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    aR3.setSize(360, 360);

    const aS  = new THREE.Scene();
    const aCam = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    aCam.position.z = 5.2;

    // ── Outer orbiting rings (surround the HTML photo) ────
    const orbitRings = [];
    [
        { r: 1.55, tube: 0.010, color: 0x00ffee, rx: 1.1, rz: 0,   sp:  0.005, op: 0.65 },
        { r: 1.80, tube: 0.007, color: 0x7b2fff, rx: 0.6, rz: 0.4, sp: -0.004, op: 0.45 },
        { r: 2.05, tube: 0.005, color: 0xff3cac, rx: 0.3, rz: 0.8, sp:  0.003, op: 0.35 },
        { r: 2.30, tube: 0.004, color: 0x39ff14, rx: 0.8, rz: 0.6, sp: -0.002, op: 0.25 },
    ].forEach(cfg => {
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(cfg.r, cfg.tube, 8, 120),
            new THREE.MeshBasicMaterial({ color: cfg.color, transparent: true, opacity: cfg.op })
        );
        ring.rotation.x = cfg.rx;
        ring.rotation.z = cfg.rz;
        ring.userData.sp = cfg.sp;
        orbitRings.push(ring);
        aS.add(ring);
    });

    // ── 10 glowing orbiting electron nodes ───────────────
    const orbitNodes = [];
    for (let i = 0; i < 10; i++) {
        const nodeColor = [0x00ffee, 0x7b2fff, 0xff3cac, 0x39ff14][i % 4];
        const nodeMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.055, 8, 8),
            new THREE.MeshBasicMaterial({ color: nodeColor })
        );
        const halo = new THREE.Mesh(
            new THREE.SphereGeometry(0.10, 8, 8),
            new THREE.MeshBasicMaterial({ color: nodeColor, transparent: true, opacity: 0.15 })
        );
        nodeMesh.add(halo);
        nodeMesh.userData = {
            angle:  (i / 10) * Math.PI * 2,
            radius: 1.55 + (i % 4) * 0.18,
            speed:  0.014 + i * 0.002,
            tilt:   i * 0.45
        };
        aS.add(nodeMesh);
        orbitNodes.push(nodeMesh);
    }

    // ── Deforming wireframe icosphere shield ──────────────
    const shieldGeo = new THREE.IcosahedronGeometry(2.3, 2);
    const shieldOrigPos = shieldGeo.attributes.position;
    const shieldVertCount = shieldOrigPos.count;
    const shieldOrigPts = new Float32Array(shieldVertCount * 3);
    for (let i = 0; i < shieldVertCount; i++) {
        shieldOrigPts[i * 3]     = shieldOrigPos.getX(i);
        shieldOrigPts[i * 3 + 1] = shieldOrigPos.getY(i);
        shieldOrigPts[i * 3 + 2] = shieldOrigPos.getZ(i);
    }
    const shieldMesh = new THREE.Mesh(shieldGeo, new THREE.MeshBasicMaterial({
        color: 0x00ffee, wireframe: true, transparent: true, opacity: 0.09
    }));
    aS.add(shieldMesh);

    // ── Glowing frame ring (front-facing, pulses) ─────────
    const frameMesh = new THREE.Mesh(
        new THREE.TorusGeometry(1.42, 0.025, 8, 128),
        new THREE.MeshBasicMaterial({ color: 0x00ffee, transparent: true, opacity: 0.8 })
    );
    aS.add(frameMesh);

    const frameMesh2 = new THREE.Mesh(
        new THREE.TorusGeometry(1.35, 0.012, 8, 128),
        new THREE.MeshBasicMaterial({ color: 0x7b2fff, transparent: true, opacity: 0.5 })
    );
    aS.add(frameMesh2);

    // ── JS 3D tilt for the HTML photo element ────────────
    const profileWrap = document.getElementById('profileWrap');
    let tiltX = 0, tiltY = 0, tiltTargX = 0, tiltTargY = 0;
    let aboutMouseX = 0, aboutMouseY = 0;

    const aboutContainer = document.querySelector('.aViz');
    if (aboutContainer) {
        aboutContainer.addEventListener('mousemove', e => {
            const rect = aboutContainer.getBoundingClientRect();
            const nx = (e.clientX - rect.left) / rect.width  - 0.5;   // -0.5 to 0.5
            const ny = (e.clientY - rect.top)  / rect.height - 0.5;
            aboutMouseX =  nx * 0.5;
            aboutMouseY = -ny * 0.5;
            tiltTargX = -ny * 22;   // CSS rotateX
            tiltTargY =  nx * 22;   // CSS rotateY
        });
        aboutContainer.addEventListener('mouseleave', () => {
            aboutMouseX = 0;
            aboutMouseY = 0;
            tiltTargX = 0;
            tiltTargY = 0;
        });
    }

    let aboutTime = 0;
    function aboutLoop() {
        requestAnimationFrame(aboutLoop);
        if (!inView('about')) return;
        aboutTime += 0.012;

        // Smooth tilt lerp for HTML photo
        tiltX += (tiltTargX - tiltX) * 0.08;
        tiltY += (tiltTargY - tiltY) * 0.08;
        if (profileWrap) {
            const floatY = Math.sin(aboutTime * 0.7) * 6;
            profileWrap.style.transform =
                `translate(-50%, calc(-50% + ${floatY}px)) perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        }

        // Deforming shield
        const posAttr = shieldGeo.attributes.position;
        for (let i = 0; i < shieldVertCount; i++) {
            const ox = shieldOrigPts[i * 3];
            const oy = shieldOrigPts[i * 3 + 1];
            const oz = shieldOrigPts[i * 3 + 2];
            const wave = Math.sin(aboutTime * 1.2 + ox * 2.5 + oy * 2.5) * 0.07;
            posAttr.setXYZ(i, ox * (1 + wave), oy * (1 + wave), oz * (1 + wave));
        }
        posAttr.needsUpdate = true;
        shieldMesh.rotation.y += 0.005;
        shieldMesh.rotation.x  = aboutTime * 0.03;

        // Orbit rings
        orbitRings.forEach(ring => { ring.rotation.y += ring.userData.sp; });

        // Orbit nodes
        orbitNodes.forEach(node => {
            node.userData.angle += node.userData.speed;
            const a = node.userData.angle;
            const r = node.userData.radius;
            const tl = node.userData.tilt;
            node.position.x = Math.cos(a) * r * Math.cos(tl);
            node.position.y = Math.sin(a + tl) * 0.55;
            node.position.z = Math.sin(a) * r * Math.cos(tl);
        });

        // Pulsing frame ring
        const pulse = 0.7 + 0.3 * Math.sin(aboutTime * 2.5);
        frameMesh.material.opacity  = 0.6 * pulse + 0.2;
        frameMesh2.material.opacity = 0.4 * pulse + 0.1;

        aR3.render(aS, aCam);
    }
    aboutLoop();

    // ── 8.5. JOURNEY SECTION — 3D BACKGROUND HELIX SCENE ────
    const tlCv = document.getElementById('tlCanvas');
    if (tlCv) {
        const tlR = new THREE.WebGLRenderer({ canvas: tlCv, alpha: true, antialias: true });
        tlR.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const tlS = new THREE.Scene();
        const tlCam = new THREE.PerspectiveCamera(60, 1, 0.1, 500);
        tlCam.position.set(0, 0, 28);

        function resizeTl() {
            const el = document.getElementById('tline');
            if (!el) return;
            const w = el.offsetWidth, h = el.offsetHeight;
            tlR.setSize(w, h);
            tlCam.aspect = w / Math.max(h, 1);
            tlCam.updateProjectionMatrix();
        }
        resizeTl();
        window.addEventListener('resize', resizeTl);

        // ── Double Helix (DNA) running vertically ─────────────
        const helixGroup = new THREE.Group();
        tlS.add(helixGroup);
        const helixTurns = 8;
        const helixHeight = 40;
        const helixRadius = 4;
        const helixSteps = helixTurns * 40;

        const strand1Pts = [], strand2Pts = [];
        for (let i = 0; i <= helixSteps; i++) {
            const t  = i / helixSteps;
            const y  = (t - 0.5) * helixHeight;
            const a1 = t * helixTurns * Math.PI * 2;
            const a2 = a1 + Math.PI;
            strand1Pts.push(new THREE.Vector3(Math.cos(a1) * helixRadius, y, Math.sin(a1) * helixRadius));
            strand2Pts.push(new THREE.Vector3(Math.cos(a2) * helixRadius, y, Math.sin(a2) * helixRadius));
        }

        const mkStrand = (pts, color) => {
            const g = new THREE.BufferGeometry().setFromPoints(pts);
            return new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.35 }));
        };
        helixGroup.add(mkStrand(strand1Pts, 0x00ffee));
        helixGroup.add(mkStrand(strand2Pts, 0x7b2fff));

        // Cross-links between strands every N steps
        for (let i = 0; i < helixSteps; i += 8) {
            const crossGeo = new THREE.BufferGeometry().setFromPoints([strand1Pts[i], strand2Pts[i]]);
            const crossMat = new THREE.LineBasicMaterial({ color: 0xff3cac, transparent: true, opacity: 0.18 });
            helixGroup.add(new THREE.Line(crossGeo, crossMat));
        }

        // ── Year milestone 3D nodes along the helix ──────────
        const yearData = [
            { year: '2022', t: 0.08,  color: 0x00ffee, label: 'LPU' },
            { year: '2023', t: 0.31,  color: 0x7b2fff, label: 'AWS' },
            { year: '2024', t: 0.57,  color: 0xff3cac, label: 'BUILD' },
            { year: '2025', t: 0.78,  color: 0x39ff14, label: 'GRIND' },
            { year: '2028', t: 0.96,  color: 0x00ffee, label: 'LAUNCH' },
        ];

        const yearNodes = yearData.map(yd => {
            const t  = yd.t;
            const y  = (t - 0.5) * helixHeight;
            const a  = t * helixTurns * Math.PI * 2;
            const x  = Math.cos(a) * helixRadius;
            const z  = Math.sin(a) * helixRadius;

            // Core sphere
            const core = new THREE.Mesh(
                new THREE.IcosahedronGeometry(0.45, 1),
                new THREE.MeshBasicMaterial({ color: yd.color, transparent: true, opacity: 0.9 })
            );
            core.position.set(x, y, z);

            // Glow halo
            const halo = new THREE.Mesh(
                new THREE.SphereGeometry(0.9, 12, 12),
                new THREE.MeshBasicMaterial({ color: yd.color, transparent: true, opacity: 0.1 })
            );
            core.add(halo);

            // Ring around the node
            const nodeRing = new THREE.Mesh(
                new THREE.TorusGeometry(0.7, 0.025, 8, 48),
                new THREE.MeshBasicMaterial({ color: yd.color, transparent: true, opacity: 0.5 })
            );
            nodeRing.rotation.x = Math.PI / 2;
            core.add(nodeRing);

            helixGroup.add(core);
            return { mesh: core, color: yd.color, baseY: y, phase: Math.random() * Math.PI * 2 };
        });

        // ── Floating particle field around the helix ──────────
        const tlParticleCount = 600;
        const tlPPos = new Float32Array(tlParticleCount * 3);
        const tlPCol = new Float32Array(tlParticleCount * 3);
        const tlCols = [[0, 1, 0.93], [0.48, 0.18, 1.0], [1, 0.24, 0.67], [0.22, 1, 0.08]];
        for (let i = 0; i < tlParticleCount; i++) {
            tlPPos[i * 3]     = (Math.random() - 0.5) * 40;
            tlPPos[i * 3 + 1] = (Math.random() - 0.5) * 50;
            tlPPos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
            const c = tlCols[i % 4];
            tlPCol[i * 3] = c[0]; tlPCol[i * 3 + 1] = c[1]; tlPCol[i * 3 + 2] = c[2];
        }
        const tlPGeo = new THREE.BufferGeometry();
        tlPGeo.setAttribute('position', new THREE.BufferAttribute(tlPPos, 3));
        tlPGeo.setAttribute('color', new THREE.BufferAttribute(tlPCol, 3));
        const tlPMat = new THREE.PointsMaterial({ size: 0.18, vertexColors: true, transparent: true, opacity: 0.55, depthWrite: false });
        tlS.add(new THREE.Points(tlPGeo, tlPMat));

        // ── Outer ambient geometry ────────────────────────────
        const tlRings = [];
        [[12, 0x00ffee, 0.025], [15, 0x7b2fff, 0.018], [18, 0xff3cac, 0.012]].forEach(([r, c, op]) => {
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(r, 0.04, 8, 80),
                new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: op })
            );
            ring.rotation.x = Math.PI / 2;
            ring.userData.sp = 0.002 + Math.random() * 0.001;
            tlS.add(ring);
            tlRings.push(ring);
        });

        // ── Scroll-driven: helix position tracks scroll inside section ──
        const tlSection = document.getElementById('tline');
        let tlTime = 0;
        function tlLoop() {
            requestAnimationFrame(tlLoop);
            if (!inView('tline')) return;
            tlTime += 0.008;

            // Rotate entire helix slowly
            helixGroup.rotation.y += 0.004;

            // Pulse year nodes
            yearNodes.forEach((yn, i) => {
                const pulse = 0.8 + 0.2 * Math.sin(tlTime * 2 + yn.phase);
                yn.mesh.scale.set(pulse, pulse, pulse);
                yn.mesh.rotation.y += 0.015;
            });

            // Spin ambient rings
            tlRings.forEach(r => { r.rotation.z += r.userData.sp; });

            // Scroll-driven: move helix up as user scrolls through section
            if (tlSection) {
                const rect = tlSection.getBoundingClientRect();
                const secH = tlSection.offsetHeight;
                const progress = Math.max(0, Math.min(1, -rect.top / (secH - window.innerHeight)));
                helixGroup.position.y = -progress * helixHeight * 0.5 + helixHeight * 0.2;
            }

            // Mouse subtle camera drift
            tlCam.position.x += (smoothMouseX3 * 0.08 - tlCam.position.x) * 0.03;
            tlCam.lookAt(0, 0, 0);

            tlR.render(tlS, tlCam);
        }
        tlLoop();
    }

    // ── 8.5.5. SKILLS TECH ARSENAL SECTION — 3D DOUBLE QUANTUM TECH-REACTORS ──
    const skillCv = document.getElementById('skillCanvas');
    if (skillCv) {
        const sR = new THREE.WebGLRenderer({ canvas: skillCv, alpha: true, antialias: true });
        sR.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const sS = new THREE.Scene();
        const sCam = new THREE.PerspectiveCamera(50, 1, 0.1, 300);
        sCam.position.z = 24;

        // Base container group for parallax and overall positioning
        const coreGroup = new THREE.Group();
        sS.add(coreGroup);

        // 1. Left and Right Cohesive Sentinel Reactor Groups (Placed in visible margins)
        const leftReactor = new THREE.Group();
        const rightReactor = new THREE.Group();
        coreGroup.add(leftReactor, rightReactor);

        function resizeSkill() {
            const el = document.getElementById('skills');
            if (!el) return;
            const w = el.offsetWidth, h = el.offsetHeight;
            sR.setSize(w, h);
            sCam.aspect = w / Math.max(h, 1);
            sCam.updateProjectionMatrix();

            // Dynamically position reactors in side margins based on window aspect ratio to prevent clipping and text overlap
            const fovRad = (sCam.fov * Math.PI) / 180;
            // Reactor is at z = -2, Cam at z = 24, total distance = 26
            const visibleWidth = 2 * Math.tan(fovRad / 2) * 26 * sCam.aspect;
            const rx = Math.min(13.8, visibleWidth * 0.43);
            
            leftReactor.position.set(-rx, 1, -2);
            rightReactor.position.set(rx, -1, -2);

            // Scale down on smaller viewports
            const scale = w < 768 ? 0.45 : (w < 1200 ? 0.72 : 1.0);
            leftReactor.scale.set(scale, scale, scale);
            rightReactor.scale.set(scale, scale, scale);
        }

        // 2. Digital Grid Floor (Blueprint Style)
        const gridGeo = new THREE.PlaneGeometry(100, 100, 20, 20);
        const gridMat = new THREE.MeshBasicMaterial({
            color: 0x00ffee,
            wireframe: true,
            transparent: true,
            opacity: 0.04
        });
        const gridMesh = new THREE.Mesh(gridGeo, gridMat);
        gridMesh.rotation.x = -Math.PI / 2.3;
        gridMesh.position.y = -9;
        gridMesh.position.z = -8;
        coreGroup.add(gridMesh);

        const colors = [0x00ffee, 0xff3cac, 0x7b2fff];
        const leftRings = [], rightRings = [];
        const ringRadii = [4.5, 6.0, 7.5];

        // Generate nested counter-rotating rings for both Reactors
        ringRadii.forEach((r, idx) => {
            const color = colors[idx % colors.length];
            const mat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.09 - idx * 0.02 });

            // Left rings
            const lRing = new THREE.Mesh(new THREE.TorusGeometry(r, 0.035, 8, 80), mat);
            lRing.rotation.x = Math.random() * Math.PI;
            lRing.rotation.y = Math.random() * Math.PI;
            leftReactor.add(lRing);
            leftRings.push({ mesh: lRing, rx: 0.003 + idx * 0.002, ry: 0.002, rz: 0.003 });

            // Right rings
            const rRing = new THREE.Mesh(new THREE.TorusGeometry(r, 0.035, 8, 80), mat);
            rRing.rotation.x = Math.random() * Math.PI;
            rRing.rotation.y = Math.random() * Math.PI;
            rightReactor.add(rRing);
            rightRings.push({ mesh: rRing, rx: -0.002 - idx * 0.002, ry: -0.003, rz: -0.002 });
        });

        // Left Core (Dodecahedron)
        const leftCore = new THREE.Mesh(
            new THREE.DodecahedronGeometry(1.0, 0),
            new THREE.MeshBasicMaterial({ color: 0x00ffee, wireframe: true, transparent: true, opacity: 0.28 })
        );
        const leftInner = new THREE.Mesh(
            new THREE.SphereGeometry(0.35, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xff3cac, transparent: true, opacity: 0.45 })
        );
        leftCore.add(leftInner);
        leftReactor.add(leftCore);

        // Right Core (Octahedron / TorusKnot)
        const rightCore = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.9, 0),
            new THREE.MeshBasicMaterial({ color: 0xff3cac, wireframe: true, transparent: true, opacity: 0.28 })
        );
        const rightInner = new THREE.Mesh(
            new THREE.SphereGeometry(0.35, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0x00ffee, transparent: true, opacity: 0.45 })
        );
        rightCore.add(rightInner);
        rightReactor.add(rightCore);

        // 3. Synergy Circuit Pathways connecting Left & Right Sentinels
        const pathGroup = new THREE.Group();
        coreGroup.add(pathGroup);

        const connectedPairs = [];
        for (let i = 0; i < 6; i++) {
            const pathPoints = [];
            // Start from left reactor vicinity and end at right reactor vicinity
            let cx = -13 + Math.random() * 2;
            let cy = 1 + (Math.random() - 0.5) * 4;
            let cz = -2 + (Math.random() - 0.5) * 3;

            const steps = [];
            for (let step = 0; step < 5; step++) {
                const vec = new THREE.Vector3(cx, cy, cz);
                pathPoints.push(vec);
                steps.push(vec);

                // Guide horizontal drift toward the right
                if (step === 4) {
                    cx = 13 + (Math.random() - 0.5) * 2;
                } else {
                    cx += 4.5 + Math.random() * 2.0;
                    cy += (Math.random() - 0.5) * 3.5;
                    cz += (Math.random() - 0.5) * 2.0;
                }
            }

            const pathGeo = new THREE.BufferGeometry().setFromPoints(pathPoints);
            const pathMat = new THREE.LineBasicMaterial({
                color: 0x7b2fff,
                transparent: true,
                opacity: 0.12
            });
            pathGroup.add(new THREE.Line(pathGeo, pathMat));

            // Store pairs for active signal pulses
            for (let s = 0; s < steps.length - 1; s++) {
                connectedPairs.push({ start: steps[s], end: steps[s + 1] });
            }
        }

        // Active laser signal packets shooting along the inter-reactor circuits
        const packets = [];
        const packetGeo = new THREE.SphereGeometry(0.16, 6, 6);
        const packetCount = 12;

        if (connectedPairs.length > 0) {
            for (let i = 0; i < packetCount; i++) {
                const col = colors[i % colors.length];
                const pMesh = new THREE.Mesh(packetGeo, new THREE.MeshBasicMaterial({
                    color: col,
                    transparent: true,
                    opacity: 0.95
                }));
                pathGroup.add(pMesh);

                packets.push({
                    mesh: pMesh,
                    pairIndex: Math.floor(Math.random() * connectedPairs.length),
                    t: Math.random(),
                    speed: 0.004 + Math.random() * 0.006
                });
            }
        }

        // 4. Twinkling Background Space Dust
        const starCount = 500;
        const starGeo = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            starPositions[i * 3] = (Math.random() - 0.5) * 60;
            starPositions[i * 3 + 1] = (Math.random() - 0.5) * 36;
            starPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        const starMat = new THREE.PointsMaterial({
            color: 0x00ffee,
            size: 0.09,
            transparent: true,
            opacity: 0.35,
            depthWrite: false
        });
        const starPoints = new THREE.Points(starGeo, starMat);
        coreGroup.add(starPoints);

        // Run resizeSkill immediately to position elements, then listen on window resizing
        resizeSkill();
        window.addEventListener('resize', resizeSkill);

        // 5. Animation Loop
        let sTime = 0;
        function skillLoop() {
            requestAnimationFrame(skillLoop);
            if (!inView('skills')) return;
            sTime += 0.008;

            // Wave dynamic Grid Floor
            const pAttr = gridGeo.attributes.position;
            for (let i = 0; i < pAttr.count; i++) {
                const x = pAttr.getX(i);
                const y = pAttr.getY(i);
                const z = Math.sin(x * 0.08 + sTime * 1.3) * Math.cos(y * 0.08 + sTime * 1.3) * 1.4;
                pAttr.setZ(i, z);
            }
            pAttr.needsUpdate = true;

            // Rotate left reactor rings
            leftRings.forEach(r => {
                r.mesh.rotation.x += r.rx;
                r.mesh.rotation.y += r.ry;
                r.mesh.rotation.z += r.rz;
            });

            // Rotate right reactor rings
            rightRings.forEach(r => {
                r.mesh.rotation.x += r.rx;
                r.mesh.rotation.y += r.ry;
                r.mesh.rotation.z += r.rz;
            });

            // Pulse cores (breathing)
            const pulse = 1.0 + Math.sin(sTime * 2.0) * 0.18;
            leftCore.scale.set(pulse, pulse, pulse);
            leftCore.rotation.y += 0.007;
            leftCore.rotation.x -= 0.003;
            leftInner.scale.set(1.0 + Math.cos(sTime * 2.0) * 0.15, 1.0 + Math.cos(sTime * 2.0) * 0.15, 1.0 + Math.cos(sTime * 2.0) * 0.15);

            rightCore.scale.set(pulse, pulse, pulse);
            rightCore.rotation.y -= 0.006;
            rightCore.rotation.z += 0.004;
            rightInner.scale.set(1.0 + Math.cos(sTime * 2.0) * 0.15, 1.0 + Math.cos(sTime * 2.0) * 0.15, 1.0 + Math.cos(sTime * 2.0) * 0.15);

            // Bob reactors slightly
            leftReactor.position.y = 1 + Math.sin(sTime * 0.5) * 0.4;
            rightReactor.position.y = -1 + Math.sin(sTime * 0.5 + Math.PI) * 0.4;

            // Animate active signal packets along pathways
            packets.forEach(p => {
                p.t += p.speed;
                if (p.t >= 1) {
                    p.t = 0;
                    p.pairIndex = Math.floor(Math.random() * connectedPairs.length);
                }

                const pair = connectedPairs[p.pairIndex];
                if (pair) {
                    const pos = new THREE.Vector3().copy(pair.start).lerp(pair.end, p.t);
                    p.mesh.position.copy(pos);
                    const scale = Math.sin(p.t * Math.PI) * 1.4;
                    p.mesh.scale.set(scale, scale, scale);
                }
            });

            // Rotate dust points
            starPoints.rotation.y += 0.00015;

            // Slow rotate overall reactor structures
            leftReactor.rotation.y += 0.0006;
            rightReactor.rotation.y += 0.0006;

            // Scroll-driven parallax translation
            const elSkills = document.getElementById('skills');
            if (elSkills) {
                const rect = elSkills.getBoundingClientRect();
                const totalScrollable = elSkills.offsetHeight + window.innerHeight;
                const scrollProgress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / totalScrollable));
                coreGroup.position.y = (scrollProgress - 0.5) * -8;
            }

            // Gentle camera responsive mouse drift
            sCam.position.x += (smoothMouseX3 * 0.06 - sCam.position.x) * 0.03;
            sCam.lookAt(0, 0, 0);

            sR.render(sS, sCam);
        }
        skillLoop();
    }

    // ── 8.5.6. CENTERPIECE SKILLS HOLO-CORE ──────────────────────────────────
    const holoCv = document.getElementById('holoCanvas');
    if (holoCv) {
        const hR = new THREE.WebGLRenderer({ canvas: holoCv, alpha: true, antialias: true });
        hR.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const hS = new THREE.Scene();
        const hCam = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
        hCam.position.z = 24;

        // Container group that rotates, containing all sprites and orbits
        const holoGroup = new THREE.Group();
        hS.add(holoGroup);

        function resizeHolo() {
            const container = holoCv.parentElement;
            if (!container) return;
            const w = container.clientWidth;
            const h = container.clientHeight || 400;
            hR.setSize(w, h);
            hCam.aspect = w / Math.max(h, 1);
            hCam.updateProjectionMatrix();
        }
        // Run resizeHolo immediately, and register listener
        resizeHolo();
        window.addEventListener('resize', resizeHolo);

        // Core 3D Geometry
        const coreGeo = new THREE.IcosahedronGeometry(2.0, 1);
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0x00ffee,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        holoGroup.add(coreMesh);

        // Glowing center core inner sphere
        const innerGeo = new THREE.SphereGeometry(0.8, 16, 16);
        const innerMat = new THREE.MeshBasicMaterial({
            color: 0xff3cac,
            transparent: true,
            opacity: 0.4
        });
        const innerMesh = new THREE.Mesh(innerGeo, innerMat);
        holoGroup.add(innerMesh);

        // Outer tech rings
        const ring1 = new THREE.Mesh(
            new THREE.TorusGeometry(4.2, 0.025, 8, 64),
            new THREE.MeshBasicMaterial({ color: 0x7b2fff, transparent: true, opacity: 0.32 })
        );
        const ring2 = new THREE.Mesh(
            new THREE.TorusGeometry(5.8, 0.02, 8, 64),
            new THREE.MeshBasicMaterial({ color: 0x00ffee, transparent: true, opacity: 0.22 })
        );
        ring1.rotation.x = Math.PI / 3;
        ring2.rotation.y = Math.PI / 4;
        holoGroup.add(ring1, ring2);

        // Tech skills nodes data structure
        const skillNodes = [
            // Languages
            { name: "Python", cat: "languages", pct: 85, status: "OPTIMAL", idx: "0.85", desc: "Primary logic core. Used for automation, data science, and scripting." },
            { name: "Java", cat: "languages", pct: 80, status: "ACTIVE", idx: "0.80", desc: "Object-oriented core. Robust system building and backend architectures." },
            { name: "C++", cat: "languages", pct: 75, status: "STABLE", idx: "0.75", desc: "High-performance systems. Memory management and structural execution." },
            { name: "C", cat: "languages", pct: 75, status: "STABLE", idx: "0.75", desc: "Low-level foundation. Hardware interfaces and micro-optimizations." },
            
            // DevOps
            { name: "AWS", cat: "devops", pct: 78, status: "ACTIVE", idx: "0.78", desc: "Cloud orchestration. EC2, RDS, VPCs, and serverless architectures." },
            { name: "Docker", cat: "devops", pct: 70, status: "OPTIMAL", idx: "0.70", desc: "Container virtualization. isolated builds and cohesive deployments." },
            { name: "CI/CD", cat: "devops", pct: 72, status: "ACTIVE", idx: "0.72", desc: "Continuous delivery. Automating testing, staging, and deployment vectors." },
            { name: "Linux", cat: "devops", pct: 82, status: "OPTIMAL", idx: "0.82", desc: "Kernel interaction. Shell scripting, system services, and administration." },
            
            // Data & Tools
            { name: "SQL", cat: "data", pct: 76, status: "STABLE", idx: "0.76", desc: "Relational database core. Query optimization, schema mapping, and indexing." },
            { name: "Git", cat: "data", pct: 88, status: "OPTIMAL", idx: "0.88", desc: "Version control engine. Code branches, pull requests, and collaborative merges." },
            { name: "Supabase", cat: "data", pct: 73, status: "ACTIVE", idx: "0.73", desc: "Real-time backend hub. Database synchronization, auth systems, and storage." },
            { name: "REST APIs", cat: "data", pct: 82, status: "OPTIMAL", idx: "0.82", desc: "Web connectivity pipelines. System-to-system interfaces and data payloads." }
        ];

        // Spherical placement using Fibonacci sphere math
        const count = skillNodes.length;
        const R = 8.2;
        
        // Canvas textured sprite generator (uses HTML5 canvas to write text)
        function createTextSprite(text, color) {
            // High-resolution canvas texture to maintain extreme sharpness when scaled up
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Glass background (more visible, glowing borders)
            ctx.fillStyle = 'rgba(0, 255, 238, 0.05)';
            ctx.strokeStyle = color;
            ctx.lineWidth = 4.0;
            
            // Round rect
            if (ctx.roundRect) {
                ctx.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 16);
            } else {
                ctx.rect(10, 10, canvas.width - 20, canvas.height - 20);
            }
            ctx.fill();
            ctx.stroke();
            
            // Bold, large, highly readable monospaced font
            ctx.font = "bold 44px 'Share Tech Mono', 'Orbitron', monospace";
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.shadowColor = color;
            ctx.shadowBlur = 12;
            ctx.fillText(text.toUpperCase(), canvas.width / 2, canvas.height / 2);
            
            const texture = new THREE.CanvasTexture(canvas);
            const mat = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                opacity: 0.95,
                depthWrite: false
            });
            
            const sprite = new THREE.Sprite(mat);
            sprite.scale.set(6.4, 1.6, 1);
            return sprite;
        }

        let activeCategory = 'languages';

        // Lay out and create meshes
        skillNodes.forEach((node, idx) => {
            const phi = Math.acos(1 - 2 * (idx + 0.5) / count);
            const theta = Math.PI * (1 + Math.sqrt(5)) * (idx + 0.5);
            
            node.pos = new THREE.Vector3(
                R * Math.sin(phi) * Math.cos(theta),
                R * Math.sin(phi) * Math.sin(theta),
                R * Math.cos(phi)
            );

            // Create canvas-textured sprite
            const themeColor = node.cat === 'languages' ? '#00ffee' : (node.cat === 'devops' ? '#ff3cac' : '#7b2fff');
            const sprite = createTextSprite(node.name, themeColor);
            sprite.position.copy(node.pos);
            holoGroup.add(sprite);
            node.sprite = sprite;

            // Communication vector lines connecting node to the center
            const linePoints = [new THREE.Vector3(0, 0, 0), node.pos];
            const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
            const lineMat = new THREE.LineBasicMaterial({
                color: node.cat === 'languages' ? 0x00ffee : (node.cat === 'devops' ? 0xff3cac : 0x7b2fff),
                transparent: true,
                opacity: 0.28
            });
            const lineMesh = new THREE.Line(lineGeo, lineMat);
            holoGroup.add(lineMesh);
            node.line = lineMesh;
        });

        // Filter scaling based on categories (highly readable dimensions)
        function applyCategoryFilters() {
            skillNodes.forEach(node => {
                if (node.cat === activeCategory) {
                    node.sprite.scale.set(6.4, 1.6, 1);
                    node.sprite.material.opacity = 0.95;
                    node.line.material.opacity = 0.32;
                } else {
                    node.sprite.scale.set(4.0, 1.0, 1);
                    node.sprite.material.opacity = 0.38; // increased opacity for background nodes readability
                    node.line.material.opacity = 0.08;
                }
            });
        }
        applyCategoryFilters();

        // Left Panel Menu Controllers
        const catItems = document.querySelectorAll('.cat-item');
        catItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                catItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                const cat = item.getAttribute('data-cat');
                if (activeCategory !== cat) {
                    activeCategory = cat;
                    applyCategoryFilters();
                    
                    // Highlight category in logs
                    const catNames = { languages: "LANGUAGES CORE", devops: "CLOUD & DEVOPS", data: "DATA & TOOLS" };
                    updateConsoleLog(`Category selected: [${catNames[cat]}]\n` +
                                     `Displaying floating skill cluster nodes...\n` +
                                     `Hover over individual nodes in the Holo-Core to view active diagnostics telemetry.`);
                }
            });
        });

        // Typewriting HUD diagnostics console
        let typewritingTimeout = null;
        function updateConsoleLog(text) {
            const consoleEl = document.getElementById('telConsole');
            if (!consoleEl) return;
            
            if (typewritingTimeout) clearInterval(typewritingTimeout);
            
            consoleEl.textContent = "";
            let charIndex = 0;
            typewritingTimeout = setInterval(() => {
                if (charIndex < text.length) {
                    consoleEl.textContent += text[charIndex];
                    charIndex++;
                    consoleEl.scrollTop = consoleEl.scrollHeight;
                } else {
                    clearInterval(typewritingTimeout);
                }
            }, 12);
        }

        // Lock diagnostics state on hover
        function highlightNode(node) {
            node.sprite.scale.set(7.6, 1.9, 1);
            node.sprite.material.opacity = 1.0;
            
            // Connect glowing vector line thicker/brighter
            node.line.material.opacity = 0.85;
            
            // Update Right Diagnostic Panel in DOM
            document.getElementById('telName').textContent = node.name.toUpperCase();
            document.getElementById('telBar').style.width = node.pct + '%';
            document.getElementById('telPct').textContent = node.pct + '%';
            
            const catNames = { languages: "LANGUAGES CORE", devops: "CLOUD & DEVOPS", data: "DATA & TOOLS" };
            document.getElementById('telCat').textContent = catNames[node.cat] || "UNKNOWN";
            document.getElementById('telStatus').textContent = node.status;
            document.getElementById('telIndex').textContent = node.idx;
            
            const logText = `SKILL NODE DETECTED: [${node.name.toUpperCase()}]\n` +
                            `INTEGRATION RATIO: ${node.pct}% Proficiency\n` +
                            `PERFORMANCE METRIC: ${node.idx} Target Vector\n` +
                            `SYSTEM CORE: ${catNames[node.cat]}\n` +
                            `STATUS ANALYSIS: Core operational and verified.\n` +
                            `FUNCTION DESCRIPTION:\n> ${node.desc}\n\n` +
                            `Diagnostics check passed. Core optimal.`;
            updateConsoleLog(logText);
        }

        // Raycasting Hover Interactions
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let hoveredNode = null;

        function checkIntersections(clientX, clientY) {
            const rect = holoCv.getBoundingClientRect();
            mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, hCam);
            
            const sprites = skillNodes.map(n => n.sprite);
            const intersects = raycaster.intersectObjects(sprites);

            if (intersects.length > 0) {
                const foundSprite = intersects[0].object;
                const node = skillNodes.find(n => n.sprite === foundSprite);
                if (node && hoveredNode !== node) {
                    if (hoveredNode) {
                        applyCategoryFilters();
                    }
                    hoveredNode = node;
                    highlightNode(node);
                }
            } else {
                if (hoveredNode) {
                    applyCategoryFilters();
                    hoveredNode = null;
                }
            }
        }

        holoCv.addEventListener('mousemove', e => {
            checkIntersections(e.clientX, e.clientY);
        });

        // 3D Drag controls logic
        let isDragging = false;
        let prevMousePos = { x: 0, y: 0 };
        const targetRotation = { x: 0, y: 0 };

        holoCv.addEventListener('mousedown', e => {
            isDragging = true;
            prevMousePos = { x: e.clientX, y: e.clientY };
            holoCv.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', e => {
            if (!isDragging) return;
            const deltaX = e.clientX - prevMousePos.x;
            const deltaY = e.clientY - prevMousePos.y;

            targetRotation.y += deltaX * 0.005;
            targetRotation.x += deltaY * 0.005;

            prevMousePos = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                holoCv.style.cursor = 'grab';
            }
        });

        // Touch support
        holoCv.addEventListener('touchstart', e => {
            if (e.touches.length === 1) {
                isDragging = true;
                prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        }, { passive: true });

        window.addEventListener('touchmove', e => {
            if (!isDragging || e.touches.length !== 1) return;
            const deltaX = e.touches[0].clientX - prevMousePos.x;
            const deltaY = e.touches[0].clientY - prevMousePos.y;

            targetRotation.y += deltaX * 0.005;
            targetRotation.x += deltaY * 0.005;

            prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }, { passive: true });

        window.addEventListener('touchend', () => {
            isDragging = false;
        });

        // Initial log
        updateConsoleLog(`TECH ARSENAL DIAGNOSTICS MODULE [ONLINE]\n` +
                         `Initializing system constellation...\n` +
                         `12 integrated network nodes discovered.\n` +
                         `Hover over individual nodes to inspect integration vector matrices.`);

        // 3D center stage animation loop
        let holoTime = 0;
        function holoLoop() {
            requestAnimationFrame(holoLoop);
            if (!inView('skills')) return;
            holoTime += 0.005;

            // Slow rotate core wireframe elements
            coreMesh.rotation.y += 0.004;
            coreMesh.rotation.x -= 0.002;
            
            // Core breathing pulse scale
            const pulse = 1.0 + Math.sin(holoTime * 3) * 0.1;
            innerMesh.scale.set(pulse, pulse, pulse);

            // Orbit rings
            ring1.rotation.z += 0.003;
            ring2.rotation.z -= 0.002;

            // Inertia rotation lerping for the whole constellation group
            if (!isDragging) {
                targetRotation.y += 0.0015; // default orbital drift
            }
            
            // Clamp X rotation to avoid flipping upside down
            targetRotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, targetRotation.x));

            holoGroup.rotation.y += (targetRotation.y - holoGroup.rotation.y) * 0.07;
            holoGroup.rotation.x += (targetRotation.x - holoGroup.rotation.x) * 0.07;

            // Keep text sprites billboarded (facing camera)
            skillNodes.forEach(node => {
                if (node.sprite) {
                    node.sprite.quaternion.copy(hCam.quaternion);
                }
            });

            // Gentle responsive mouse camera drift
            hCam.position.x += (smoothMouseX3 * 0.05 - hCam.position.x) * 0.03;
            hCam.lookAt(0, 0, 0);

            hR.render(hS, hCam);
        }
        holoLoop();
    }

    // ── 8.6. LEARNING & TRACKS SECTION — 3D CYBER NETWORK ──────
    const learnCv = document.getElementById('learnCanvas');
    if (learnCv) {
        const lR = new THREE.WebGLRenderer({ canvas: learnCv, alpha: true, antialias: true });
        lR.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const lS = new THREE.Scene();
        const lCam = new THREE.PerspectiveCamera(50, 1, 0.1, 300);
        lCam.position.z = 24;

        function resizeLearn() {
            const el = document.getElementById('certifications');
            if (!el) return;
            const w = el.offsetWidth, h = el.offsetHeight;
            lR.setSize(w, h);
            lCam.aspect = w / Math.max(h, 1);
            lCam.updateProjectionMatrix();
        }
        resizeLearn();
        window.addEventListener('resize', resizeLearn);

        // 1. Waving Cyber-Wave Grid Floor
        const gridGeo = new THREE.PlaneGeometry(80, 80, 24, 24);
        const gridMat = new THREE.MeshBasicMaterial({
            color: 0x00ffee,
            wireframe: true,
            transparent: true,
            opacity: 0.04
        });
        const gridMesh = new THREE.Mesh(gridGeo, gridMat);
        gridMesh.rotation.x = -Math.PI / 2.3;
        gridMesh.position.y = -9;
        gridMesh.position.z = -10;
        lS.add(gridMesh);

        // 2. Cosmic Constellation Network Group (Static, ultra-performance)
        const constGroup = new THREE.Group();
        lS.add(constGroup);

        const nodeCount = 45;
        const nodes = [];
        const colors = [0x00ffee, 0x7b2fff, 0xff3cac, 0x39ff14];

        for (let i = 0; i < nodeCount; i++) {
            const x = (Math.random() - 0.5) * 26;
            const y = (Math.random() - 0.5) * 16;
            const z = (Math.random() - 0.5) * 10;
            const col = colors[i % colors.length];

            // Core dot
            const dot = new THREE.Mesh(
                new THREE.SphereGeometry(0.12, 8, 8),
                new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.6 })
            );
            dot.position.set(x, y, z);
            constGroup.add(dot);

            // Subtle glow halo
            const halo = new THREE.Mesh(
                new THREE.SphereGeometry(0.24, 8, 8),
                new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.15 })
            );
            dot.add(halo);

            nodes.push({ x, y, z });
        }

        // Draw connections once (Perfect performance, 0 garbage collection)
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const a = nodes[i];
                const b = nodes[j];
                const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

                if (dist < 6.0) {
                    const lineGeo = new THREE.BufferGeometry().setFromPoints([
                        new THREE.Vector3(a.x, a.y, a.z),
                        new THREE.Vector3(b.x, b.y, b.z)
                    ]);
                    const lineMat = new THREE.LineBasicMaterial({
                        color: 0x00ffee,
                        transparent: true,
                        opacity: 0.08 * (1.0 - dist / 6.0)
                    });
                    constGroup.add(new THREE.Line(lineGeo, lineMat));
                }
            }
        }

        // 3. Giant Holographic Gyroscope Orbit Rings
        const ring1 = new THREE.Mesh(
            new THREE.TorusGeometry(18, 0.03, 8, 100),
            new THREE.MeshBasicMaterial({ color: 0x7b2fff, transparent: true, opacity: 0.06 })
        );
        const ring2 = new THREE.Mesh(
            new THREE.TorusGeometry(22, 0.03, 8, 100),
            new THREE.MeshBasicMaterial({ color: 0xff3cac, transparent: true, opacity: 0.03 })
        );
        ring1.rotation.x = Math.PI / 4;
        ring2.rotation.y = Math.PI / 3;
        lS.add(ring1, ring2);

        // 4. Subtle Cosmic Data Twinkling Particles
        const starCount = 500;
        const starGeo = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            starPositions[i * 3] = (Math.random() - 0.5) * 50;
            starPositions[i * 3 + 1] = (Math.random() - 0.5) * 30;
            starPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        const starMat = new THREE.PointsMaterial({
            color: 0x00ffee,
            size: 0.09,
            transparent: true,
            opacity: 0.28,
            depthWrite: false
        });
        const starPoints = new THREE.Points(starGeo, starMat);
        lS.add(starPoints);

        // 5. Animation Loop
        let lTime = 0;
        function learnLoop() {
            requestAnimationFrame(learnLoop);
            if (!inView('certifications')) return;
            lTime += 0.008;

            // Update waving cyber grid floor
            const pAttr = gridGeo.attributes.position;
            for (let i = 0; i < pAttr.count; i++) {
                const x = pAttr.getX(i);
                const y = pAttr.getY(i);
                const wave = Math.sin(x * 0.08 + lTime * 1.5) * Math.cos(y * 0.08 + lTime * 1.5) * 1.8;
                pAttr.setZ(i, wave);
            }
            pAttr.needsUpdate = true;

            // Rotate ambient elements
            ring1.rotation.z += 0.0006;
            ring1.rotation.y += 0.0003;
            ring2.rotation.z -= 0.0005;
            ring2.rotation.x += 0.0003;

            // Rotate dust points
            starPoints.rotation.y += 0.0002;

            // Slow rotate overall constellation group
            constGroup.rotation.y += 0.0012;
            constGroup.rotation.x += 0.0004;

            // Scroll-driven parallax translation
            const elLearn = document.getElementById('certifications');
            if (elLearn) {
                const rect = elLearn.getBoundingClientRect();
                const totalScrollable = elLearn.offsetHeight + window.innerHeight;
                const scrollProgress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / totalScrollable));
                constGroup.position.y = (scrollProgress - 0.5) * -8;
            }

            // Gentle camera responsive mouse drift
            lCam.position.x += (smoothMouseX3 * 0.06 - lCam.position.x) * 0.03;
            lCam.lookAt(0, 0, 0);

            lR.render(lS, lCam);
        }
        learnLoop();
    }

    // ── 8.6.5. TELEMETRY TRANSITION SECTION — 3D DOUBLE-HELIX QUANTUM FLOW ──
    const transCv = document.getElementById('transCanvas');
    if (transCv) {
        const tR = new THREE.WebGLRenderer({ canvas: transCv, alpha: true, antialias: true });
        tR.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const tS = new THREE.Scene();
        const tCam = new THREE.PerspectiveCamera(40, 1, 0.1, 300);
        tCam.position.z = 20;

        function resizeTrans() {
            const el = document.getElementById('telemetry-transition');
            if (!el) return;
            const w = el.offsetWidth, h = el.offsetHeight;
            tR.setSize(w, h);
            tCam.aspect = w / Math.max(h, 1);
            tCam.updateProjectionMatrix();
        }
        resizeTrans();
        window.addEventListener('resize', resizeTrans);

        // Double helix generation
        const count = 180;
        const geoA = new THREE.BufferGeometry();
        const geoB = new THREE.BufferGeometry();

        const posA = new Float32Array(count * 3);
        const posB = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const x = ((i / count) - 0.5) * 32; // stretch horizontally
            const angle = (i / count) * Math.PI * 10; // 5 full twists
            
            // Helix A
            posA[i * 3]     = x;
            posA[i * 3 + 1] = Math.sin(angle) * 1.8;
            posA[i * 3 + 2] = Math.cos(angle) * 1.8;

            // Helix B
            posB[i * 3]     = x;
            posB[i * 3 + 1] = -Math.sin(angle) * 1.8;
            posB[i * 3 + 2] = -Math.cos(angle) * 1.8;
        }

        geoA.setAttribute('position', new THREE.BufferAttribute(posA, 3));
        geoB.setAttribute('position', new THREE.BufferAttribute(posB, 3));

        const matA = new THREE.PointsMaterial({ color: 0x00ffee, size: 0.12, transparent: true, opacity: 0.7 });
        const matB = new THREE.PointsMaterial({ color: 0xff3cac, size: 0.12, transparent: true, opacity: 0.7 });

        const pointsA = new THREE.Points(geoA, matA);
        const pointsB = new THREE.Points(geoB, matB);

        tS.add(pointsA, pointsB);

        // Twinkling background stars for transition
        const starCount = 150;
        const starGeo = new THREE.BufferGeometry();
        const starPos = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            starPos[i*3]   = (Math.random() - 0.5) * 40;
            starPos[i*3+1] = (Math.random() - 0.5) * 15;
            starPos[i*3+2] = (Math.random() - 0.5) * 10 - 2;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        const starMat = new THREE.PointsMaterial({ color: 0x7b2fff, size: 0.08, transparent: true, opacity: 0.35 });
        const starPoints = new THREE.Points(starGeo, starMat);
        tS.add(starPoints);

        let tTime = 0;
        function transLoop() {
            requestAnimationFrame(transLoop);
            if (!inView('telemetry-transition')) return;
            tTime += 0.015;

            // Animate dynamic double-helix wave flow
            const pA = geoA.attributes.position;
            const pB = geoB.attributes.position;

            for (let i = 0; i < count; i++) {
                const x = ((i / count) - 0.5) * 32;
                const angle = (i / count) * Math.PI * 10 + tTime;

                pA.setXYZ(i, x, Math.sin(angle) * 1.8, Math.cos(angle) * 1.8);
                pB.setXYZ(i, x, -Math.sin(angle) * 1.8, -Math.cos(angle) * 1.8);
            }
            pA.needsUpdate = true;
            pB.needsUpdate = true;

            // Rotate points slightly
            pointsA.rotation.x = tTime * 0.2;
            pointsB.rotation.x = tTime * 0.2;

            starPoints.rotation.y += 0.0003;

            // Mouse parallax follow
            tCam.position.x += (smoothMouseX3 * 0.05 - tCam.position.x) * 0.03;
            tCam.lookAt(0, 0, 0);

            tR.render(tS, tCam);
        }
        transLoop();
    }

    // ── 8.7. FEATURED WORK PROJECTS — 3D QUANTUM CYBER-REACTOR ────
    const projCv = document.getElementById('projCanvas');
    if (projCv) {
        const pR = new THREE.WebGLRenderer({ canvas: projCv, alpha: true, antialias: true });
        pR.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const pS = new THREE.Scene();
        const pCam = new THREE.PerspectiveCamera(50, 1, 0.1, 300);
        pCam.position.z = 24;

        function resizeProj() {
            const el = document.getElementById('projects');
            if (!el) return;
            const w = el.offsetWidth, h = el.offsetHeight;
            pR.setSize(w, h);
            pCam.aspect = w / Math.max(h, 1);
            pCam.updateProjectionMatrix();
        }
        resizeProj();
        window.addEventListener('resize', resizeProj);

        // 1. Digital Grid Floor (Blueprint Style)
        const gridGeo = new THREE.PlaneGeometry(95, 95, 20, 20);
        const gridMat = new THREE.MeshBasicMaterial({
            color: 0x7b2fff,
            wireframe: true,
            transparent: true,
            opacity: 0.04
        });
        const gridMesh = new THREE.Mesh(gridGeo, gridMat);
        gridMesh.rotation.x = -Math.PI / 2.3;
        gridMesh.position.y = -9.5;
        gridMesh.position.z = -8;
        pS.add(gridMesh);

        // 2. Central Quantum Cyber-Reactor Group
        const reactorGroup = new THREE.Group();
        pS.add(reactorGroup);

        const colors = [0x00ffee, 0xff3cac, 0x7b2fff, 0x39ff14];

        // 4 Concentric Counter-Rotating Gyroscope Rings
        const rings = [];
        const ringRadii = [10, 13.5, 17, 20.5];
        ringRadii.forEach((r, idx) => {
            const color = colors[idx % colors.length];
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(r, 0.04, 8, 100),
                new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.08 - idx * 0.015 })
            );

            // Random initial orientations
            ring.rotation.x = Math.random() * Math.PI;
            ring.rotation.y = Math.random() * Math.PI;

            reactorGroup.add(ring);
            rings.push({
                mesh: ring,
                rx: 0.003 + idx * 0.002,
                ry: 0.002 + idx * 0.001,
                rz: 0.004 - idx * 0.0015
            });
        });

        // Glowing Core Icosahedron at the center of the reactor
        const coreGeo = new THREE.IcosahedronGeometry(2.2, 1);
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0x00ffee,
            wireframe: true,
            transparent: true,
            opacity: 0.28
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        reactorGroup.add(coreMesh);

        // Fading solid inner breathing core
        const innerCore = new THREE.Mesh(
            new THREE.SphereGeometry(0.8, 12, 12),
            new THREE.MeshBasicMaterial({ color: 0xff3cac, transparent: true, opacity: 0.45 })
        );
        coreMesh.add(innerCore);

        // 3. Futuristic Circuit Board Pathways
        const pathGroup = new THREE.Group();
        reactorGroup.add(pathGroup);

        const connectedPairs = [];
        for (let i = 0; i < 6; i++) {
            const pathPoints = [];
            let cx = (Math.random() - 0.5) * 28;
            let cy = (Math.random() - 0.5) * 16;
            let cz = (Math.random() - 0.5) * 10;

            const steps = [];
            for (let step = 0; step < 4; step++) {
                const vec = new THREE.Vector3(cx, cy, cz);
                pathPoints.push(vec);
                steps.push(vec);
                const axis = Math.floor(Math.random() * 3);
                const len = (Math.random() - 0.5) * 9;
                if (axis === 0) cx += len;
                else if (axis === 1) cy += len;
                else cz += len;
            }

            const pathGeo = new THREE.BufferGeometry().setFromPoints(pathPoints);
            const pathMat = new THREE.LineBasicMaterial({
                color: 0x00ffee,
                transparent: true,
                opacity: 0.06
            });
            pathGroup.add(new THREE.Line(pathGeo, pathMat));

            // Save line segment pairs for active signal packets
            for (let s = 0; s < steps.length - 1; s++) {
                connectedPairs.push({ start: steps[s], end: steps[s + 1] });
            }
        }

        // Active laser signal packets traveling along pathways
        const packets = [];
        const packetGeo = new THREE.SphereGeometry(0.15, 6, 6);
        const packetCount = 10;

        if (connectedPairs.length > 0) {
            for (let i = 0; i < packetCount; i++) {
                const col = colors[i % colors.length];
                const pMesh = new THREE.Mesh(packetGeo, new THREE.MeshBasicMaterial({
                    color: col,
                    transparent: true,
                    opacity: 0.9
                }));
                pathGroup.add(pMesh);

                packets.push({
                    mesh: pMesh,
                    pairIndex: Math.floor(Math.random() * connectedPairs.length),
                    t: Math.random(),
                    speed: 0.005 + Math.random() * 0.008
                });
            }
        }

        // 4. Sparkling Code Stream Particles
        const streamCount = 450;
        const streamGeo = new THREE.BufferGeometry();
        const streamPositions = new Float32Array(streamCount * 3);
        for (let i = 0; i < streamCount; i++) {
            streamPositions[i * 3] = (Math.random() - 0.5) * 60;
            streamPositions[i * 3 + 1] = (Math.random() - 0.5) * 36;
            streamPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
        streamGeo.setAttribute('position', new THREE.BufferAttribute(streamPositions, 3));
        const streamMat = new THREE.PointsMaterial({
            color: 0x00ffee,
            size: 0.09,
            transparent: true,
            opacity: 0.28,
            depthWrite: false
        });
        const streamPoints = new THREE.Points(streamGeo, streamMat);
        pS.add(streamPoints);

        // 5. Render/Animation Loop
        let pTime = 0;
        function projLoop() {
            requestAnimationFrame(projLoop);
            if (!inView('projects')) return;
            pTime += 0.008;

            // Wave dynamic Grid Floor
            const pAttr = gridGeo.attributes.position;
            for (let i = 0; i < pAttr.count; i++) {
                const x = pAttr.getX(i);
                const y = pAttr.getY(i);
                const z = Math.cos(x * 0.07 + pTime * 1.3) * Math.sin(y * 0.07 + pTime * 1.3) * 1.6;
                pAttr.setZ(i, z);
            }
            pAttr.needsUpdate = true;

            // Rotate concentric gyroscope rings
            rings.forEach(r => {
                r.mesh.rotation.x += r.rx;
                r.mesh.rotation.y += r.ry;
                r.mesh.rotation.z += r.rz;
            });

            // Animate core pulsing
            const pulse = 1.0 + Math.sin(pTime * 2.2) * 0.22;
            coreMesh.scale.set(pulse, pulse, pulse);
            coreMesh.rotation.y += 0.008;
            coreMesh.rotation.x -= 0.004;

            innerCore.scale.set(1.0 + Math.cos(pTime * 2.2) * 0.15, 1.0 + Math.cos(pTime * 2.2) * 0.15, 1.0 + Math.cos(pTime * 2.2) * 0.15);

            // Animate active signal packets along pathways
            packets.forEach(p => {
                p.t += p.speed;
                if (p.t >= 1) {
                    p.t = 0;
                    p.pairIndex = Math.floor(Math.random() * connectedPairs.length);
                }

                const pair = connectedPairs[p.pairIndex];
                if (pair) {
                    const pos = new THREE.Vector3().copy(pair.start).lerp(pair.end, p.t);
                    p.mesh.position.copy(pos);
                    const scale = Math.sin(p.t * Math.PI) * 1.4;
                    p.mesh.scale.set(scale, scale, scale);
                }
            });

            // Rotate ambient streams
            streamPoints.rotation.y += 0.0002;

            // Slow rotate overall reactor group
            reactorGroup.rotation.y += 0.0008;

            // Scroll-driven parallax translation
            const elProj = document.getElementById('projects');
            if (elProj) {
                const rect = elProj.getBoundingClientRect();
                const totalScrollable = elProj.offsetHeight + window.innerHeight;
                const scrollProgress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / totalScrollable));
                reactorGroup.position.y = (scrollProgress - 0.5) * -10;
            }

            // Interactive mouse follow drift
            pCam.position.x += (smoothMouseX3 * 0.06 - pCam.position.x) * 0.03;
            pCam.lookAt(0, 0, 0);

            pR.render(pS, pCam);
        }
        projLoop();
    }

    // ── 8.8. LET'S CONNECT CONTACT SECTION — 3D NEURAL SIGNAL WEB ──
    const contactCv = document.getElementById('contactCanvas');
    if (contactCv) {
        const cR = new THREE.WebGLRenderer({ canvas: contactCv, alpha: true, antialias: true });
        cR.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const cS = new THREE.Scene();
        const cCam = new THREE.PerspectiveCamera(50, 1, 0.1, 300);
        cCam.position.z = 24;

        function resizeContact() {
            const el = document.getElementById('contact');
            if (!el) return;
            const w = el.offsetWidth, h = el.offsetHeight;
            cR.setSize(w, h);
            cCam.aspect = w / Math.max(h, 1);
            cCam.updateProjectionMatrix();
        }
        resizeContact();
        window.addEventListener('resize', resizeContact);

        // 1. Digital Grid Floor (Holographic Fabric)
        const gridGeo = new THREE.PlaneGeometry(90, 90, 20, 20);
        const gridMat = new THREE.MeshBasicMaterial({
            color: 0x00ffee,
            wireframe: true,
            transparent: true,
            opacity: 0.03
        });
        const gridMesh = new THREE.Mesh(gridGeo, gridMat);
        gridMesh.rotation.x = -Math.PI / 2.3;
        gridMesh.position.y = -9;
        gridMesh.position.z = -8;
        cS.add(gridMesh);

        // 2. Cosmic Constellation Network Group (Static, ultra-performance)
        const constGroup = new THREE.Group();
        cS.add(constGroup);

        const nodeCount = 40;
        const nodes = [];
        const colors = [0x00ffee, 0x7b2fff, 0xff3cac, 0x39ff14];

        for (let i = 0; i < nodeCount; i++) {
            // Generate nodes in a beautiful spherical cloud
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 5.5 + Math.random() * 5.0;

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.cos(phi);
            const z = r * Math.sin(phi) * Math.sin(theta);

            const col = colors[i % colors.length];

            // Core dot
            const dot = new THREE.Mesh(
                new THREE.SphereGeometry(0.12, 8, 8),
                new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.65 })
            );
            dot.position.set(x, y, z);
            constGroup.add(dot);

            // Subtle glow halo
            const halo = new THREE.Mesh(
                new THREE.SphereGeometry(0.24, 8, 8),
                new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.18 })
            );
            dot.add(halo);

            nodes.push({
                x: x, y: y, z: z,
                posVec: new THREE.Vector3(x, y, z)
            });
        }

        // Connect nodes and find valid connected pairs
        const connectedPairs = [];
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const a = nodes[i];
                const b = nodes[j];
                const dist = a.posVec.distanceTo(b.posVec);

                if (dist < 6.8) {
                    const lineGeo = new THREE.BufferGeometry().setFromPoints([a.posVec, b.posVec]);
                    const lineMat = new THREE.LineBasicMaterial({
                        color: 0x00ffee,
                        transparent: true,
                        opacity: 0.08 * (1.0 - dist / 6.8)
                    });
                    constGroup.add(new THREE.Line(lineGeo, lineMat));

                    connectedPairs.push({ start: a.posVec, end: b.posVec });
                }
            }
        }

        // 3. Active Laser Signal Pulse Packets traveling along network lines!
        const packets = [];
        const packetGeo = new THREE.SphereGeometry(0.14, 6, 6);
        const packetCount = 12;

        if (connectedPairs.length > 0) {
            for (let i = 0; i < packetCount; i++) {
                const col = colors[i % colors.length];
                const pMesh = new THREE.Mesh(packetGeo, new THREE.MeshBasicMaterial({
                    color: col,
                    transparent: true,
                    opacity: 0.95
                }));
                constGroup.add(pMesh);

                packets.push({
                    mesh: pMesh,
                    pairIndex: Math.floor(Math.random() * connectedPairs.length),
                    t: Math.random(), // Random starting position along path
                    speed: 0.005 + Math.random() * 0.008
                });
            }
        }

        // 4. Satellite Orbit Rings (Communication Hub)
        const ring1 = new THREE.Mesh(
            new THREE.TorusGeometry(15, 0.03, 8, 100),
            new THREE.MeshBasicMaterial({ color: 0x7b2fff, transparent: true, opacity: 0.07 })
        );
        const ring2 = new THREE.Mesh(
            new THREE.TorusGeometry(19, 0.03, 8, 100),
            new THREE.MeshBasicMaterial({ color: 0xff3cac, transparent: true, opacity: 0.04 })
        );
        const ring3 = new THREE.Mesh(
            new THREE.TorusGeometry(23, 0.03, 8, 100),
            new THREE.MeshBasicMaterial({ color: 0x39ff14, transparent: true, opacity: 0.02 })
        );
        ring1.rotation.x = Math.PI / 4;
        ring2.rotation.y = Math.PI / 3;
        ring3.rotation.z = Math.PI / 6;
        cS.add(ring1, ring2, ring3);

        // 5. Ambient Twinkling Stars
        const starCount = 400;
        const starGeo = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            starPositions[i * 3] = (Math.random() - 0.5) * 50;
            starPositions[i * 3 + 1] = (Math.random() - 0.5) * 30;
            starPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        const starMat = new THREE.PointsMaterial({
            color: 0x00ffee,
            size: 0.08,
            transparent: true,
            opacity: 0.25,
            depthWrite: false
        });
        const starPoints = new THREE.Points(starGeo, starMat);
        cS.add(starPoints);

        // 6. Animation Loop
        let cTime = 0;
        function contactLoop() {
            requestAnimationFrame(contactLoop);
            if (!inView('contact')) return;
            cTime += 0.008;

            // Wave dynamic Grid Floor
            const pAttr = gridGeo.attributes.position;
            for (let i = 0; i < pAttr.count; i++) {
                const x = pAttr.getX(i);
                const y = pAttr.getY(i);
                const z = Math.sin(x * 0.07 + cTime * 1.4) * Math.cos(y * 0.07 + cTime * 1.4) * 1.5;
                pAttr.setZ(i, z);
            }
            pAttr.needsUpdate = true;

            // Update active signal packets
            packets.forEach(p => {
                p.t += p.speed;
                if (p.t >= 1) {
                    p.t = 0;
                    p.pairIndex = Math.floor(Math.random() * connectedPairs.length);
                }

                const pair = connectedPairs[p.pairIndex];
                if (pair) {
                    // Linearly interpolate positions
                    const pos = new THREE.Vector3().copy(pair.start).lerp(pair.end, p.t);
                    p.mesh.position.copy(pos);

                    // Pulse scale (fade in/out at edges)
                    const scale = Math.sin(p.t * Math.PI) * 1.4;
                    p.mesh.scale.set(scale, scale, scale);
                }
            });

            // Rotate satellite rings
            ring1.rotation.z += 0.0005;
            ring1.rotation.y += 0.0002;
            ring2.rotation.z -= 0.0004;
            ring2.rotation.x += 0.0002;
            ring3.rotation.y += 0.0003;

            // Rotate dust points
            starPoints.rotation.y += 0.00018;

            // Slow rotate overall constellation group
            constGroup.rotation.y += 0.001;
            constGroup.rotation.x += 0.0003;

            // Scroll-driven parallax translation
            const elContact = document.getElementById('contact');
            if (elContact) {
                const rect = elContact.getBoundingClientRect();
                const totalScrollable = elContact.offsetHeight + window.innerHeight;
                const scrollProgress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / totalScrollable));
                constGroup.position.y = (scrollProgress - 0.5) * -8;
            }

            // Interactive mouse follow drift
            cCam.position.x += (smoothMouseX3 * 0.06 - cCam.position.x) * 0.03;
            cCam.lookAt(0, 0, 0);

            cR.render(cS, cCam);
        }
        contactLoop();
    }

    // ── 9. 3D CLOUD ARCHITECTURE & TELEMETRY RAYCASTER ───────
    const s3El = document.getElementById('scene3d');
    const s3Cv = document.getElementById('s3C');
    const s3R = new THREE.WebGLRenderer({ canvas: s3Cv, alpha: true, antialias: true });
    s3R.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    function resizeS3() {
        if (s3El) {
            s3R.setSize(s3El.offsetWidth, s3El.offsetHeight);
            s3Cam.aspect = s3El.offsetWidth / Math.max(s3El.offsetHeight, 1);
            s3Cam.updateProjectionMatrix();
        }
    }

    const s3S = new THREE.Scene();
    const s3Cam = new THREE.PerspectiveCamera(55, 2, 0.1, 1000);
    s3Cam.position.set(0, 4, 16);
    s3Cam.lookAt(0, 0, 0);

    const architectureNodes = [
        { n: 'USER', p: [0, 4, 0], c: 0x00ffee, s: 0.55 },
        { n: 'CDN', p: [-4, 2, 0], c: 0x7b2fff, s: 0.48 },
        { n: 'ALB', p: [4, 2, 0], c: 0x7b2fff, s: 0.48 },
        { n: 'EC2', p: [-5, 0, -1], c: 0xff3cac, s: 0.42 },
        { n: 'ECS', p: [0, 0, -1], c: 0xff3cac, s: 0.42 },
        { n: 'LAMBDA', p: [5, 0, -1], c: 0xff3cac, s: 0.42 },
        { n: 'RDS', p: [-5, -2, 0], c: 0x39ff14, s: 0.4 },
        { n: 'S3', p: [0, -2, 0], c: 0x39ff14, s: 0.4 },
        { n: 'DYNAMO', p: [5, -2, 0], c: 0x39ff14, s: 0.4 },
        { n: 'MONITOR', p: [0, 2, 3], c: 0xffaa00, s: 0.38 },
    ];
    
    const architectureEdges = [
        [0, 1], [0, 2], [1, 3], [2, 5], [1, 4], [2, 4],
        [3, 6], [4, 7], [5, 8], [0, 9], [1, 9], [2, 9]
    ];

    const cloudNodeMeshes = [];
    architectureNodes.forEach(nd => {
        const g = new THREE.IcosahedronGeometry(nd.s, 1);
        const m = new THREE.Mesh(g, new THREE.MeshPhongMaterial({ color: nd.c, wireframe: true, transparent: true, opacity: 0.7 }));
        m.position.set(...nd.p);
        m.userData = {
            bp: [...nd.p],
            ph: Math.random() * Math.PI * 2,
            sp: 0.5 + Math.random() * 0.5,
            nodeName: nd.n
        };
        cloudNodeMeshes.push(m);
        s3S.add(m);
        
        // Ambient outer shell node glow
        const glowMesh = new THREE.Mesh(new THREE.SphereGeometry(nd.s * 1.5, 12, 12), new THREE.MeshBasicMaterial({ color: nd.c, transparent: true, opacity: 0.05 }));
        glowMesh.position.set(...nd.p);
        s3S.add(glowMesh);
    });

    // Draw connecting pipelines
    architectureEdges.forEach(([a, b]) => {
        const pts = [new THREE.Vector3(...architectureNodes[a].p), new THREE.Vector3(...architectureNodes[b].p)];
        const g = new THREE.BufferGeometry().setFromPoints(pts);
        s3S.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0x00ffee, transparent: true, opacity: 0.2 })));
    });

    // Animate streaming visual packet spheres
    const dataPackets = [];
    architectureEdges.slice(0, 6).forEach(([a, b]) => {
        const pm = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), new THREE.MeshBasicMaterial({ color: 0x00ffee }));
        pm.userData = { a, b, t: Math.random() };
        dataPackets.push(pm);
        s3S.add(pm);
    });

    s3S.add(new THREE.AmbientLight(0x001133, 0.6));
    [[0x00ffee, 6, 4, 6], [0x7b2fff, -6, 4, -2], [0xff3cac, 0, -4, 4]].forEach(([c, x, y, z]) => {
        const light = new THREE.PointLight(c, 0.7, 20);
        light.position.set(x, y, z);
        s3S.add(light);
    });

    // Mouse interactive rotations & scroll zoom
    let s3Drag = false, s3PX = 0, s3PY = 0, s3TRX = 0, s3TRY = 0, s3RX = 0, s3RY = 0;
    
    s3Cv.addEventListener('mousedown', e => {
        s3Drag = true;
        s3PX = e.clientX;
        s3PY = e.clientY;
        s3Cv.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', e => {
        if (!s3Drag) return;
        s3TRY += (e.clientX - s3PX) * 0.005;
        s3TRX += (e.clientY - s3PY) * 0.005;
        s3PX = e.clientX;
        s3PY = e.clientY;
    });
    
    document.addEventListener('mouseup', () => {
        s3Drag = false;
        s3Cv.style.cursor = 'grab';
    });
    s3Cv.style.cursor = 'grab';
    
    s3Cv.addEventListener('wheel', e => {
        e.preventDefault();
        s3Cam.position.z = Math.max(6, Math.min(26, s3Cam.position.z + e.deltaY * 0.025));
    }, { passive: false });

    // Interactive Node Selection Raycaster
    const raycaster = new THREE.Raycaster();
    const s3Mouse = new THREE.Vector2(-9999, -9999);

    s3Cv.addEventListener('mousemove', e => {
        const rect = s3Cv.getBoundingClientRect();
        s3Mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        s3Mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    });

    s3Cv.addEventListener('mouseleave', () => {
        s3Mouse.set(-9999, -9999); // Reset position off-screen
    });

    let s3Time = 0;
    function s3Loop() {
        requestAnimationFrame(s3Loop);
        if (!inView('scene3d')) return;
        s3Time += 0.01;
        
        s3RX += (s3TRX - s3RX) * 0.08;
        s3RY += (s3TRY - s3RY) * 0.08;
        
        s3S.rotation.x = s3RX;
        s3S.rotation.y = s3RY + s3Time * 0.04;

        // Perform raycast nodes hover validation
        raycaster.setFromCamera(s3Mouse, s3Cam);
        const intersections = raycaster.intersectObjects(cloudNodeMeshes);

        if (intersections.length > 0) {
            const hitNode = intersections[0].object;
            
            // Apply scale feedback pulse on hovered node
            cloudNodeMeshes.forEach(m => {
                if (m === hitNode) {
                    m.scale.set(1.25, 1.25, 1.25);
                } else {
                    m.scale.set(1.0, 1.0, 1.0);
                }
            });

            // Write telemetry stream to bottom left HUD
            if (hBL) {
                hBL.classList.add('hud-hovered');
                hBL.textContent = `SYS.TELEMETRY: LIVE\nHOVER.NODE: ${hitNode.userData.nodeName}\nVECTOR.X: ${hitNode.position.x.toFixed(1)} | Y: ${hitNode.position.y.toFixed(1)}\nNODE.STATUS: ACTIVE`;
            }
        } else {
            // Restore initial nodes dimensions
            cloudNodeMeshes.forEach(m => m.scale.set(1.0, 1.0, 1.0));
            if (hBL) {
                hBL.classList.remove('hud-hovered');
            }
        }

        cloudNodeMeshes.forEach(m => {
            m.rotation.x += 0.01;
            m.rotation.y += 0.015;
            const bp = m.userData.bp;
            m.position.y = bp[1] + Math.sin(s3Time * m.userData.sp + m.userData.ph) * 0.15;
        });

        // Floating packets pipeline animations
        dataPackets.forEach(pk => {
            pk.userData.t = (pk.userData.t + 0.006) % 1;
            const a = architectureNodes[pk.userData.a].p;
            const b = architectureNodes[pk.userData.b].p;
            const t = pk.userData.t;
            pk.position.x = a[0] + (b[0] - a[0]) * t;
            pk.position.y = a[1] + (b[1] - a[1]) * t;
            pk.position.z = a[2] + (b[2] - a[2]) * t;
        });

        s3R.render(s3S, s3Cam);
    }

    s3Loop();
    resizeS3();
    window.addEventListener('resize', resizeS3);

    // ── 10. SCROLL REVEALS (FADE & DEEP SLIDES) ──────────────────
    const revealElements = document.querySelectorAll('.rv');
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach((e, i) => {
            if (e.isIntersecting) {
                setTimeout(() => {
                    e.target.classList.add('show');
                }, i * 80);
                revealObserver.unobserve(e.target);
            }
        });
    }, { threshold: 0.08 });
    revealElements.forEach(el => revealObserver.observe(el));

    // ── 10.5. TIMELINE SCROLL-DRIVEN 3D FLIP ──────────────────
    const tlItems = document.querySelectorAll('.tl-flip');
    const animateTimelineOnScroll = () => {
        const vh = window.innerHeight;
        tlItems.forEach((item, index) => {
            const rect = item.getBoundingClientRect();
            
            // start rotating when it enters the viewport bottom (rect.top = vh)
            // finish rotating when it crosses vh * 0.48 (around middle-screen)
            const startY = vh;
            const endY = vh * 0.48;
            
            // Calculate raw progress from 0 (offscreen bottom) to 1 (near middle screen)
            const progress = Math.max(0, Math.min(1, (vh - rect.top) / (startY - endY)));
            
            // Determine direction based on index (odd = -1, even = 1)
            const isEven = (index + 1) % 2 === 0;
            const direction = isEven ? 1 : -1;
            
            // Map progress to angle (85deg to 0deg) and scale (0.85 to 1.0)
            const angle = 85 * (1 - progress) * direction;
            const scale = 0.85 + 0.15 * progress;
            
            item.style.transform = `perspective(1200px) rotateY(${angle}deg) scale(${scale})`;
            item.style.opacity = progress;

            // Trigger the .show class so that the inner card elements (.tlBx.gc) fade in!
            if (progress > 0.01) {
                item.classList.add('show');
            } else {
                item.classList.remove('show');
            }
        });
    };
    
    // Immediate initial run to position cards on load
    animateTimelineOnScroll();

    // ── 11. TRIGGER FILLING SKILL BARS ───────────────────────
    const skillsSection = document.querySelectorAll('.skC');
    const skillsObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.querySelectorAll('.skFill').forEach(bar => {
                    bar.style.width = bar.dataset.w + '%';
                });
                skillsObserver.unobserve(e.target);
            }
        });
    }, { threshold: 0.3 });
    skillsSection.forEach(c => skillsObserver.observe(c));

    // ── 12. ADVANCED HOLOGRAPHIC 3D CARD TILT ─────────────────
    document.querySelectorAll('.pCard, .tlBx.gc, .track-card, .tb, .cert-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            
            // Calculate hover coordinate ratios
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            
            card.style.setProperty('--mx', x * 100 + '%');
            card.style.setProperty('--my', y * 100 + '%');
            
            // Apply 3D perspective matrix rotate transforms
            card.style.transform = `perspective(600px) rotateY(${(x - 0.5) * 16}deg) rotateX(${-(y - 0.5) * 10}deg) translateY(-8px) scale(1.02)`;
            card.style.boxShadow = `${(x - 0.5) * -20}px ${(y - 0.5) * -15}px 50px rgba(0, 255, 238, 0.08)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
        });
    });

    // ── 13. PARALLAX DESKTOP OFFSET CONTROLLERS ───────────────
    window.addEventListener('scroll', () => {
        const sy = window.scrollY;
        const heroName = document.querySelector('.hName');
        if (heroName) {
            heroName.style.transform = `translateY(${sy * 0.15}px)`;
        }
        
        const hTL = document.getElementById('hTL');
        const hTR = document.getElementById('hTR');
        if (hTL) hTL.style.opacity = Math.max(0, 1 - sy * 0.003);
        if (hTR) hTR.style.opacity = Math.max(0, 1 - sy * 0.003);

        // Trigger active 3D flip card rotations on scroll
        animateTimelineOnScroll();
    });

    // ── 14. CONTACT FORM & DYNAMIC TOAST ALERT ───────────────
    const contactForm = document.getElementById('contact-form');
    const toast = document.getElementById('form-toast');
    const toastMsg = document.getElementById('toast-message');

    if (contactForm && toast) {
        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            
            const nameInput = document.getElementById('contact-name');
            const emailInput = document.getElementById('contact-email');
            const messageInput = document.getElementById('contact-message');
            const submitBtn = document.getElementById('contact-submit-btn');

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const message = messageInput.value.trim();

            // Client Validation Check
            if (!name || !email || !message) {
                showToastAlert('Please fill in all contact parameters.', 0xff3cac);
                return;
            }

            if (!validateEmail(email)) {
                showToastAlert('Please specify a valid email address.', 0xff3cac);
                return;
            }

            // Disable button, simulate submission loading state
            submitBtn.disabled = true;
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = `
                <span>Transmitting...</span>
            `;

            setTimeout(() => {
                // Show dynamic toast
                showToastAlert('Message transmitted securely to Satya!', 0x39ff14);
                
                // Clear fields
                nameInput.value = '';
                emailInput.value = '';
                messageInput.value = '';
                
                // Restore button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }, 1500);
        });
    }

    function validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    function showToastAlert(message, borderHex) {
        if (!toast || !toastMsg) return;
        
        toastMsg.textContent = message;
        
        // Dynamically style the border based on success/error status
        const colorStr = borderHex === 0x39ff14 ? 'var(--c4)' : 'var(--c3)';
        toast.style.borderColor = colorStr;
        toast.style.boxShadow = `0 10px 40px ${colorStr}22`;
        
        toast.classList.add('show');
        
        // Automatically hide toast alert after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    // ── 8.8. FOOTER SECTION — 3D CYBER FLOWING NEON TERRAIN ─────────────────
    const footerCv = document.getElementById('footerCanvas');
    if (footerCv) {
        const fR = new THREE.WebGLRenderer({ canvas: footerCv, alpha: true, antialias: true });
        fR.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const fS = new THREE.Scene();
        const fCam = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
        fCam.position.set(0, 6, 16);
        fCam.lookAt(0, 1, 0);

        const footerGroup = new THREE.Group();
        fS.add(footerGroup);

        function resizeFooter() {
            const footerEl = footerCv.parentElement;
            if (!footerEl) return;
            const w = footerEl.offsetWidth;
            const h = footerEl.offsetHeight;
            fR.setSize(w, h);
            fCam.aspect = w / Math.max(h, 1);
            fCam.updateProjectionMatrix();
        }
        resizeFooter();
        window.addEventListener('resize', resizeFooter);

        // 1. Flowing Cyber-Terrain Grid
        const gridW = 32, gridH = 32;
        const gridGeo = new THREE.PlaneGeometry(40, 40, gridW - 1, gridH - 1);
        
        // Custom neon cyan and purple vertex coloring for visual excellence
        const colorsArr = [];
        const posAttr = gridGeo.attributes.position;
        const color1 = new THREE.Color(0x00ffee); // cyan
        const color2 = new THREE.Color(0x7b2fff); // purple
        
        for (let i = 0; i < posAttr.count; i++) {
            // Gradient along the X axis
            const x = posAttr.getX(i);
            const t = (x + 20) / 40; // 0 to 1
            const mixedColor = new THREE.Color().copy(color1).lerp(color2, t);
            colorsArr.push(mixedColor.r, mixedColor.g, mixedColor.b);
        }
        
        gridGeo.setAttribute('color', new THREE.Float32BufferAttribute(colorsArr, 3));

        const gridMat = new THREE.MeshBasicMaterial({
            vertexColors: true,
            wireframe: true,
            transparent: true,
            opacity: 0.12
        });

        const terrainMesh = new THREE.Mesh(gridGeo, gridMat);
        terrainMesh.rotation.x = -Math.PI / 2;
        terrainMesh.position.y = -1;
        footerGroup.add(terrainMesh);

        // 2. Slow-drifting neon digital bubbles floating upwards
        const bubbleCount = 40;
        const bubbleGeo = new THREE.SphereGeometry(0.12, 6, 6);
        const bubbles = [];

        for (let i = 0; i < bubbleCount; i++) {
            const isCyan = Math.random() > 0.5;
            const bMat = new THREE.MeshBasicMaterial({
                color: isCyan ? 0x00ffee : 0xff3cac,
                transparent: true,
                opacity: 0.2 + Math.random() * 0.4
            });
            const bMesh = new THREE.Mesh(bubbleGeo, bMat);
            
            // Random distribution over the grid area
            bMesh.position.set(
                (Math.random() - 0.5) * 30,
                Math.random() * 8 - 1,
                (Math.random() - 0.5) * 25
            );
            
            footerGroup.add(bMesh);
            bubbles.push({
                mesh: bMesh,
                speedY: 0.01 + Math.random() * 0.02,
                amplitudeX: 0.05 + Math.random() * 0.1,
                freqX: 1.0 + Math.random() * 2.0,
                phaseX: Math.random() * Math.PI * 2,
                startX: bMesh.position.x
            });
        }

        // Viewport Occlusion Culler for Footer
        function isFooterInView() {
            const rect = footerCv.getBoundingClientRect();
            return rect.bottom >= 0 && rect.top <= window.innerHeight;
        }

        // Animation Loop
        let fTime = 0;
        function footerLoop() {
            requestAnimationFrame(footerLoop);
            if (!isFooterInView()) return;
            fTime += 0.012;

            // Animate Grid vertices like flowing liquid neon waves
            const pAttr = gridGeo.attributes.position;
            for (let i = 0; i < pAttr.count; i++) {
                const vx = pAttr.getX(i);
                const vy = pAttr.getY(i);
                
                // Superimposed multi-octave sine wave math for high-fidelity fluidity
                const wavez = Math.sin(vx * 0.15 + fTime * 1.2) * Math.cos(vy * 0.15 + fTime * 1.2) * 1.5
                            + Math.sin(vx * 0.35 - fTime * 0.8) * 0.4;
                
                pAttr.setZ(i, wavez);
            }
            pAttr.needsUpdate = true;

            // Animate bubbles floating upwards and swaying like server telemetry packets
            bubbles.forEach(b => {
                b.mesh.position.y += b.speedY;
                b.mesh.position.x = b.startX + Math.sin(fTime * b.freqX + b.phaseX) * b.amplitudeX;

                // Reset when floating too high
                if (b.mesh.position.y > 7) {
                    b.mesh.position.y = -1;
                    b.mesh.position.x = (Math.random() - 0.5) * 30;
                    b.startX = b.mesh.position.x;
                    b.mesh.material.opacity = 0.2 + Math.random() * 0.4;
                }
            });

            // Very slow drift on the overall group
            footerGroup.rotation.y = Math.sin(fTime * 0.1) * 0.08;

            // Responsive camera mouse interaction
            fCam.position.x += (smoothMouseX3 * 0.03 - fCam.position.x) * 0.02;
            fCam.lookAt(0, 1.2, 0);

            fR.render(fS, fCam);
        }
        footerLoop();
    }
});
