 // --- Filter Logic ---
        const filterBtns = document.querySelectorAll('.filter-btn');
        const products = document.querySelectorAll('.product-card');

        // Initial animation
        products.forEach((product, index) => {
            product.style.animationDelay = `${index * 0.1}s`;
            product.classList.add('fade-in-up');
        });

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                products.forEach(product => {
                    // Reset animation
                    product.classList.remove('fade-in-up');
                    
                    if (filterValue === 'all' || product.getAttribute('data-category') === filterValue) {
                        product.style.display = 'flex';
                        // Trigger reflow to restart animation
                        void product.offsetWidth;
                        product.classList.add('fade-in-up');
                    } else {
                        product.style.display = 'none';
                    }
                });
            });
        });


        // --- Canvas VFX Logic ---
        const canvas = document.getElementById('vfx-canvas');
        const ctx = canvas.getContext('2d');

        let width, height;
        let fireworks = [];
        let particles = [];
        let ambientParticles = [];

        // Festive Colors: Gold, Orange, Red, Purple, Cyan, Pink
        const colors = ['#FFD700', '#FF4500', '#FF8C00', '#FF0055', '#00FFFF', '#e879f9'];

        function resizeCanvas() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        function random(min, max) {
            return Math.random() * (max - min) + min;
        }

        // Ambient Floating Particles
        class AmbientParticle {
            constructor() {
                this.x = random(0, width);
                this.y = random(0, height);
                this.size = random(1, 2.5);
                this.speedX = random(-0.3, 0.3);
                this.speedY = random(-0.8, -0.2);
                this.color = colors[Math.floor(random(0, 3))]; // Mostly warm colors
                this.alpha = random(0.1, 0.5);
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.y < 0) this.y = height;
                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.shadowBlur = 8;
                ctx.shadowColor = this.color;
                ctx.fill();
                ctx.restore();
            }
        }

        for (let i = 0; i < 60; i++) {
            ambientParticles.push(new AmbientParticle());
        }

        // Fireworks
        class Firework {
            constructor() {
                this.x = random(width * 0.1, width * 0.9);
                this.y = height;
                this.targetY = random(height * 0.1, height * 0.5);
                this.speed = random(6, 10);
                this.angle = -Math.PI / 2 + random(-0.2, 0.2);
                this.vx = Math.cos(this.angle) * this.speed;
                this.vy = Math.sin(this.angle) * this.speed;
                this.color = colors[Math.floor(random(0, colors.length))];
                this.trail = [];
                this.exploded = false;
            }

            update() {
                this.trail.push({x: this.x, y: this.y});
                if (this.trail.length > 8) this.trail.shift();

                this.x += this.vx;
                this.y += this.vy;
                this.vy += 0.04; // Gravity

                if (this.vy >= 0 || this.y <= this.targetY) {
                    this.exploded = true;
                    this.explode();
                }
            }

            draw() {
                ctx.beginPath();
                if (this.trail.length > 0) {
                    ctx.moveTo(this.trail[0].x, this.trail[0].y);
                    for (let i = 1; i < this.trail.length; i++) {
                        ctx.lineTo(this.trail[i].x, this.trail[i].y);
                    }
                }
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            explode() {
                const numParticles = Math.floor(random(70, 150));
                for (let i = 0; i < numParticles; i++) {
                    particles.push(new Particle(this.x, this.y, this.color));
                }
            }
        }

        // Explosion Particles
        class Particle {
            constructor(x, y, baseColor) {
                this.x = x;
                this.y = y;
                // Add slight chance of secondary color
                this.color = Math.random() > 0.8 ? colors[Math.floor(random(0, colors.length))] : baseColor; 
                
                const angle = random(0, Math.PI * 2);
                const speed = random(1, 12);
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
                
                this.alpha = 1;
                this.decay = random(0.015, 0.035);
                this.gravity = 0.1;
                this.friction = 0.94;
            }

            update() {
                this.vx *= this.friction;
                this.vy *= this.friction;
                this.vy += this.gravity;
                this.x += this.vx;
                this.y += this.vy;
                this.alpha -= this.decay;
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, random(1, 3.5), 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.shadowBlur = 12;
                ctx.shadowColor = this.color;
                ctx.fill();
                ctx.restore();
            }
        }

        // Animation Loop
        function animateLoop() {
            // Fading trail effect
            ctx.fillStyle = 'rgba(11, 11, 26, 0.25)'; 
            ctx.fillRect(0, 0, width, height);

            ambientParticles.forEach(p => {
                p.update();
                p.draw();
            });

            // Launch rate
            if (Math.random() < 0.05 && fireworks.length < 6) {
                fireworks.push(new Firework());
            }

            for (let i = fireworks.length - 1; i >= 0; i--) {
                fireworks[i].update();
                if (fireworks[i].exploded) {
                    fireworks.splice(i, 1);
                } else {
                    fireworks[i].draw();
                }
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].update();
                if (particles[i].alpha <= 0) {
                    particles.splice(i, 1);
                } else {
                    particles[i].draw();
                }
            }

            requestAnimationFrame(animateLoop);
        }

        window.onload = function() {
            animateLoop();
        };

        let cart = [];
        const cartBtn = document.getElementById('cart-btn');
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        const closeCartBtn = document.getElementById('close-cart');
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalEl = document.getElementById('cart-total');
        const cartCountEl = document.getElementById('cart-count');

        function openCart() {
            cartSidebar.classList.remove('translate-x-full');
            cartOverlay.classList.remove('hidden');
        }

        function closeCart() {
            cartSidebar.classList.add('translate-x-full');
            cartOverlay.classList.add('hidden');
        }

        cartBtn.addEventListener('click', openCart);
        closeCartBtn.addEventListener('click', closeCart);
        cartOverlay.addEventListener('click', closeCart);

        // Bind add to cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent parent click event if any
                
                const id = btn.dataset.id;
                const name = btn.dataset.name;
                const price = parseFloat(btn.dataset.price);
                const img = btn.dataset.img;

                const existingItem = cart.find(item => item.id === id);
                if(existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({ id, name, price, img, quantity: 1 });
                }
                
                // Visual feedback on button
                const originalText = btn.innerText;
                btn.innerText = 'Added!';
                btn.classList.add('bg-green-600/50', 'border-green-500');
                
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.classList.remove('bg-green-600/50', 'border-green-500');
                }, 1000);

                updateCartUI();
                openCart();
            });
        });

        function updateCartUI() {
            cartItemsContainer.innerHTML = '';
            let total = 0;
            let count = 0;

            cart.forEach((item, index) => {
                total += item.price * item.quantity;
                count += item.quantity;

                const itemEl = document.createElement('div');
                itemEl.className = 'flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10';
                itemEl.innerHTML = `
                    <div class="flex items-center gap-3">
                        <img src="${item.img}" class="w-12 h-12 object-cover rounded-md border border-white/20">
                        <div>
                            <p class="text-sm font-bold text-yellow-400 truncate w-[160px]" title="${item.name}">${item.name}</p>
                            <p class="text-xs text-gray-400">₹${item.price.toLocaleString('en-IN')} x ${item.quantity}</p>
                        </div>
                    </div>
                    <button onclick="removeFromCart(${index})" class="text-red-400 hover:text-red-300 p-2 bg-red-900/20 rounded-full transition-colors flex-shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                `;
                cartItemsContainer.appendChild(itemEl);
            });

            cartTotalEl.innerText = `₹${total.toLocaleString('en-IN')}`;
            cartCountEl.innerText = count;
            
            if(count === 0) {
                cartCountEl.style.display = 'none';
                cartItemsContainer.innerHTML = '<p class="text-gray-400 text-center mt-4 italic">Your festive cart is empty.</p>';
            } else {
                cartCountEl.style.display = 'flex';
            }
        }
        
        window.removeFromCart = function(index) {
            cart.splice(index, 1);
            updateCartUI();
        }