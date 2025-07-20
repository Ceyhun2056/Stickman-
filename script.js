/**
 * Stickman Battle Arena - Advanced Fighting Game
 * Features: Smooth animations, special powers, particle effects, sound effects
 */

// ================================
// PARTICLE SYSTEM
// ================================
class Particle {
    constructor(x, y, vx, vy, color, life, size = 3) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = size;
        this.gravity = 0.1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.life--;
        this.vx *= 0.99;
        return this.life > 0;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// ================================
// AUDIO MANAGER
// ================================
class AudioManager {
    constructor() {
        this.sounds = {};
        this.muted = false;
        this.createSounds();
    }

    createSounds() {
        // Create audio contexts for sound effects (placeholder implementation)
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Sound effect placeholders
        this.sounds = {
            punch: this.createTone(200, 0.1),
            special: this.createTone(400, 0.3),
            jump: this.createTone(300, 0.1),
            hit: this.createTone(150, 0.2),
            gameOver: this.createTone(100, 0.5)
        };
    }

    createTone(frequency, duration) {
        return () => {
            if (this.muted) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }

    play(soundName) {
        if (this.sounds[soundName] && !this.muted) {
            this.sounds[soundName]();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }
}

// ================================
// SPECIAL POWERS
// ================================
class SpecialPower {
    constructor(name, energyCost, cooldown, effect) {
        this.name = name;
        this.energyCost = energyCost;
        this.cooldown = cooldown;
        this.currentCooldown = 0;
        this.effect = effect;
    }

    canUse(player) {
        return player.energy >= this.energyCost && this.currentCooldown <= 0;
    }

    use(caster, target, game) {
        if (this.canUse(caster)) {
            caster.energy -= this.energyCost;
            this.currentCooldown = this.cooldown;
            this.effect(caster, target, game);
            return true;
        }
        return false;
    }

    update() {
        if (this.currentCooldown > 0) {
            this.currentCooldown--;
        }
    }
}

// ================================
// STICKMAN FIGHTER CLASS
// ================================
class StickmanFighter {
    constructor(x, y, color, controls, facingDirection = 1) {
        // Position and physics
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 70;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 6;
        this.jumpPower = 18;
        this.onGround = true;

        // Combat stats
        this.health = 100;
        this.maxHealth = 100;
        this.energy = 100;
        this.maxEnergy = 100;
        this.energyRegenRate = 0.5;

        // Visual properties
        this.color = color;
        this.facing = facingDirection;
        this.controls = controls;

        // Combat state
        this.attacking = false;
        this.attackCooldown = 0;
        this.attackDuration = 0;
        this.hasHit = false;
        this.knockbackX = 0;
        this.knockbackY = 0;

        // NEW: Advanced combat mechanics
        this.blocking = false;
        this.parryWindow = 0;
        this.dashCooldown = 0;
        this.dashDuration = 0;
        this.isDashing = false;
        this.invulnerable = false;
        this.invulnerabilityFrames = 0;

        // NEW: Combo system
        this.combo = 0;
        this.comboTimer = 0;
        this.maxCombo = 0;
        this.lastAttackTime = 0;
        this.comboSequence = [];

        // NEW: Weapon system
        this.weapon = null;
        this.weaponPickupRadius = 30;

        // Animation state
        this.animationFrame = 0;
        this.animationSpeed = 0.2;
        this.state = 'idle'; // idle, running, jumping, attacking, special, blocking, dashing

        // Special abilities
        this.specialPowers = this.createSpecialPowers();
        this.specialEffects = [];

        // NEW: Visual effects
        this.hitFlash = 0;
        this.trailParticles = [];

        // NEW: Smoother movement and animation
        this.smoothX = x;
        this.smoothY = y;
        this.targetX = x;
        this.targetY = y;
        this.smoothVelocityX = 0;
        this.smoothVelocityY = 0;
        this.animationTimer = 0;
        this.bodyBob = 0;
        this.armSwing = 0;
        this.legStep = 0;
        this.breathingOffset = 0;
        
        // Enhanced visual properties
        this.headSize = 16;
        this.eyeBlinkTimer = 0;
        this.eyeBlinking = false;
        this.eyeBlinkDuration = 0;
        this.mouthExpression = 'neutral'; // neutral, smile, frown, open
        this.facingSmooth = facingDirection;
    }

    createSpecialPowers() {
        if (this.color === '#FF4444') {
            // Player 1: Fireball
            return {
                fireball: new SpecialPower('Fireball', 40, 120, (caster, target, game) => {
                    game.audioManager.play('special');
                    this.createFireball(caster, game);
                })
            };
        } else {
            // Player 2: Teleport Slash
            return {
                teleportSlash: new SpecialPower('Teleport Slash', 50, 150, (caster, target, game) => {
                    game.audioManager.play('special');
                    this.performTeleportSlash(caster, target, game);
                })
            };
        }
    }

    createFireball(caster, game) {
        const fireball = {
            x: caster.x + caster.width / 2,
            y: caster.y - caster.height / 2,
            vx: caster.facing * 8,
            vy: 0,
            size: 15,
            life: 120,
            maxLife: 120,
            damage: 25,
            owner: caster
        };

        game.projectiles.push(fireball);
        this.state = 'special';
        this.attackDuration = 30;

        // Add fire particles
        for (let i = 0; i < 10; i++) {
            game.particles.push(new Particle(
                fireball.x + (Math.random() - 0.5) * 20,
                fireball.y + (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                `hsl(${Math.random() * 60}, 100%, 50%)`,
                30 + Math.random() * 20,
                2 + Math.random() * 3
            ));
        }
    }

    performTeleportSlash(caster, target, game) {
        // Teleport behind target
        const targetX = target.x + (target.facing === 1 ? -50 : 50);
        caster.x = Math.max(0, Math.min(game.canvas.width - caster.width, targetX));
        caster.facing = target.facing === 1 ? 1 : -1;

        // Perform powerful attack
        const distance = Math.abs(caster.x - target.x);
        if (distance < 80) {
            target.health -= 30;
            target.knockbackX = caster.facing * 15;
            target.knockbackY = -8;
            game.audioManager.play('hit');
            game.addScreenShake(15);

            // Add slash particles
            for (let i = 0; i < 15; i++) {
                game.particles.push(new Particle(
                    target.x + target.width / 2 + (Math.random() - 0.5) * 40,
                    target.y - target.height / 2 + (Math.random() - 0.5) * 40,
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 8,
                    '#00FFFF',
                    25 + Math.random() * 15,
                    3 + Math.random() * 2
                ));
            }
        }

        this.state = 'special';
        this.attackDuration = 20;
    }

    update(keys, groundY) {
        // Handle dash movement
        if (this.isDashing && this.dashDuration > 0) {
            this.dashDuration -= 16; // Assuming ~60fps (16ms per frame)
            this.velocityX = this.facing * 15; // Dash speed
            this.invulnerable = true;
            this.invulnerabilityFrames = Math.max(this.invulnerabilityFrames, 10);
            
            // Create dash trail effect
            this.createTrailParticle();
            
            if (this.dashDuration <= 0) {
                this.isDashing = false;
                this.velocityX *= 0.3; // Reduce speed after dash
            }
        }

        // Handle input
        this.handleInput(keys);

        // Update special power cooldowns
        Object.values(this.specialPowers).forEach(power => power.update());

        // Apply physics
        this.updatePhysics(groundY);

        // Update combat state
        this.updateCombat();

        // Update animation
        this.updateAnimation();

        // Regenerate energy
        if (this.energy < this.maxEnergy && !this.attacking && !this.blocking) {
            this.energy += this.energyRegenRate;
            if (this.energy > this.maxEnergy) this.energy = this.maxEnergy;
        }

        // Update combo timer
        if (this.comboTimer > 0) {
            this.comboTimer -= 16;
            if (this.comboTimer <= 0) {
                this.combo = 0;
                this.comboSequence = [];
            }
        }

        // Update invulnerability frames
        if (this.invulnerabilityFrames > 0) {
            this.invulnerabilityFrames--;
            if (this.invulnerabilityFrames <= 0) {
                this.invulnerable = false;
            }
        }

        // Update hit flash
        if (this.hitFlash > 0) {
            this.hitFlash -= 0.1;
        }

        // Update dash cooldown
        if (this.dashCooldown > 0) {
            this.dashCooldown -= 16;
        }

        // Update parry window
        if (this.parryWindow > 0) {
            this.parryWindow -= 16;
        }

        // Update trail particles
        this.updateTrailParticles();
        
        // NEW: Update smooth movement and advanced animations
        this.updateSmoothMovement();
        this.updateAdvancedAnimations();
    }

    // NEW: Smooth movement interpolation
    updateSmoothMovement() {
        // Smooth position interpolation
        const lerpFactor = 0.15;
        this.smoothX += (this.x - this.smoothX) * lerpFactor;
        this.smoothY += (this.y - this.smoothY) * lerpFactor;
        
        // Smooth velocity interpolation
        this.smoothVelocityX += (this.velocityX - this.smoothVelocityX) * 0.2;
        this.smoothVelocityY += (this.velocityY - this.smoothVelocityY) * 0.2;
        
        // Smooth facing direction
        this.facingSmooth += (this.facing - this.facingSmooth) * 0.1;
    }

    // NEW: Advanced animation system
    updateAdvancedAnimations() {
        this.animationTimer += 0.016; // ~60fps
        
        // Body bobbing for breathing effect when idle
        if (this.state === 'idle') {
            this.bodyBob = Math.sin(this.animationTimer * 2) * 1.5;
            this.breathingOffset = Math.sin(this.animationTimer * 1.5) * 0.5;
        }
        
        // Enhanced running animation
        if (this.state === 'running') {
            const runSpeed = Math.abs(this.smoothVelocityX) * 0.3 + 3;
            this.armSwing = Math.sin(this.animationTimer * runSpeed) * 25;
            this.legStep = Math.sin(this.animationTimer * runSpeed) * 20;
            this.bodyBob = Math.sin(this.animationTimer * runSpeed * 2) * 2;
        }
        
        // Eye blinking system
        this.eyeBlinkTimer += 16;
        if (this.eyeBlinkTimer > 3000 + Math.random() * 2000) { // Blink every 3-5 seconds
            this.eyeBlinking = true;
            this.eyeBlinkDuration = 150; // 150ms blink
            this.eyeBlinkTimer = 0;
        }
        
        if (this.eyeBlinking) {
            this.eyeBlinkDuration -= 16;
            if (this.eyeBlinkDuration <= 0) {
                this.eyeBlinking = false;
            }
        }
        
        // Dynamic mouth expressions
        if (this.state === 'attacking' || this.state === 'special') {
            this.mouthExpression = 'open';
        } else if (this.health < 30) {
            this.mouthExpression = 'frown';
        } else if (this.combo > 2) {
            this.mouthExpression = 'smile';
        } else {
            this.mouthExpression = 'neutral';
        }
    }

    handleInput(keys) {
        // Blocking
        this.blocking = keys[this.controls.block] && this.onGround && !this.attacking;
        
        // Parrying (precise timing block)
        if (keys[this.controls.block] && !this.wasBlocking && this.onGround) {
            this.parryWindow = 200; // 200ms parry window
        }
        this.wasBlocking = keys[this.controls.block];

        // Dashing
        if (keys[this.controls.dash] && this.dashCooldown <= 0 && !this.isDashing && this.energy >= 20) {
            this.isDashing = true;
            this.dashDuration = 300; // 300ms dash
            this.dashCooldown = 1000; // 1 second cooldown
            this.energy -= 20;
            this.state = 'dashing';
        }

        // Movement (disabled during dash and attack)
        let moving = false;
        const moveAcceleration = 1.2; // Smoother acceleration
        const maxMoveSpeed = this.speed;
        
        if (!this.isDashing && !this.attacking) {
            if (keys[this.controls.left]) {
                // Gradual acceleration instead of instant speed
                this.velocityX -= moveAcceleration;
                if (this.velocityX < -maxMoveSpeed) this.velocityX = -maxMoveSpeed;
                this.facing = -1;
                moving = true;
            }
            if (keys[this.controls.right]) {
                // Gradual acceleration instead of instant speed
                this.velocityX += moveAcceleration;
                if (this.velocityX > maxMoveSpeed) this.velocityX = maxMoveSpeed;
                this.facing = 1;
                moving = true;
            }
        }

        // Update state based on movement
        if (this.blocking) {
            this.state = 'blocking';
        } else if (this.isDashing) {
            this.state = 'dashing';
        } else if (moving && this.onGround && this.state !== 'attacking' && this.state !== 'special') {
            this.state = 'running';
        } else if (!moving && this.onGround && this.state !== 'attacking' && this.state !== 'special') {
            this.state = 'idle';
        }

        // Jumping (disabled during block and dash)
        if (keys[this.controls.jump] && this.onGround && !this.blocking && !this.isDashing) {
            this.velocityY = -this.jumpPower;
            this.onGround = false;
            this.state = 'jumping';
        }

        // Combo attacks
        if (keys[this.controls.attack] && this.attackCooldown === 0 && this.state !== 'special' && !this.blocking) {
            this.performComboAttack();
        }

        // Special attacks
        if (keys[this.controls.special]) {
            const power = Object.values(this.specialPowers)[0];
            if (power && power.canUse(this)) {
                this.trySpecialAttack = true;
            }
        }
    }

    updatePhysics(groundY) {
        // Enhanced gravity with variable strength
        if (!this.onGround) {
            this.velocityY += 0.8;
        }

        // Apply knockback with smoother decay
        this.velocityX += this.knockbackX;
        this.velocityY += this.knockbackY;
        this.knockbackX *= 0.85; // Smoother knockback decay
        this.knockbackY *= 0.85;

        // Update position with sub-pixel precision
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Enhanced movement with momentum and friction
        if (this.onGround) {
            // Ground friction with easing - different for different states
            if (this.state === 'idle' || this.state === 'blocking') {
                this.velocityX *= 0.78; // Faster stopping when idle/blocking
            } else {
                this.velocityX *= 0.85; // Normal friction
            }
        } else {
            // Air resistance
            this.velocityX *= 0.95;
        }

        // Smoother velocity clamping
        const maxSpeed = this.isDashing ? 20 : 12;
        if (Math.abs(this.velocityX) > maxSpeed) {
            this.velocityX = Math.sign(this.velocityX) * maxSpeed;
        }

        // Enhanced ground collision with bounce dampening
        if (this.y >= groundY) {
            this.y = groundY;
            if (this.velocityY > 0) {
                this.velocityY = 0;
            }
            this.onGround = true;
            if (this.state === 'jumping') {
                this.state = 'idle';
            }
        } else {
            this.onGround = false;
        }

        // Enhanced boundary collision with bouncing
        if (this.x < 0) {
            this.x = 0;
            this.velocityX = Math.abs(this.velocityX) * 0.3; // Bounce back
        }
        if (this.x > 1000 - this.width) {
            this.x = 1000 - this.width;
            this.velocityX = -Math.abs(this.velocityX) * 0.3; // Bounce back
        }
    }

    updateCombat() {
        // Update attack timers
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }

        if (this.attacking) {
            this.attackDuration--;
            if (this.attackDuration <= 0) {
                this.attacking = false;
                if (this.state === 'attacking') {
                    this.state = 'idle';
                }
            }
        }

        if (this.state === 'special' && this.attackDuration > 0) {
            this.attackDuration--;
            if (this.attackDuration <= 0) {
                this.state = 'idle';
            }
        }
    }

    updateAnimation() {
        this.animationFrame += this.animationSpeed;
        if (this.animationFrame >= 4) {
            this.animationFrame = 0;
        }
    }

    // NEW: Combo attack system
    performComboAttack() {
        const currentTime = Date.now();
        const timeSinceLastAttack = currentTime - this.lastAttackTime;
        
        // Reset combo if too much time has passed
        if (timeSinceLastAttack > 800) {
            this.combo = 0;
            this.comboSequence = [];
        }
        
        this.combo++;
        this.comboTimer = 1500; // 1.5 seconds to continue combo
        this.lastAttackTime = currentTime;
        
        // Track max combo
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }
        
        // Determine attack type based on combo count
        let attackType = 'light';
        let damage = 15;
        let duration = 20;
        let cooldown = 30;
        
        if (this.combo >= 3) {
            attackType = 'heavy';
            damage = 25;
            duration = 30;
            cooldown = 50;
        } else if (this.combo >= 5) {
            attackType = 'finisher';
            damage = 35;
            duration = 40;
            cooldown = 60;
            // Add special effects for finisher
            this.createFinisherEffect();
        }
        
        this.comboSequence.push(attackType);
        this.attacking = true;
        this.attackDuration = duration;
        this.attackCooldown = cooldown;
        this.hasHit = false;
        this.state = 'attacking';
        this.currentAttackDamage = damage;
    }
    
    // NEW: Create trail particles for dash
    createTrailParticle() {
        this.trailParticles.push({
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            life: 20,
            maxLife: 20,
            color: this.color
        });
    }
    
    // NEW: Update trail particles
    updateTrailParticles() {
        this.trailParticles = this.trailParticles.filter(particle => {
            particle.life--;
            return particle.life > 0;
        });
    }
    
    // NEW: Create finisher effect
    createFinisherEffect() {
        for (let i = 0; i < 10; i++) {
            this.specialEffects.push({
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 30,
                maxLife: 30,
                color: '#FFD700',
                type: 'finisher'
            });
        }
    }
    
    // NEW: Check for weapon pickup
    checkWeaponPickup(weapons) {
        weapons.forEach((weapon, index) => {
            const dx = weapon.x - (this.x + this.width / 2);
            const dy = weapon.y - (this.y + this.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.weaponPickupRadius) {
                this.weapon = weapon;
                weapons.splice(index, 1);
            }
        });
    }

    draw(ctx) {
        // Classic stickman drawing
        const centerX = this.x + this.width / 2;
        const headY = this.y - this.height + 12;
        const neckY = headY + 18;
        const shoulderY = neckY + 8;
        const bodyEndY = this.y - 28;
        const armY = shoulderY + 5;
        const legStartY = bodyEndY;

        // Main color
        const mainColor = this.color;
        ctx.shadowColor = mainColor;
        ctx.shadowBlur = 8;
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Head
        ctx.beginPath();
        ctx.arc(centerX, headY, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = mainColor;
        ctx.globalAlpha = 0.15;
        ctx.beginPath();
        ctx.arc(centerX, headY, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Neck
        ctx.shadowBlur = 6;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, headY + 14);
        ctx.lineTo(centerX, neckY);
        ctx.stroke();

        // Eyes
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.ellipse(centerX - 5, headY - 2, 3, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(centerX + 5, headY - 2, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(centerX - 5 + this.facing * 1.5, headY - 1, 2, 0, Math.PI * 2);
        ctx.arc(centerX + 5 + this.facing * 1.5, headY - 1, 2, 0, Math.PI * 2);
        ctx.fill();

        // Mouth
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (this.state === 'attacking' || this.state === 'special') {
            ctx.arc(centerX, headY + 4, 3, 0, Math.PI);
        } else if (this.health < 30) {
            ctx.moveTo(centerX - 3, headY + 5);
            ctx.lineTo(centerX + 3, headY + 5);
        } else {
            ctx.moveTo(centerX - 2, headY + 4);
            ctx.lineTo(centerX + 2, headY + 4);
        }
        ctx.stroke();

        // Body
        ctx.shadowBlur = 6;
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(centerX, neckY);
        ctx.lineTo(centerX, bodyEndY);
        ctx.stroke();

        // Shoulder line
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX - 18, shoulderY);
        ctx.lineTo(centerX + 18, shoulderY);
        ctx.stroke();

        // Arms
        ctx.lineWidth = 4;
        ctx.shadowBlur = 4;
        if (this.state === 'attacking' || this.state === 'special') {
            // Attack pose
            const attackIntensity = Math.sin(this.animationFrame * 4) * 3;
            const punchArm = this.facing === 1 ? 'right' : 'left';
            if (punchArm === 'right') {
                ctx.beginPath();
                ctx.moveTo(centerX + 18, shoulderY);
                ctx.lineTo(centerX + 25 + attackIntensity, armY + 5);
                ctx.lineTo(centerX + (this.facing * 40) + attackIntensity, armY - 10);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(centerX - 18, shoulderY);
                ctx.lineTo(centerX - 20, armY + 8);
                ctx.lineTo(centerX - 15, armY + 20);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.moveTo(centerX - 18, shoulderY);
                ctx.lineTo(centerX - 25 - attackIntensity, armY + 5);
                ctx.lineTo(centerX + (this.facing * 40) - attackIntensity, armY - 10);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(centerX + 18, shoulderY);
                ctx.lineTo(centerX + 20, armY + 8);
                ctx.lineTo(centerX + 15, armY + 20);
                ctx.stroke();
            }
        } else if (this.state === 'running') {
            // Running animation
            const armSwing = Math.sin(this.animationFrame * 3) * 20;
            const armSwing2 = Math.sin(this.animationFrame * 3 + Math.PI) * 20;
            ctx.beginPath();
            ctx.moveTo(centerX - 18, shoulderY);
            ctx.lineTo(centerX - 15 + armSwing * 0.5, armY + 8);
            ctx.lineTo(centerX - 12 + armSwing, armY + 25);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(centerX + 18, shoulderY);
            ctx.lineTo(centerX + 15 + armSwing2 * 0.5, armY + 8);
            ctx.lineTo(centerX + 12 + armSwing2, armY + 25);
            ctx.stroke();
        } else if (this.state === 'jumping') {
            // Jumping pose
            ctx.beginPath();
            ctx.moveTo(centerX - 18, shoulderY);
            ctx.lineTo(centerX - 25, armY - 10);
            ctx.lineTo(centerX - 20, armY - 20);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(centerX + 18, shoulderY);
            ctx.lineTo(centerX + 25, armY - 10);
            ctx.lineTo(centerX + 20, armY - 20);
            ctx.stroke();
        } else {
            // Idle arms
            const idleSway = Math.sin(this.animationFrame * 0.5) * 2;
            ctx.beginPath();
            ctx.moveTo(centerX - 18, shoulderY);
            ctx.lineTo(centerX - 20 + idleSway, armY + 8);
            ctx.lineTo(centerX - 18 + idleSway, armY + 22);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(centerX + 18, shoulderY);
            ctx.lineTo(centerX + 20 - idleSway, armY + 8);
            ctx.lineTo(centerX + 18 - idleSway, armY + 22);
            ctx.stroke();
        }

        // Legs
        ctx.lineWidth = 5;
        const hipY = bodyEndY + 5;
        if (this.state === 'running') {
            const legSwing = Math.sin(this.animationFrame * 3) * 15;
            const legSwing2 = Math.sin(this.animationFrame * 3 + Math.PI) * 15;
            ctx.beginPath();
            ctx.moveTo(centerX - 8, hipY);
            ctx.lineTo(centerX - 12 + legSwing * 0.7, hipY + 20);
            ctx.lineTo(centerX - 15 + legSwing, this.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(centerX + 8, hipY);
            ctx.lineTo(centerX + 12 + legSwing2 * 0.7, hipY + 20);
            ctx.lineTo(centerX + 15 + legSwing2, this.y);
            ctx.stroke();
        } else if (this.state === 'jumping') {
            ctx.beginPath();
            ctx.moveTo(centerX - 8, hipY);
            ctx.lineTo(centerX - 18, hipY + 15);
            ctx.lineTo(centerX - 25, this.y - 8);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(centerX + 8, hipY);
            ctx.lineTo(centerX + 18, hipY + 15);
            ctx.lineTo(centerX + 25, this.y - 8);
            ctx.stroke();
        } else if (this.state === 'attacking' || this.state === 'special') {
            ctx.beginPath();
            ctx.moveTo(centerX - 8, hipY);
            ctx.lineTo(centerX - 15, hipY + 20);
            ctx.lineTo(centerX - 20, this.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(centerX + 8, hipY);
            ctx.lineTo(centerX + 12, hipY + 20);
            ctx.lineTo(centerX + 18, this.y);
            ctx.stroke();
        } else {
            const legSway = Math.sin(this.animationFrame * 0.3) * 1;
            ctx.beginPath();
            ctx.moveTo(centerX - 8, hipY);
            ctx.lineTo(centerX - 12 + legSway, hipY + 20);
            ctx.lineTo(centerX - 15 + legSway, this.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(centerX + 8, hipY);
            ctx.lineTo(centerX + 12 - legSway, hipY + 20);
            ctx.lineTo(centerX + 15 - legSway, this.y);
            ctx.stroke();
        }

        // Hands
        ctx.shadowBlur = 0;
        ctx.fillStyle = mainColor;
        if (this.state === 'attacking' || this.state === 'special') {
            ctx.beginPath();
            ctx.arc(centerX + (this.facing * 40) + (this.state === 'attacking' ? Math.sin(this.animationFrame * 4) * 3 : 0), armY - 10, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Feet
        ctx.lineWidth = 3;
        ctx.strokeStyle = mainColor;
        if (this.state === 'running') {
            const legSwing = Math.sin(this.animationFrame * 3) * 15;
            const legSwing2 = Math.sin(this.animationFrame * 3 + Math.PI) * 15;
            ctx.beginPath();
            ctx.moveTo(centerX - 15 + legSwing, this.y);
            ctx.lineTo(centerX - 20 + legSwing, this.y);
            ctx.moveTo(centerX + 15 + legSwing2, this.y);
            ctx.lineTo(centerX + 20 + legSwing2, this.y);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.moveTo(centerX - 15, this.y);
            ctx.lineTo(centerX - 22, this.y);
            ctx.moveTo(centerX + 15, this.y);
            ctx.lineTo(centerX + 22, this.y);
            ctx.stroke();
        }

        // Reset shadow for next draws
        ctx.shadowBlur = 0;

        // Special effects
        if (this.state === 'special') {
            this.drawSpecialEffects(ctx, centerX, armY);
        }

        // Health and energy bars above character
        this.drawStatusBars(ctx, centerX);
    }

    // NEW: Advanced arm drawing with realistic joints and movement
    drawAdvancedArms(ctx, centerX, shoulderY, armY) {
        const shoulderWidth = 22;
        
        if (this.state === 'attacking' || this.state === 'special') {
            // Dynamic attack pose with realistic joint movement
            const attackIntensity = Math.sin(this.animationTimer * 8) * 4;
            const punchArm = this.facing === 1 ? 'right' : 'left';
            
            if (punchArm === 'right') {
                // Punching right arm with elbow joint
                const shoulderX = centerX + shoulderWidth;
                const elbowX = centerX + 28 + attackIntensity;
                const elbowY = armY + 8;
                const fistX = centerX + (this.facing * 45) + attackIntensity;
                const fistY = armY - 8;
                
                ctx.beginPath();
                ctx.moveTo(shoulderX, shoulderY);
                ctx.lineTo(elbowX, elbowY);
                ctx.lineTo(fistX, fistY);
                ctx.stroke();
                
                // Elbow joint
                ctx.fillStyle = ctx.strokeStyle;
                ctx.beginPath();
                ctx.arc(elbowX, elbowY, 3, 0, Math.PI * 2);
                ctx.fill();
                
                // Supporting left arm
                ctx.beginPath();
                ctx.moveTo(centerX - shoulderWidth, shoulderY);
                ctx.lineTo(centerX - 22, armY + 12);
                ctx.lineTo(centerX - 18, armY + 25);
                ctx.stroke();
            } else {
                // Mirror for left punch
                const shoulderX = centerX - shoulderWidth;
                const elbowX = centerX - 28 - attackIntensity;
                const elbowY = armY + 8;
                const fistX = centerX + (this.facing * 45) - attackIntensity;
                const fistY = armY - 8;
                
                ctx.beginPath();
                ctx.moveTo(shoulderX, shoulderY);
                ctx.lineTo(elbowX, elbowY);
                ctx.lineTo(fistX, fistY);
                ctx.stroke();
                
                // Elbow joint
                ctx.fillStyle = ctx.strokeStyle;
                ctx.beginPath();
                ctx.arc(elbowX, elbowY, 3, 0, Math.PI * 2);
                ctx.fill();
                
                // Supporting right arm
                ctx.beginPath();
                ctx.moveTo(centerX + shoulderWidth, shoulderY);
                ctx.lineTo(centerX + 22, armY + 12);
                ctx.lineTo(centerX + 18, armY + 25);
                ctx.stroke();
            }
        } else if (this.state === 'running') {
            // Natural running arm animation with realistic swing
            const leftArmSwing = this.armSwing;
            const rightArmSwing = -this.armSwing;
            
            // Left arm
            const leftShoulderX = centerX - shoulderWidth;
            const leftElbowX = centerX - 18 + leftArmSwing * 0.6;
            const leftElbowY = armY + 10;
            const leftHandX = centerX - 15 + leftArmSwing;
            const leftHandY = armY + 28;
            
            ctx.beginPath();
            ctx.moveTo(leftShoulderX, shoulderY);
            ctx.lineTo(leftElbowX, leftElbowY);
            ctx.lineTo(leftHandX, leftHandY);
            ctx.stroke();
            
            // Right arm
            const rightShoulderX = centerX + shoulderWidth;
            const rightElbowX = centerX + 18 + rightArmSwing * 0.6;
            const rightElbowY = armY + 10;
            const rightHandX = centerX + 15 + rightArmSwing;
            const rightHandY = armY + 28;
            
            ctx.beginPath();
            ctx.moveTo(rightShoulderX, shoulderY);
            ctx.lineTo(rightElbowX, rightElbowY);
            ctx.lineTo(rightHandX, rightHandY);
            ctx.stroke();
            
            // Elbow joints
            ctx.fillStyle = ctx.strokeStyle;
            ctx.beginPath();
            ctx.arc(leftElbowX, leftElbowY, 3, 0, Math.PI * 2);
            ctx.arc(rightElbowX, rightElbowY, 3, 0, Math.PI * 2);
            ctx.fill();
            
        } else if (this.state === 'jumping') {
            // Jumping pose with arms up
            ctx.beginPath();
            ctx.moveTo(centerX - shoulderWidth, shoulderY);
            ctx.lineTo(centerX - 28, armY - 5);
            ctx.lineTo(centerX - 25, armY - 18);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(centerX + shoulderWidth, shoulderY);
            ctx.lineTo(centerX + 28, armY - 5);
            ctx.lineTo(centerX + 25, armY - 18);
            ctx.stroke();
            
        } else if (this.state === 'blocking') {
            // Defensive pose
            const guardX = centerX + this.facing * 20;
            const guardY = armY - 5;
            
            ctx.beginPath();
            ctx.moveTo(centerX + this.facing * shoulderWidth, shoulderY);
            ctx.lineTo(guardX, guardY);
            ctx.lineTo(guardX + this.facing * 8, guardY - 8);
            ctx.stroke();
            
            // Supporting arm
            ctx.beginPath();
            ctx.moveTo(centerX - this.facing * shoulderWidth, shoulderY);
            ctx.lineTo(centerX - this.facing * 18, armY + 15);
            ctx.lineTo(centerX - this.facing * 15, armY + 25);
            ctx.stroke();
            
        } else {
            // Idle arms with subtle breathing movement
            const breathOffset = this.breathingOffset;
            
            ctx.beginPath();
            ctx.moveTo(centerX - shoulderWidth, shoulderY);
            ctx.lineTo(centerX - 20 + breathOffset, armY + 12);
            ctx.lineTo(centerX - 18 + breathOffset, armY + 26);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(centerX + shoulderWidth, shoulderY);
            ctx.lineTo(centerX + 20 - breathOffset, armY + 12);
            ctx.lineTo(centerX + 18 - breathOffset, armY + 26);
            ctx.stroke();
        }
    }

    // NEW: Advanced leg drawing with realistic joints and movement
    drawAdvancedLegs(ctx, centerX, hipY, groundY) {
        const hipWidth = 10;
        
        if (this.state === 'running') {
            // Dynamic running animation with realistic leg movement
            const leftLegStep = this.legStep;
            const rightLegStep = -this.legStep;
            
            // Left leg
            const leftHipX = centerX - hipWidth;
            const leftKneeX = centerX - 12 + leftLegStep * 0.7;
            const leftKneeY = hipY + 22;
            const leftFootX = centerX - 15 + leftLegStep;
            const leftFootY = groundY;
            
            ctx.beginPath();
            ctx.moveTo(leftHipX, hipY);
            ctx.lineTo(leftKneeX, leftKneeY);
            ctx.lineTo(leftFootX, leftFootY);
            ctx.stroke();
            
            // Right leg
            const rightHipX = centerX + hipWidth;
            const rightKneeX = centerX + 12 + rightLegStep * 0.7;
            const rightKneeY = hipY + 22;
            const rightFootX = centerX + 15 + rightLegStep;
            const rightFootY = groundY;
            
            ctx.beginPath();
            ctx.moveTo(rightHipX, hipY);
            ctx.lineTo(rightKneeX, rightKneeY);
            ctx.lineTo(rightFootX, rightFootY);
            ctx.stroke();
            
            // Knee joints
            ctx.fillStyle = ctx.strokeStyle;
            ctx.beginPath();
            ctx.arc(leftKneeX, leftKneeY, 4, 0, Math.PI * 2);
            ctx.arc(rightKneeX, rightKneeY, 4, 0, Math.PI * 2);
            ctx.fill();
            
        } else if (this.state === 'jumping') {
            // Jumping pose with bent legs
            ctx.beginPath();
            ctx.moveTo(centerX - hipWidth, hipY);
            ctx.lineTo(centerX - 20, hipY + 18);
            ctx.lineTo(centerX - 28, groundY - 12);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(centerX + hipWidth, hipY);
            ctx.lineTo(centerX + 20, hipY + 18);
            ctx.lineTo(centerX + 28, groundY - 12);
            ctx.stroke();
            
        } else if (this.state === 'attacking' || this.state === 'special') {
            // Stable attacking stance
            ctx.beginPath();
            ctx.moveTo(centerX - hipWidth, hipY);
            ctx.lineTo(centerX - 16, hipY + 22);
            ctx.lineTo(centerX - 22, groundY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(centerX + hipWidth, hipY);
            ctx.lineTo(centerX + 14, hipY + 22);
            ctx.lineTo(centerX + 20, groundY);
            ctx.stroke();
            
        } else {
            // Normal standing legs with subtle movement
            const legSway = Math.sin(this.animationTimer * 0.8) * 1.5;
            
            ctx.beginPath();
            ctx.moveTo(centerX - hipWidth, hipY);
            ctx.lineTo(centerX - 14 + legSway, hipY + 22);
            ctx.lineTo(centerX - 16 + legSway, groundY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(centerX + hipWidth, hipY);
            ctx.lineTo(centerX + 14 - legSway, hipY + 22);
            ctx.lineTo(centerX + 16 - legSway, groundY);
            ctx.stroke();
        }
    }

    // NEW: Enhanced hand drawing
    drawEnhancedHands(ctx, centerX, armY) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = ctx.strokeStyle;
        
        if (this.state === 'attacking' || this.state === 'special') {
            // Clenched fists with impact effect
            const fistSize = 4;
            const attackPulse = Math.sin(this.animationTimer * 10) * 1;
            const fistX = centerX + (this.facing * 45) + (this.state === 'attacking' ? attackPulse : 0);
            const fistY = armY - 8;
            
            ctx.beginPath();
            ctx.arc(fistX, fistY, fistSize + attackPulse, 0, Math.PI * 2);
            ctx.fill();
            
            // Impact glow
            if (this.state === 'attacking') {
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 8;
                ctx.fillStyle = this.color === '#FF4444' ? '#FFAAAA' : '#AAAAFF';
                ctx.beginPath();
                ctx.arc(fistX, fistY, fistSize + attackPulse + 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        } else if (this.state === 'running') {
            // Open hands for running
            const leftHandX = centerX - 15 + this.armSwing;
            const rightHandX = centerX + 15 - this.armSwing;
            const handY = armY + 28;
            
            ctx.beginPath();
            ctx.arc(leftHandX, handY, 3, 0, Math.PI * 2);
            ctx.arc(rightHandX, handY, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // NEW: Enhanced feet drawing
    drawEnhancedFeet(ctx, centerX, groundY) {
        ctx.lineWidth = 4;
        ctx.strokeStyle = ctx.strokeStyle;
        
        if (this.state === 'running') {
            // Dynamic running feet
            const leftFootX = centerX - 15 + this.legStep;
            const rightFootX = centerX + 15 - this.legStep;
            
            ctx.beginPath();
            ctx.moveTo(leftFootX, groundY);
            ctx.lineTo(leftFootX - 8, groundY);
            ctx.moveTo(rightFootX, groundY);
            ctx.lineTo(rightFootX + 8, groundY);
            ctx.stroke();
            
            // Dust particles when running
            if (Math.abs(this.smoothVelocityX) > 2) {
                for (let i = 0; i < 2; i++) {
                    this.specialEffects.push({
                        x: leftFootX + (Math.random() - 0.5) * 10,
                        y: groundY,
                        vx: (Math.random() - 0.5) * 4,
                        vy: -Math.random() * 3,
                        life: 15,
                        maxLife: 15,
                        color: '#DDD',
                        type: 'dust'
                    });
                }
            }
        } else {
            // Normal feet
            ctx.beginPath();
            ctx.moveTo(centerX - 16, groundY);
            ctx.lineTo(centerX - 25, groundY);
            ctx.moveTo(centerX + 16, groundY);
            ctx.lineTo(centerX + 25, groundY);
            ctx.stroke();
        }
    }

    // NEW: Enhanced visual effects combining all special effects
    drawEnhancedEffects(ctx, centerX, headY) {
        // Hit flash effect
        if (this.hitFlash > 0) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = `rgba(255, 255, 255, ${this.hitFlash * 0.7})`;
            ctx.fillRect(centerX - 40, headY - 20, 80, this.height + 40);
            ctx.restore();
        }

        // Blocking effect
        if (this.blocking) {
            ctx.save();
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.shadowColor = '#00FFFF';
            ctx.shadowBlur = 15;
            const blockRect = {
                x: centerX - 35,
                y: headY - 15,
                w: 70,
                h: this.height + 30
            };
            ctx.strokeRect(blockRect.x, blockRect.y, blockRect.w, blockRect.h);
            ctx.setLineDash([]);
            ctx.restore();
        }

        // Parry window effect
        if (this.parryWindow > 0) {
            ctx.save();
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 5;
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 20;
            const alpha = this.parryWindow / 200;
            ctx.globalAlpha = alpha;
            const parryRect = {
                x: centerX - 40,
                y: headY - 20,
                w: 80,
                h: this.height + 40
            };
            ctx.strokeRect(parryRect.x, parryRect.y, parryRect.w, parryRect.h);
            
            // Parry sparkles
            for (let i = 0; i < 3; i++) {
                const sparkleX = parryRect.x + Math.random() * parryRect.w;
                const sparkleY = parryRect.y + Math.random() * parryRect.h;
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        // Trail particles
        this.trailParticles.forEach(particle => {
            ctx.save();
            const alpha = particle.life / particle.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = particle.color;
            ctx.shadowColor = particle.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 4 * alpha, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Combo indicator with better styling
        if (this.combo > 1) {
            ctx.save();
            ctx.font = 'bold 18px Orbitron';
            ctx.fillStyle = '#FFD700';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.textAlign = 'center';
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 10;
            
            const comboY = headY - 35;
            const comboText = `${this.combo}x COMBO!`;
            
            // Combo background
            const textWidth = ctx.measureText(comboText).width;
            ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
            ctx.fillRect(centerX - textWidth/2 - 10, comboY - 20, textWidth + 20, 25);
            
            // Combo text
            ctx.fillStyle = '#FFD700';
            ctx.strokeText(comboText, centerX, comboY);
            ctx.fillText(comboText, centerX, comboY);
            ctx.restore();
        }

        // Weapon equipped indicator
        if (this.weapon) {
            this.drawWeapon(ctx, centerX, headY + 30);
        }
    }

    // NEW: Draw equipped weapon
    drawWeapon(ctx, centerX, armY) {
        ctx.save();
        ctx.strokeStyle = this.weapon.color || '#888888';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        
        const weaponX = centerX + (this.facing * 30);
        const weaponY = armY;
        
        switch (this.weapon.type) {
            case 'sword':
                // Draw sword
                ctx.beginPath();
                ctx.moveTo(weaponX, weaponY - 20);
                ctx.lineTo(weaponX, weaponY + 15);
                ctx.stroke();
                // Crossguard
                ctx.beginPath();
                ctx.moveTo(weaponX - 8, weaponY - 15);
                ctx.lineTo(weaponX + 8, weaponY - 15);
                ctx.stroke();
                break;
            case 'spear':
                // Draw spear
                ctx.beginPath();
                ctx.moveTo(weaponX, weaponY - 25);
                ctx.lineTo(weaponX, weaponY + 20);
                ctx.stroke();
                // Spearhead
                ctx.beginPath();
                ctx.moveTo(weaponX - 5, weaponY - 20);
                ctx.lineTo(weaponX, weaponY - 25);
                ctx.lineTo(weaponX + 5, weaponY - 20);
                ctx.stroke();
                break;
        }
        ctx.restore();
    }

    drawSpecialEffects(ctx, centerX, armY) {
        const time = Date.now() * 0.01;
        
        if (this.color === '#FF4444') {
            // Enhanced fire effect for Player 1
            ctx.save();
            
            // Outer fire glow
            const outerGradient = ctx.createRadialGradient(
                centerX + this.facing * 35, armY, 0,
                centerX + this.facing * 35, armY, 25
            );
            outerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            outerGradient.addColorStop(0.3, 'rgba(255, 200, 0, 0.6)');
            outerGradient.addColorStop(0.6, 'rgba(255, 100, 0, 0.4)');
            outerGradient.addColorStop(1, 'rgba(255, 0, 0, 0.2)');
            
            ctx.fillStyle = outerGradient;
            ctx.beginPath();
            ctx.arc(centerX + this.facing * 35, armY, 20 + Math.sin(time * 2) * 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner fire core
            const innerGradient = ctx.createRadialGradient(
                centerX + this.facing * 35, armY, 0,
                centerX + this.facing * 35, armY, 15
            );
            innerGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            innerGradient.addColorStop(0.4, 'rgba(255, 255, 100, 0.9)');
            innerGradient.addColorStop(1, 'rgba(255, 150, 0, 0.7)');
            
            ctx.fillStyle = innerGradient;
            ctx.beginPath();
            ctx.arc(centerX + this.facing * 35, armY, 12 + Math.sin(time * 3) * 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Fire particles
            for (let i = 0; i < 6; i++) {
                const angle = (time + i) * 0.5;
                const radius = 18 + Math.sin(time * 2 + i) * 8;
                const particleX = centerX + this.facing * 35 + Math.cos(angle) * radius;
                const particleY = armY + Math.sin(angle) * radius;
                
                ctx.fillStyle = `rgba(255, ${150 + Math.sin(time + i) * 50}, 0, 0.7)`;
                ctx.beginPath();
                ctx.arc(particleX, particleY, 2 + Math.sin(time * 4 + i) * 1, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        } else {
            // Enhanced energy effect for Player 2
            ctx.save();
            
            // Energy rings with glow
            ctx.shadowColor = '#00FFFF';
            ctx.shadowBlur = 15;
            
            for (let i = 0; i < 4; i++) {
                const ringRadius = 15 + i * 8 + Math.sin(time * 2 + i) * 4;
                const alpha = 0.8 - i * 0.15;
                
                ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
                ctx.lineWidth = 3 - i * 0.3;
                ctx.beginPath();
                ctx.arc(centerX, armY, ringRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Energy core
            const energyGradient = ctx.createRadialGradient(centerX, armY, 0, centerX, armY, 12);
            energyGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            energyGradient.addColorStop(0.5, 'rgba(100, 255, 255, 0.7)');
            energyGradient.addColorStop(1, 'rgba(0, 150, 255, 0.3)');
            
            ctx.fillStyle = energyGradient;
            ctx.beginPath();
            ctx.arc(centerX, armY, 8 + Math.sin(time * 4) * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Energy sparks
            for (let i = 0; i < 8; i++) {
                const angle = (time * 3 + i * Math.PI / 4);
                const sparkDistance = 20 + Math.sin(time * 2 + i) * 10;
                const sparkX = centerX + Math.cos(angle) * sparkDistance;
                const sparkY = armY + Math.sin(angle) * sparkDistance;
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.arc(sparkX, sparkY, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
    }

    drawStatusBars(ctx, centerX) {
        const barY = this.y - this.height - 35;
        const barWidth = 50;
        const barHeight = 6;

        // Health bar background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(centerX - barWidth/2, barY, barWidth, barHeight);

        // Health bar fill
        const healthPercent = this.health / this.maxHealth;
        let healthColor;
        if (healthPercent > 0.6) healthColor = '#00FF00';
        else if (healthPercent > 0.3) healthColor = '#FFFF00';
        else healthColor = '#FF0000';

        ctx.fillStyle = healthColor;
        ctx.fillRect(centerX - barWidth/2, barY, barWidth * healthPercent, barHeight);

        // Energy bar
        const energyY = barY + 10;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(centerX - barWidth/2, energyY, barWidth, barHeight);

        const energyPercent = this.energy / this.maxEnergy;
        ctx.fillStyle = '#0080FF';
        ctx.fillRect(centerX - barWidth/2, energyY, barWidth * energyPercent, barHeight);

        // Borders
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.strokeRect(centerX - barWidth/2, barY, barWidth, barHeight);
        ctx.strokeRect(centerX - barWidth/2, energyY, barWidth, barHeight);
    }
}

// ================================
// WEAPON CLASS
// ================================
class Weapon {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.damage = this.getWeaponDamage(type);
        this.range = this.getWeaponRange(type);
        this.speed = this.getWeaponSpeed(type);
        this.color = this.getWeaponColor(type);
        this.animationFrame = 0;
        this.floatOffset = Math.random() * Math.PI * 2;
    }
    
    getWeaponDamage(type) {
        const damages = {
            'sword': 30,
            'spear': 25,
            'bow': 20,
            'boomerang': 22,
            'gun': 35
        };
        return damages[type] || 20;
    }
    
    getWeaponRange(type) {
        const ranges = {
            'sword': 40,
            'spear': 60,
            'bow': 200,
            'boomerang': 150,
            'gun': 300
        };
        return ranges[type] || 40;
    }
    
    getWeaponSpeed(type) {
        const speeds = {
            'sword': 1.2,
            'spear': 1.0,
            'bow': 0.8,
            'boomerang': 1.5,
            'gun': 0.6
        };
        return speeds[type] || 1.0;
    }
    
    getWeaponColor(type) {
        const colors = {
            'sword': '#C0C0C0',
            'spear': '#8B4513',
            'bow': '#654321',
            'boomerang': '#DAA520',
            'gun': '#2F2F2F'
        };
        return colors[type] || '#888888';
    }
    
    update() {
        this.animationFrame += 0.05;
    }
    
    draw(ctx) {
        ctx.save();
        const floatY = this.y + Math.sin(this.animationFrame + this.floatOffset) * 3;
        
        // Glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        switch (this.type) {
            case 'sword':
                // Draw sword
                ctx.beginPath();
                ctx.moveTo(this.x, floatY - 15);
                ctx.lineTo(this.x, floatY + 15);
                ctx.stroke();
                // Crossguard
                ctx.beginPath();
                ctx.moveTo(this.x - 8, floatY - 10);
                ctx.lineTo(this.x + 8, floatY - 10);
                ctx.stroke();
                // Pommel
                ctx.beginPath();
                ctx.arc(this.x, floatY + 18, 3, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'spear':
                // Draw spear
                ctx.beginPath();
                ctx.moveTo(this.x, floatY - 20);
                ctx.lineTo(this.x, floatY + 20);
                ctx.stroke();
                // Spearhead
                ctx.beginPath();
                ctx.moveTo(this.x - 5, floatY - 15);
                ctx.lineTo(this.x, floatY - 20);
                ctx.lineTo(this.x + 5, floatY - 15);
                ctx.stroke();
                break;
        }
        
        // Pickup indicator
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(this.x - 20, floatY - 25, 40, 50);
        ctx.setLineDash([]);
        
        ctx.restore();
    }
}

// ================================
// MAIN GAME CLASS
// ================================
class StickmanBattleArena {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameRunning = true;

        // Game settings
        this.gravity = 0.8;
        this.groundY = 520;
        this.attackRange = 80;

        // Visual effects
        this.particles = [];
        this.projectiles = [];
        this.damageTexts = [];
        this.screenShake = 0;
        this.slowMotion = false;
        this.slowMotionTimer = 0;

        // NEW: Weapons system
        this.weapons = [];
        this.weaponSpawnTimer = 0;
        this.weaponSpawnDelay = 8000; // 8 seconds
        this.weaponTypes = ['sword', 'spear'];

        // NEW: Smooth camera system
        this.cameraX = 0;
        this.cameraY = 0;
        this.targetCameraX = 0;
        this.targetCameraY = 0;
        this.cameraShake = 0;
        this.cameraShakeX = 0;
        this.cameraShakeY = 0;

        // Audio
        this.audioManager = new AudioManager();

        // Create players
        this.player1 = new StickmanFighter(150, this.groundY, '#FF4444', {
            left: 'KeyA',
            right: 'KeyD',
            jump: 'KeyW',
            attack: 'KeyS',
            special: 'KeyQ',
            block: 'KeyF',
            dash: 'KeyE'
        }, 1);

        this.player2 = new StickmanFighter(850, this.groundY, '#4444FF', {
            left: 'ArrowLeft',
            right: 'ArrowRight',
            jump: 'ArrowUp',
            attack: 'ArrowDown',
            special: 'ShiftRight',
            block: 'ControlRight',
            dash: 'Slash'
        }, -1);

        // Input handling
        this.keys = {};
        this.setupEventListeners();

        // Game stats
        this.gameStats = {
            player1Hits: 0,
            player2Hits: 0,
            gameTime: 0
        };

        // Start game loop
        this.gameLoop();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            e.preventDefault();
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            e.preventDefault();
        });

        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartGame();
        });

        document.getElementById('muteButton').addEventListener('click', () => {
            const muted = this.audioManager.toggleMute();
            document.getElementById('muteButton').textContent = muted ? '🔇 Muted' : '🔊 Sound';
        });
    }

    update() {
        if (!this.gameRunning) return;

        // Update game time
        this.gameStats.gameTime++;

        // Handle slow motion
        if (this.slowMotion) {
            this.slowMotionTimer--;
            if (this.slowMotionTimer <= 0) {
                this.slowMotion = false;
            }
        }

        // Update players
        this.player1.update(this.keys, this.groundY);
        this.player2.update(this.keys, this.groundY);

        // Handle special attacks
        if (this.player1.trySpecialAttack) {
            const power = Object.values(this.player1.specialPowers)[0];
            power.use(this.player1, this.player2, this);
            this.player1.trySpecialAttack = false;
        }

        if (this.player2.trySpecialAttack) {
            const power = Object.values(this.player2.specialPowers)[0];
            power.use(this.player2, this.player1, this);
            this.player2.trySpecialAttack = false;
        }

        // Check collisions
        this.checkCollisions();

        // NEW: Update weapons
        this.updateWeapons();

        // NEW: Update smooth camera
        this.updateCamera();

        // Update visual effects
        this.updateParticles();
        this.updateProjectiles();
        this.updateDamageTexts();
        this.updateScreenShake();

        // Update UI
        this.updateUI();

        // Check game over
        this.checkGameOver();
    }

    checkCollisions() {
        // Enhanced attack collisions with blocking and parrying
        if (this.player1.attacking && !this.player1.hasHit) {
            if (this.isInAttackRange(this.player1, this.player2)) {
                this.handleAttackCollision(this.player1, this.player2);
                this.gameStats.player1Hits++;
            }
        }

        if (this.player2.attacking && !this.player2.hasHit) {
            if (this.isInAttackRange(this.player2, this.player1)) {
                this.handleAttackCollision(this.player2, this.player1);
                this.gameStats.player2Hits++;
            }
        }
    }

    // NEW: Enhanced attack collision handling
    handleAttackCollision(attacker, target) {
        // Check for parry first (perfect timing block)
        if (target.parryWindow > 0 && target.blocking) {
            // Successful parry!
            this.handleParry(attacker, target);
            return;
        }
        
        // Check for block
        if (target.blocking && !target.invulnerable) {
            this.handleBlock(attacker, target);
            return;
        }
        
        // Check invulnerability frames
        if (target.invulnerable) {
            return;
        }
        
        // Normal damage
        const damage = attacker.weapon ? attacker.weapon.damage : (attacker.currentAttackDamage || 20);
        this.dealDamage(attacker, target, damage);
    }

    // NEW: Handle successful parry
    handleParry(attacker, target) {
        // Stun the attacker
        attacker.attackCooldown = 60; // Extended cooldown
        attacker.knockbackX = attacker.facing * -15; // Knockback attacker
        
        // Grant target energy and brief invulnerability
        target.energy = Math.min(target.maxEnergy, target.energy + 30);
        target.invulnerabilityFrames = 20;
        
        // Visual effects
        for (let i = 0; i < 12; i++) {
            this.particles.push(new Particle(
                target.x + target.width/2,
                target.y - target.height/2,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                '#FFD700',
                30,
                3
            ));
        }
        
        // Screen flash
        this.addScreenShake(5);
        this.addDamageText(target.x + target.width/2, target.y - target.height, "PARRY!", '#FFD700');
        
        attacker.hasHit = true;
    }

    // NEW: Handle blocked attack
    handleBlock(attacker, target) {
        // Reduced damage through block
        const blockedDamage = Math.floor((attacker.currentAttackDamage || 20) * 0.3);
        target.health -= blockedDamage;
        target.energy -= 10; // Blocking costs energy
        
        // Small knockback
        target.knockbackX = attacker.facing * 5;
        
        // Visual effects
        for (let i = 0; i < 6; i++) {
            this.particles.push(new Particle(
                target.x + target.width/2,
                target.y - target.height/2,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                '#00FFFF',
                20,
                2
            ));
        }
        
        this.addDamageText(target.x + target.width/2, target.y - target.height, `BLOCKED ${blockedDamage}`, '#00FFFF');
        this.addScreenShake(3);
        
        attacker.hasHit = true;
    }

    isInAttackRange(attacker, target) {
        const attackerCenter = attacker.x + attacker.width / 2;
        const targetCenter = target.x + target.width / 2;
        const distance = Math.abs(attackerCenter - targetCenter);
        const verticalDistance = Math.abs(attacker.y - target.y);
        const targetInFront = (attacker.facing === 1 && targetCenter > attackerCenter) || 
                             (attacker.facing === -1 && targetCenter < attackerCenter);

        return distance < this.attackRange && verticalDistance < 60 && targetInFront;
    }

    dealDamage(attacker, target, damage) {
        target.health -= damage;
        if (target.health < 0) target.health = 0;

        attacker.hasHit = true;
        this.audioManager.play('hit');

        // NEW: Add hit flash effect
        target.hitFlash = 1.0;
        target.invulnerabilityFrames = 10; // Brief invincibility after hit

        // Add knockback
        target.knockbackX = attacker.facing * 8;
        target.knockbackY = -5;

        // Add damage text
        this.addDamageText(target.x + target.width/2, target.y - target.height, damage);

        // Add hit particles
        for (let i = 0; i < 8; i++) {
            this.particles.push(new Particle(
                target.x + target.width/2 + (Math.random() - 0.5) * 30,
                target.y - target.height/2 + (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6,
                '#FFFF00',
                20 + Math.random() * 10,
                2 + Math.random() * 2
            ));
        }

        // Screen shake with DOM effect
        this.addScreenShake(8);
        this.addDOMScreenShake();

        // Check for game over
        if (target.health <= 0) {
            this.endGame(attacker === this.player1 ? 'Player 1' : 'Player 2');
        }
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => particle.update());
    }

    updateProjectiles() {
        this.projectiles = this.projectiles.filter(projectile => {
            projectile.x += projectile.vx;
            projectile.y += projectile.vy;
            projectile.life--;

            // Check collision with targets
            const target = projectile.owner === this.player1 ? this.player2 : this.player1;
            const distance = Math.sqrt(
                Math.pow(projectile.x - (target.x + target.width/2), 2) +
                Math.pow(projectile.y - (target.y - target.height/2), 2)
            );

            if (distance < projectile.size + 20) {
                // Hit target
                target.health -= projectile.damage;
                if (target.health < 0) target.health = 0;

                target.knockbackX = projectile.vx * 2;
                target.knockbackY = -10;

                this.audioManager.play('hit');
                this.addScreenShake(12);

                // Add explosion particles
                for (let i = 0; i < 15; i++) {
                    this.particles.push(new Particle(
                        projectile.x + (Math.random() - 0.5) * 30,
                        projectile.y + (Math.random() - 0.5) * 30,
                        (Math.random() - 0.5) * 10,
                        (Math.random() - 0.5) * 10,
                        `hsl(${Math.random() * 60}, 100%, 50%)`,
                        30 + Math.random() * 20,
                        3 + Math.random() * 3
                    ));
                }

                this.addDamageText(target.x + target.width/2, target.y - target.height, projectile.damage);
                return false; // Remove projectile
            }

            // Remove if out of bounds or expired
            return projectile.x > -50 && projectile.x < 1050 && projectile.life > 0;
        });
    }

    updateDamageTexts() {
        this.damageTexts = this.damageTexts.filter(text => {
            text.y -= 2;
            text.life--;
            text.opacity = text.life / 60;
            return text.life > 0;
        });
    }

    updateScreenShake() {
        if (this.screenShake > 0) {
            this.screenShake--;
        }
    }

    // NEW: Update weapons system
    updateWeapons() {
        // Update weapon spawn timer
        this.weaponSpawnTimer += 16; // ~60fps
        
        if (this.weaponSpawnTimer >= this.weaponSpawnDelay && this.weapons.length < 2) {
            this.spawnWeapon();
            this.weaponSpawnTimer = 0;
        }
        
        // Update existing weapons
        this.weapons.forEach(weapon => weapon.update());
        
        // Check weapon pickups
        this.player1.checkWeaponPickup(this.weapons);
        this.player2.checkWeaponPickup(this.weapons);
    }

    // NEW: Spawn random weapon
    spawnWeapon() {
        const weaponType = this.weaponTypes[Math.floor(Math.random() * this.weaponTypes.length)];
        const x = 300 + Math.random() * 400; // Spawn in middle area
        const y = this.groundY - 30;
        
        this.weapons.push(new Weapon(x, y, weaponType));
    }

    // NEW: Smooth camera system
    updateCamera() {
        // Calculate midpoint between players
        const midX = (this.player1.smoothX + this.player2.smoothX) / 2;
        const midY = (this.player1.smoothY + this.player2.smoothY) / 2;
        
        // Calculate distance between players for zoom effect
        const distance = Math.abs(this.player1.smoothX - this.player2.smoothX);
        const zoomFactor = Math.max(0.8, Math.min(1.2, distance / 300));
        
        // Target camera position (centered on action)
        this.targetCameraX = midX - this.canvas.width / 2;
        this.targetCameraY = midY - this.canvas.height / 2 - 50; // Slightly higher view
        
        // Smooth camera interpolation
        const cameraSpeed = 0.08;
        this.cameraX += (this.targetCameraX - this.cameraX) * cameraSpeed;
        this.cameraY += (this.targetCameraY - this.cameraY) * cameraSpeed;
        
        // Camera bounds to keep action in view
        this.cameraX = Math.max(-200, Math.min(200, this.cameraX));
        this.cameraY = Math.max(-100, Math.min(50, this.cameraY));
        
        // Camera shake
        if (this.cameraShake > 0) {
            this.cameraShakeX = (Math.random() - 0.5) * this.cameraShake;
            this.cameraShakeY = (Math.random() - 0.5) * this.cameraShake;
            this.cameraShake *= 0.9; // Decay shake
        } else {
            this.cameraShakeX = 0;
            this.cameraShakeY = 0;
        }
    }

    addDamageText(x, y, damage, color = '#FFFF00') {
        this.damageTexts.push({
            x: x,
            y: y,
            damage: damage,
            life: 60,
            opacity: 1,
            color: color
        });
    }

    addScreenShake(intensity) {
        this.screenShake = Math.max(this.screenShake, intensity);
        // Also add camera shake for more dynamic effect
        this.cameraShake = Math.max(this.cameraShake, intensity * 0.5);
    }

    // NEW: Add DOM screen shake effect
    addDOMScreenShake() {
        const container = document.getElementById('gameContainer');
        container.classList.add('shake');
        setTimeout(() => container.classList.remove('shake'), 300);
    }

    updateUI() {
        // Update health bars
        document.getElementById('player1Health').style.width = (this.player1.health / this.player1.maxHealth * 100) + '%';
        document.getElementById('player2Health').style.width = (this.player2.health / this.player2.maxHealth * 100) + '%';

        // Update energy bars
        document.getElementById('player1Energy').style.width = (this.player1.energy / this.player1.maxEnergy * 100) + '%';
        document.getElementById('player2Energy').style.width = (this.player2.energy / this.player2.maxEnergy * 100) + '%';

        // Update text
        document.getElementById('player1HealthText').textContent = Math.ceil(this.player1.health);
        document.getElementById('player1EnergyText').textContent = Math.ceil(this.player1.energy);
        document.getElementById('player2HealthText').textContent = Math.ceil(this.player2.health);
        document.getElementById('player2EnergyText').textContent = Math.ceil(this.player2.energy);

        // NEW: Update combo displays
        const p1Combo = document.getElementById('player1Combo');
        const p2Combo = document.getElementById('player2Combo');
        
        if (this.player1.combo > 1) {
            p1Combo.textContent = `${this.player1.combo}x COMBO!`;
            p1Combo.style.display = 'block';
        } else {
            p1Combo.style.display = 'none';
        }
        
        if (this.player2.combo > 1) {
            p2Combo.textContent = `${this.player2.combo}x COMBO!`;
            p2Combo.style.display = 'block';
        } else {
            p2Combo.style.display = 'none';
        }

        // NEW: Show weapon info if available
        const weaponInfo = document.getElementById('weaponInfo');
        const activeWeapons = [];
        if (this.player1.weapon) activeWeapons.push(`P1: ${this.player1.weapon.type}`);
        if (this.player2.weapon) activeWeapons.push(`P2: ${this.player2.weapon.type}`);
        
        if (activeWeapons.length > 0) {
            weaponInfo.textContent = activeWeapons.join(' | ');
            weaponInfo.style.display = 'block';
        } else {
            weaponInfo.style.display = 'none';
        }
    }

    checkGameOver() {
        if (this.player1.health <= 0) {
            this.endGame('Player 2 Victory!', 'Blue Fighter Wins!');
        } else if (this.player2.health <= 0) {
            this.endGame('Player 1 Victory!', 'Red Fighter Wins!');
        }
    }

    endGame(message, subtitle) {
        this.gameRunning = false;
        this.slowMotion = true;
        this.slowMotionTimer = 120;
        this.audioManager.play('gameOver');

        document.getElementById('gameOverMessage').textContent = message;
        document.getElementById('gameOverStats').innerHTML = `
            <div>${subtitle}</div>
            <div>Game Time: ${Math.floor(this.gameStats.gameTime / 60)}s</div>
            <div>Player 1 Hits: ${this.gameStats.player1Hits}</div>
            <div>Player 2 Hits: ${this.gameStats.player2Hits}</div>
        `;
        document.getElementById('gameOver').classList.remove('hidden');
    }

    restartGame() {
        this.gameRunning = true;
        this.slowMotion = false;

        // Reset players
        this.player1.x = 150;
        this.player1.y = this.groundY;
        this.player1.velocityX = 0;
        this.player1.velocityY = 0;
        this.player1.health = 100;
        this.player1.energy = 100;
        this.player1.facing = 1;
        this.player1.attacking = false;
        this.player1.attackCooldown = 0;
        this.player1.state = 'idle';

        this.player2.x = 850;
        this.player2.y = this.groundY;
        this.player2.velocityX = 0;
        this.player2.velocityY = 0;
        this.player2.health = 100;
        this.player2.energy = 100;
        this.player2.facing = -1;
        this.player2.attacking = false;
        this.player2.attackCooldown = 0;
        this.player2.state = 'idle';

        // Reset special powers
        Object.values(this.player1.specialPowers).forEach(power => power.currentCooldown = 0);
        Object.values(this.player2.specialPowers).forEach(power => power.currentCooldown = 0);

        // Clear effects
        this.particles = [];
        this.projectiles = [];
        this.damageTexts = [];
        this.screenShake = 0;

        // Reset stats
        this.gameStats = {
            player1Hits: 0,
            player2Hits: 0,
            gameTime: 0
        };

        document.getElementById('gameOver').classList.add('hidden');
    }

    render() {
        // Apply smooth camera and screen shake
        const totalShakeX = this.cameraShakeX + (this.screenShake > 0 ? (Math.random() - 0.5) * this.screenShake : 0);
        const totalShakeY = this.cameraShakeY + (this.screenShake > 0 ? (Math.random() - 0.5) * this.screenShake : 0);

        this.ctx.save();
        
        // Apply camera transformation
        this.ctx.translate(-this.cameraX + totalShakeX, -this.cameraY + totalShakeY);

        // Clear canvas with camera offset
        this.ctx.clearRect(
            this.cameraX - totalShakeX - 50, 
            this.cameraY - totalShakeY - 50, 
            this.canvas.width + 100, 
            this.canvas.height + 100
        );

        // Draw background
        this.drawBackground();

        // Draw game elements
        this.drawProjectiles();
        this.drawWeapons(); // NEW: Draw weapons
        this.player1.draw(this.ctx);
        this.player2.draw(this.ctx);
        this.drawParticles();
        this.drawDamageTexts();

        // Draw platform/ground
        this.drawGround();

        this.ctx.restore();

        // Apply slow motion effect (UI overlay, not affected by camera)
        if (this.slowMotion) {
            this.ctx.fillStyle = 'rgba(100, 100, 255, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    drawBackground() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1e3c72');
        gradient.addColorStop(0.5, '#2a5298');
        gradient.addColorStop(1, '#667eea');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Add some atmospheric effects
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 20; i++) {
            const x = (Date.now() * 0.01 + i * 50) % (this.canvas.width + 100) - 50;
            const y = 50 + Math.sin(Date.now() * 0.001 + i) * 30;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawGround() {
        // Ground with gradient
        const groundGradient = this.ctx.createLinearGradient(0, this.groundY, 0, this.canvas.height);
        groundGradient.addColorStop(0, '#8B4513');
        groundGradient.addColorStop(1, '#654321');
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);

        // Ground line
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.groundY);
        this.ctx.lineTo(this.canvas.width, this.groundY);
        this.ctx.stroke();

        // Platform decoration
        this.ctx.fillStyle = '#5a3a1a';
        for (let i = 0; i < this.canvas.width; i += 50) {
            this.ctx.fillRect(i, this.groundY + 5, 20, 10);
        }
    }

    drawParticles() {
        this.particles.forEach(particle => particle.draw(this.ctx));
    }

    drawProjectiles() {
        this.projectiles.forEach(projectile => {
            this.ctx.save();
            this.ctx.globalAlpha = projectile.life / projectile.maxLife;
            
            // Draw fireball
            const gradient = this.ctx.createRadialGradient(
                projectile.x, projectile.y, 0,
                projectile.x, projectile.y, projectile.size
            );
            gradient.addColorStop(0, '#FFFF00');
            gradient.addColorStop(0.5, '#FF8800');
            gradient.addColorStop(1, '#FF0000');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }

    // NEW: Draw weapons
    drawWeapons() {
        this.weapons.forEach(weapon => weapon.draw(this.ctx));
    }

    drawDamageTexts() {
        this.ctx.font = 'bold 24px Orbitron';
        this.ctx.textAlign = 'center';

        this.damageTexts.forEach(text => {
            this.ctx.save();
            this.ctx.globalAlpha = text.opacity;
            this.ctx.fillStyle = text.color || '#FFFF00';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 3;
            const displayText = typeof text.damage === 'string' ? text.damage : `-${text.damage}`;
            this.ctx.strokeText(displayText, text.x, text.y);
            this.ctx.fillText(displayText, text.x, text.y);
            this.ctx.restore();
        });
    }

    gameLoop() {
        this.update();
        this.render();
        
        // Use slower frame rate during slow motion
        const frameRate = this.slowMotion ? 30 : 60;
        setTimeout(() => {
            requestAnimationFrame(() => this.gameLoop());
        }, 1000 / frameRate);
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new StickmanBattleArena();
});
