document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       1. GLOBAL CONTROLS & HEADER
       ========================================== */
    const header = document.getElementById('header');
    const navLinks = document.querySelectorAll('nav a');
    
    // Transparent glass header transitions on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Active Nav Link Highlight based on scroll position
        let currentSection = '';
        const sections = document.querySelectorAll('section, div.stats-strip');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 200)) {
                currentSection = section.getAttribute('id') || '';
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === currentSection) {
                link.classList.add('active');
            }
        });
    });

    // Mobile Navigation Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    mobileToggle.addEventListener('click', () => {
        if (navMenu.style.display === 'block') {
            navMenu.style.display = 'none';
        } else {
            navMenu.style.display = 'block';
            navMenu.style.background = 'rgba(5, 8, 12, 0.95)';
            navMenu.style.position = 'absolute';
            navMenu.style.top = '70px';
            navMenu.style.left = '0';
            navMenu.style.width = '100%';
            navMenu.style.padding = '2rem';
            navMenu.style.borderBottom = '1px solid var(--border-color)';
            
            const ul = navMenu.querySelector('ul');
            ul.style.flexDirection = 'column';
            ul.style.gap = '1.5rem';
            ul.style.alignItems = 'center';
        }
    });

    /* ==========================================
       2. HERO CLOUD INFRASTRUCTURE CANVAS
       ========================================== */
    const canvas = document.getElementById('node-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;
        
        const particles = [];
        const maxParticles = 35;
        const connectionDistance = 110;
        
        // Handle Resize
        window.addEventListener('resize', () => {
            if (canvas.offsetWidth && canvas.offsetHeight) {
                width = canvas.width = canvas.offsetWidth;
                height = canvas.height = canvas.offsetHeight;
            }
        });
        
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.6;
                this.vy = (Math.random() - 0.5) * 0.6;
                this.radius = Math.random() * 3 + 2;
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                // Boundaries
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }
            
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(14, 165, 233, 0.7)';
                ctx.fill();
            }
        }
        
        // Instantiate
        for (let i = 0; i < maxParticles; i++) {
            particles.push(new Particle());
        }
        
        // Central node coordinate finder
        const centralNode = document.getElementById('hero-interactive-node');
        
        function drawConnections() {
            // Get interactive central node position relative to canvas
            const canvasRect = canvas.getBoundingClientRect();
            const nodeRect = centralNode.getBoundingClientRect();
            
            const centerX = (nodeRect.left + nodeRect.width / 2) - canvasRect.left;
            const centerY = (nodeRect.top + nodeRect.height / 2) - canvasRect.top;
            
            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                
                // Connection to central cloud node
                const distToCenter = Math.hypot(p1.x - centerX, p1.y - centerY);
                if (distToCenter < connectionDistance * 1.5) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(centerX, centerY);
                    const alpha = (1 - distToCenter / (connectionDistance * 1.5)) * 0.15;
                    ctx.strokeStyle = `rgba(255, 153, 0, ${alpha})`;
                    ctx.lineWidth = 1.2;
                    ctx.stroke();
                }
                
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const distance = Math.hypot(p1.x - p2.x, p1.y - p2.y);
                    
                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        const alpha = (1 - distance / connectionDistance) * 0.25;
                        ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }
        }
        
        function animateCanvas() {
            ctx.clearRect(0, 0, width, height);
            
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            
            drawConnections();
            requestAnimationFrame(animateCanvas);
        }
        
        animateCanvas();
    }

    /* ==========================================
       3. INTERACTIVE SHELL TERMINAL
       ========================================== */
    const termInput = document.getElementById('term-input');
    const termHistory = document.getElementById('terminal-history');
    const termBody = document.getElementById('term-body');
    const termCursor = document.getElementById('term-cursor');
    let cmdHistoryArray = [];
    let cmdHistoryIndex = -1;

    if (termInput) {
        // Auto-focus terminal on click anywhere in terminal body
        termBody.addEventListener('click', () => {
            termInput.focus();
        });

        // Update custom cursor position to align with input text length
        const updateCursor = () => {
            const charWidth = 8.5; // Estimated monospaced character size
            const valLen = termInput.value.length;
            termCursor.style.left = (valLen * charWidth) + 'px';
        };
        
        termInput.addEventListener('input', updateCursor);
        
        // Command handling keypresses
        termInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const rawCommand = termInput.value.trim();
                const command = rawCommand.toLowerCase();
                
                if (rawCommand) {
                    cmdHistoryArray.push(rawCommand);
                    cmdHistoryIndex = cmdHistoryArray.length;
                }
                
                // Add the line to history
                appendHistoryLine(`satya@cloud-shell:~$ ${rawCommand}`);
                
                // Process output
                processCommand(command);
                
                // Reset input
                termInput.value = '';
                updateCursor();
                termBody.scrollTop = termBody.scrollHeight;
            } 
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (cmdHistoryIndex > 0) {
                    cmdHistoryIndex--;
                    termInput.value = cmdHistoryArray[cmdHistoryIndex];
                    updateCursor();
                }
            } 
            else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (cmdHistoryIndex < cmdHistoryArray.length - 1) {
                    cmdHistoryIndex++;
                    termInput.value = cmdHistoryArray[cmdHistoryIndex];
                } else {
                    cmdHistoryIndex = cmdHistoryArray.length;
                    termInput.value = '';
                }
                updateCursor();
            }
        });

        function appendHistoryLine(content, isHtml = false) {
            const div = document.createElement('div');
            div.className = 'terminal-log-line';
            if (isHtml) {
                div.innerHTML = content;
            } else {
                div.textContent = content;
            }
            termHistory.appendChild(div);
        }

        function processCommand(cmd) {
            const parts = cmd.split(' ');
            const primary = parts[0];

            switch(primary) {
                case '':
                    break;
                case 'help':
                    appendHistoryLine(`
Available commands:
  <span class="term-cyan">about</span>          - Print brief profile & details
  <span class="term-cyan">skills</span>         - View technical systems stack
  <span class="term-cyan">certifications</span> - Display certificates & progress
  <span class="term-cyan">pipeline</span>       - Trigger DevOps integration runner
  <span class="term-cyan">contact</span>        - Show professional social endpoints
  <span class="term-cyan">clear</span>          - Flush shell history
`, true);
                    break;
                case 'about':
                    appendHistoryLine(`
<span class="term-purple">name:</span> Satyanarayana Sidda
<span class="term-purple">role:</span> Cloud & DevOps Engineer (Aspiring)
<span class="term-purple">university:</span> Lovely Professional University (B.Tech CSE)
<span class="term-purple">graduation:</span> 2028
<span class="term-purple">location:</span> Hyderabad / Bangalore, India
<span class="term-purple">focus_areas:</span>
  - Cloud Infrastructure & Scalability
  - Infrastructure as Code (IaC)
  - Continuous Delivery & Monitoring
  - Platform Development & Integrations
`, true);
                    break;
                case 'skills':
                    appendHistoryLine(`
<span class="term-aws">Cloud & Infrastructure:</span>
  - AWS & Microsoft Azure Services
<span class="term-cyan">DevOps & Automation:</span>
  - Docker, Kubernetes, Terraform, GitHub Actions, Ansible, Jenkins, Linux
<span class="term-purple">Development Stack:</span>
  - Java, Python, JavaScript, C++, Bash
<span class="term-green">Data & Monitoring:</span>
  - PostgreSQL, Supabase, MySQL, Redis, Prometheus, Grafana
`, true);
                    break;
                case 'certifications':
                case 'certs':
                    appendHistoryLine(`
[Certifications & Academic Tracks]
  - <span class="term-purple">Salesforce Trailhead</span>   - Ranger status (85% completed)
  - <span class="term-aws">AWS Architect</span>         - Study Track (70% completed)
  - <span class="term-green">LeetCode Grind</span>        - 150+ problem solving (90% completed)
  - <span class="term-cyan">B.Tech CSE @ LPU</span>      - B.Tech degree pathway (Grad: 2028)
`, true);
                    break;
                case 'pipeline':
                case 'deploy':
                    appendHistoryLine('<span class="term-green">[RUNNER] DevOps deployment pipeline triggered... Scroll to CI/CD pipeline below to observe sequence.</span>', true);
                    triggerPipeline();
                    break;
                case 'contact':
                    appendHistoryLine(`
Social Contact Points:
  - <span class="term-cyan">GitHub</span>   : https://github.com/Satyanarayana-Sidda
  - <span class="term-cyan">LinkedIn</span> : https://www.linkedin.com/in/satyanarayana-sidda
  - <span class="term-cyan">Email</span>    : satyanarayana@example.com
`, true);
                    break;
                case 'clear':
                    termHistory.innerHTML = '';
                    break;
                default:
                    appendHistoryLine(`shell: command not found: <span class="term-cyan">${primary}</span>. Type <span class="term-purple">help</span> for all instructions.`, true);
            }
        }
    }

    /* ==========================================
       4. INTERACTIVE DEVOPS CI/CD PIPELINE
       ========================================== */
    const runPipelineBtn = document.getElementById('run-pipeline-btn');
    const pipelineStatus = document.getElementById('pipeline-status');
    const pipelineStatusText = document.getElementById('pipeline-status-text');
    const consoleOutput = document.getElementById('console-output');
    const trackBar = document.getElementById('pipeline-track');
    
    let isPipelineRunning = false;

    if (runPipelineBtn) {
        runPipelineBtn.addEventListener('click', triggerPipeline);
    }

    function triggerPipeline() {
        if (isPipelineRunning) return;
        
        isPipelineRunning = true;
        runPipelineBtn.disabled = true;
        
        // Reset states
        const stepNodes = document.querySelectorAll('.pipeline-step-node');
        stepNodes.forEach(node => {
            node.classList.remove('active', 'success', 'failed');
        });
        
        trackBar.style.width = '0%';
        consoleOutput.innerHTML = '';
        
        // Set Status to Active
        pipelineStatus.className = 'pipeline-status-badge active';
        pipelineStatusText.textContent = 'Active';
        
        // Pipeline Stage Data & Logs
        const stages = [
            {
                element: document.getElementById('step-0'),
                percentage: '10%',
                logs: [
                    '[STAGE 0 - SOURCE CONTROL]',
                    'Initializing connection to Git repository...',
                    'Fetching updates from main branch...',
                    'Event webhook captured: commit [feat: main-infra-deployment]',
                    'Author: Satyanarayana Sidda <satya@lpu.edu>',
                    'Source code validation: PASSED.'
                ],
                delay: 2000
            },
            {
                element: document.getElementById('step-1'),
                percentage: '35%',
                logs: [
                    '[STAGE 1 - QUALITY ASSURANCE]',
                    'Bootstrapping local testing environment...',
                    'Executing code linters and syntax validators...',
                    'Running automated unit tests...',
                    'Executing sanity test suite... OK',
                    'Code Quality Gate: 100% tests successful. Coverage at 94.2%.'
                ],
                delay: 2500
            },
            {
                element: document.getElementById('step-2'),
                percentage: '60%',
                logs: [
                    '[STAGE 2 - BUILD CONTAINER]',
                    'Executing: docker build -t app-service:latest .',
                    'Step 1/6 : FROM node:20-alpine',
                    ' ---> alpine base image cached.',
                    'Step 2/6 : WORKDIR /usr/src/app',
                    'Step 3/6 : COPY package*.json ./',
                    ' ---> Installing dependencies...',
                    'Step 4/6 : COPY . .',
                    'Step 5/6 : EXPOSE 8080',
                    'Step 6/6 : CMD ["node", "server.js"]',
                    'Exporting build container layer logs...',
                    'Docker Container Image compiled successfully (142.5 MB).'
                ],
                delay: 3000
            },
            {
                element: document.getElementById('step-3'),
                percentage: '85%',
                logs: [
                    '[STAGE 3 - PROVISION CLOUD RESOURCES]',
                    'Initializing infrastructure provisioning engine...',
                    'Evaluating Terraform configuration variables...',
                    'Applying secure cloud architecture rules...',
                    'Deployment targeted to: AWS & Azure (Multi-Cloud)',
                    'Provisioning AWS virtual server nodes... OK',
                    'Provisioning Azure resource groups... OK',
                    'Deploying load balancing resources... AWS (OK) | Azure (OK)',
                    'Syncing replication stores... OK',
                    'Deployment completed on AWS & Azure securely.'
                ],
                delay: 3500
            },
            {
                element: document.getElementById('step-4'),
                percentage: '100%',
                logs: [
                    '[STAGE 4 - SECURITY & HEALTH ASSURANCE]',
                    'Executing automated deployment health audit...',
                    'Request: GET https://cloud-gateway.satya.io/health',
                    'Response Status: 200 OK (Connection time: 42ms)',
                    'Running system threat analysis... Clean.',
                    'Production audit complete.',
                    '[SYSTEM] Deployment process finished successfully! App is active on AWS & Azure.'
                ],
                delay: 2000
            }
        ];

        // Execute stages sequentially
        let currentStageIdx = 0;
        
        function runStage(idx) {
            if (idx >= stages.length) {
                // Pipeline complete
                isPipelineRunning = false;
                runPipelineBtn.disabled = false;
                pipelineStatus.className = 'pipeline-status-badge success';
                pipelineStatusText.textContent = 'Success';
                return;
            }
            
            const stage = stages[idx];
            
            // Mark current node active
            stage.element.classList.add('active');
            trackBar.style.width = stage.percentage;
            
            // Output log files inside terminal console sequentially
            let logLineIdx = 0;
            function writeLogs() {
                if (logLineIdx >= stage.logs.length) {
                    // Stage finished successfully
                    stage.element.classList.remove('active');
                    stage.element.classList.add('success');
                    
                    // Proceed to next stage
                    setTimeout(() => {
                        runStage(idx + 1);
                    }, 500);
                    return;
                }
                
                const logLine = stage.logs[logLineIdx];
                const lineDiv = document.createElement('div');
                
                // Colorize logs based on type
                if (logLine.startsWith('[STAGE') || logLine.startsWith('[SYSTEM]')) {
                    lineDiv.className = 'term-purple';
                } else if (logLine.includes('PASSED') || logLine.includes('OK') || logLine.includes('successful') || logLine.includes('Clean')) {
                    lineDiv.className = 'term-green';
                } else if (logLine.includes('AWS') || logLine.includes('aws')) {
                    lineDiv.className = 'term-aws';
                } else {
                    lineDiv.className = 'terminal-log-line';
                }
                
                lineDiv.textContent = logLine;
                consoleOutput.appendChild(lineDiv);
                consoleOutput.scrollTop = consoleOutput.scrollHeight;
                
                logLineIdx++;
                
                // Dynamic fast typing effect inside console output
                setTimeout(writeLogs, Math.random() * 150 + 100);
            }
            
            writeLogs();
        }
        
        runStage(0);
    }

    /* ==========================================
       5. CONTACT FORM & DYNAMIC NOTIFICATIONS
       ========================================== */
    const contactForm = document.getElementById('contact-form');
    const toast = document.getElementById('form-toast');

    if (contactForm && toast) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('contact-name');
            const emailInput = document.getElementById('contact-email');
            const msgInput = document.getElementById('contact-message');
            const submitBtn = document.getElementById('contact-submit-btn');
            
            // Form Validation
            if (!nameInput.value.trim() || !emailInput.value.trim() || !msgInput.value.trim()) {
                alert('Please fill out all fields in the contact form.');
                return;
            }
            
            // Disable button, simulate submission loading state
            submitBtn.disabled = true;
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = `
                <span>Transmitting...</span>
                <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: pulse-quick 1s infinite alternate;">
                    <circle cx="12" cy="12" r="10" stroke-dasharray="15 5"></circle>
                </svg>
            `;
            
            setTimeout(() => {
                // Show dynamic toast
                toast.classList.add('show');
                
                // Clear fields
                nameInput.value = '';
                emailInput.value = '';
                msgInput.value = '';
                
                // Restore button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
                
                // Auto hide toast after 4s
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 4000);
                
            }, 1500);
        });
    }
});
