
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
// CHARACTER CLASSES
// ================================
class CharacterClass {
    constructor(name, stats, specialMoves, description) {
        this.name = name;
        this.stats = stats;
        this.specialMoves = specialMoves;
        this.description = description;
    }
}

const CHARACTER_CLASSES = {
    warrior: new CharacterClass('Warrior', {
        health: 120,
        energy: 80,
        speed: 5,
        jumpPower: 16,
        energyRegenRate: 0.4,
        attackDamage: 1.2,
        defense: 1.1
    }, ['berserkerRage', 'groundSlam'], 'High health and defense, devastating melee attacks'),
    
    assassin: new CharacterClass('Assassin', {
        health: 80,
        energy: 120,
        speed: 8,
        jumpPower: 22,
        energyRegenRate: 0.7,
        attackDamage: 1.1,
        defense: 0.9
    }, ['shadowClone', 'poisonDart'], 'Fast and agile, stealth and poison specialist'),
    
    mage: new CharacterClass('Mage', {
        health: 90,
        energy: 140,
        speed: 4,
        jumpPower: 15,
        energyRegenRate: 0.8,
        attackDamage: 0.9,
        defense: 0.8
    }, ['arcaneOrb', 'manaShield'], 'High energy and magical prowess, arcane specialist'),
    
    monk: new CharacterClass('Monk', {
        health: 100,
        energy: 100,
        speed: 6,
        jumpPower: 18,
        energyRegenRate: 0.5,
        attackDamage: 1.0,
        defense: 1.0
    }, ['innerPeace', 'chiBlast'], 'Balanced stats, spiritual energy and healing focus')
};

// ================================
// STICKMAN FIGHTER CLASS
// ================================
class StickmanFighter {
    constructor(x, y, color, controls, facingDirection = 1, characterClass = 'monk', gameRef = null) {
        // Character class setup
        this.characterClass = CHARACTER_CLASSES[characterClass];
        this.classType = characterClass;
        
        // Game reference for weapon dropping
        this.currentGame = gameRef;
        
        // Position and physics
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 70;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = this.characterClass.stats.speed;
        this.jumpPower = this.characterClass.stats.jumpPower;
        this.onGround = true;

        // Combat stats (based on character class)
        this.health = this.characterClass.stats.health;
        this.maxHealth = this.characterClass.stats.health;
        this.energy = this.characterClass.stats.energy;
        this.maxEnergy = this.characterClass.stats.energy;
        this.energyRegenRate = this.characterClass.stats.energyRegenRate;

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
        this.nearbyWeapon = false;

        // Animation state
        this.animationFrame = 0;
        this.animationSpeed = 0.2;
        this.state = 'idle'; // idle, running, jumping, attacking, special, blocking, dashing

        // Special abilities
        this.specialPowers = this.createSpecialPowers();
        this.specialEffects = [];

        // NEW: Class-specific special states
        this.berserkerMode = 0;
        this.berserkerDamageBoost = 1.0;
        this.berserkerSpeedBoost = 1.0;
        this.shadowClones = [];
        this.manaShield = 0;
        this.poisoned = 0;
        this.poisonDamageTimer = 0;

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

    // NEW: Multiple special powers and selection
    createSpecialPowers() {
        // Define available powers with unique class-specific abilities
        const powers = {
            // WARRIOR ABILITIES
            berserkerRage: new SpecialPower('Berserker Rage', 60, 200, (caster, target, game) => {
                game.audioManager.play('special');
                // Temporary massive damage boost and speed increase
                caster.berserkerMode = 300; // Duration in frames
                caster.berserkerDamageBoost = 2.0;
                caster.berserkerSpeedBoost = 1.5;
                game.addDamageText(caster.x + caster.width/2, caster.y - caster.height, 'BERSERKER!', '#FF0000');
                
                // Red rage aura
                for (let i = 0; i < 30; i++) {
                    game.particles.push(new Particle(
                        caster.x + caster.width/2 + Math.cos(i/30 * Math.PI*2) * 40,
                        caster.y - caster.height/2 + Math.sin(i/30 * Math.PI*2) * 40,
                        (Math.random()-0.5)*6,
                        (Math.random()-0.5)*6,
                        '#FF0000', 60, 5
                    ));
                }
                this.state = 'special';
                this.attackDuration = 30;
            }),
            
            groundSlam: new SpecialPower('Ground Slam', 45, 120, (caster, target, game) => {
                game.audioManager.play('special');
                // Powerful ground slam that creates shockwaves
                game.addScreenShake(20);
                
                // Damage all enemies in large radius
                [game.player1, game.player2].forEach(p => {
                    if (p !== caster) {
                        const distance = Math.abs(p.x - caster.x);
                        if (distance < 200) {
                            const damage = 35 * (1 - distance/200) * caster.characterClass.stats.attackDamage;
                            p.health -= damage;
                            p.knockbackX = (p.x < caster.x ? -1 : 1) * 15;
                            p.knockbackY = -12;
                            game.addDamageText(p.x + p.width/2, p.y - p.height, `SLAM ${Math.floor(damage)}!`, '#8B4513');
                        }
                    }
                });
                
                // Ground crack effect
                for (let i = 0; i < 50; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = Math.random() * 150;
                    game.particles.push(new Particle(
                        caster.x + caster.width/2 + Math.cos(angle) * distance,
                        game.groundY + Math.sin(angle) * 20,
                        (Math.random()-0.5)*8,
                        -Math.random()*5,
                        '#8B4513', 40, 3
                    ));
                }
                this.state = 'special';
                this.attackDuration = 40;
            }),

            // ASSASSIN ABILITIES
            shadowClone: new SpecialPower('Shadow Clone', 55, 180, (caster, target, game) => {
                game.audioManager.play('special');
                // Create shadow clones that confuse and attack
                caster.shadowClones = [];
                for (let i = 0; i < 3; i++) {
                    caster.shadowClones.push({
                        x: caster.x + (Math.random()-0.5)*100,
                        y: caster.y,
                        life: 120,
                        attackTimer: Math.random() * 60
                    });
                }
                game.addDamageText(caster.x + caster.width/2, caster.y - caster.height, 'SHADOW CLONE!', '#9932CC');
                
                // Shadow particles
                for (let i = 0; i < 20; i++) {
                    game.particles.push(new Particle(
                        caster.x + caster.width/2 + (Math.random()-0.5)*60,
                        caster.y - caster.height/2 + (Math.random()-0.5)*60,
                        (Math.random()-0.5)*8,
                        (Math.random()-0.5)*8,
                        '#9932CC', 30, 4
                    ));
                }
                this.state = 'special';
                this.attackDuration = 25;
            }),

            poisonDart: new SpecialPower('Poison Dart', 35, 100, (caster, target, game) => {
                game.audioManager.play('special');
                // Fast poison projectile that deals damage over time
                const dart = {
                    x: caster.x + caster.width / 2,
                    y: caster.y - caster.height / 2,
                    vx: caster.facing * 12,
                    vy: -2,
                    size: 8,
                    life: 100,
                    maxLife: 100,
                    damage: 15,
                    poison: true,
                    poisonDuration: 180,
                    owner: caster
                };
                
                game.projectiles.push(dart);
                
                // Green poison particles
                for (let i = 0; i < 8; i++) {
                    game.particles.push(new Particle(
                        dart.x + (Math.random()-0.5)*15,
                        dart.y + (Math.random()-0.5)*15,
                        (Math.random()-0.5)*3,
                        (Math.random()-0.5)*3,
                        '#00FF00', 25, 2
                    ));
                }
                this.state = 'special';
                this.attackDuration = 20;
            }),

            // MAGE ABILITIES
            arcaneOrb: new SpecialPower('Arcane Orb', 50, 140, (caster, target, game) => {
                game.audioManager.play('special');
                // Slow but powerful homing orb
                const orb = {
                    x: caster.x + caster.width / 2,
                    y: caster.y - caster.height / 2,
                    vx: 0,
                    vy: 0,
                    size: 20,
                    life: 200,
                    maxLife: 200,
                    damage: 40,
                    homing: true,
                    target: target,
                    owner: caster
                };
                
                game.projectiles.push(orb);
                
                // Magical sparkles
                for (let i = 0; i < 15; i++) {
                    game.particles.push(new Particle(
                        orb.x + (Math.random()-0.5)*25,
                        orb.y + (Math.random()-0.5)*25,
                        (Math.random()-0.5)*4,
                        (Math.random()-0.5)*4,
                        '#9966FF', 40, 3
                    ));
                }
                this.state = 'special';
                this.attackDuration = 35;
            }),

            manaShield: new SpecialPower('Mana Shield', 40, 160, (caster, target, game) => {
                game.audioManager.play('special');
                // Absorbs damage using energy instead of health
                caster.manaShield = 240; // Duration in frames
                game.addDamageText(caster.x + caster.width/2, caster.y - caster.height, 'MANA SHIELD!', '#00BFFF');
                
                // Blue shield particles
                for (let i = 0; i < 25; i++) {
                    const angle = i / 25 * Math.PI * 2;
                    game.particles.push(new Particle(
                        caster.x + caster.width/2 + Math.cos(angle) * 50,
                        caster.y - caster.height/2 + Math.sin(angle) * 50,
                        Math.cos(angle) * 2,
                        Math.sin(angle) * 2,
                        '#00BFFF', 50, 4
                    ));
                }
                this.state = 'special';
                this.attackDuration = 30;
            }),

            // MONK ABILITIES
            innerPeace: new SpecialPower('Inner Peace', 45, 200, (caster, target, game) => {
                game.audioManager.play('special');
                // Restores health and energy while becoming briefly invulnerable
                const healAmount = 50;
                const energyAmount = 40;
                caster.health = Math.min(caster.maxHealth, caster.health + healAmount);
                caster.energy = Math.min(caster.maxEnergy, caster.energy + energyAmount);
                caster.invulnerabilityFrames = 60;
                
                game.addDamageText(caster.x + caster.width/2, caster.y - caster.height, 'INNER PEACE!', '#FFD700');
                
                // Golden healing aura
                for (let i = 0; i < 20; i++) {
                    const angle = i / 20 * Math.PI * 2;
                    game.particles.push(new Particle(
                        caster.x + caster.width/2 + Math.cos(angle) * 30,
                        caster.y - caster.height/2 + Math.sin(angle) * 30,
                        Math.cos(angle) * 3,
                        Math.sin(angle) * 3,
                        '#FFD700', 60, 4
                    ));
                }
                this.state = 'special';
                this.attackDuration = 40;
            }),

            chiBlast: new SpecialPower('Chi Blast', 35, 110, (caster, target, game) => {
                game.audioManager.play('special');
                // Energy wave that travels through enemies
                const blast = {
                    x: caster.x + caster.width / 2,
                    y: caster.y - caster.height / 2,
                    vx: caster.facing * 6,
                    vy: 0,
                    size: 25,
                    life: 150,
                    maxLife: 150,
                    damage: 25,
                    piercing: true,
                    owner: caster
                };
                
                game.projectiles.push(blast);
                
                // Chi energy particles
                for (let i = 0; i < 12; i++) {
                    game.particles.push(new Particle(
                        blast.x + (Math.random()-0.5)*20,
                        blast.y + (Math.random()-0.5)*20,
                        (Math.random()-0.5)*5,
                        (Math.random()-0.5)*5,
                        '#FFA500', 35, 3
                    ));
                }
                this.state = 'special';
                this.attackDuration = 25;
            }),

            // LEGACY ABILITIES (kept for compatibility)
            fireball: new SpecialPower('Fireball', 40, 120, (caster, target, game) => {
                game.audioManager.play('special');
                this.createFireball(caster, game);
            }),
            teleportSlash: new SpecialPower('Teleport Slash', 50, 150, (caster, target, game) => {
                game.audioManager.play('special');
                this.performTeleportSlash(caster, target, game);
            }),
            shockwave: new SpecialPower('Shockwave', 35, 100, (caster, target, game) => {
                game.audioManager.play('special');
                // Area knockback and damage
                [game.player1, game.player2].forEach(p => {
                    if (p !== caster && Math.abs(p.x - caster.x) < 120) {
                        p.health -= 20 * caster.characterClass.stats.attackDamage;
                        p.knockbackX = (p.x < caster.x ? -1 : 1) * 12;
                        p.knockbackY = -10;
                        game.addDamageText(p.x + p.width/2, p.y - p.height, 'SHOCK!', '#FF00FF');
                    }
                });
                // Visual effect
                for (let i = 0; i < 20; i++) {
                    game.particles.push(new Particle(
                        caster.x + caster.width/2 + Math.cos(i/20 * Math.PI*2) * 60,
                        caster.y - caster.height/2 + Math.sin(i/20 * Math.PI*2) * 30,
                        (Math.random()-0.5)*8,
                        (Math.random()-0.5)*8,
                        '#FF00FF', 30, 4
                    ));
                }
                this.state = 'special';
                this.attackDuration = 30;
            }),
            heal: new SpecialPower('Heal', 30, 180, (caster, target, game) => {
                game.audioManager.play('special');
                const healAmount = 40 * (caster.characterClass.stats.attackDamage || 1);
                caster.health = Math.min(caster.maxHealth, caster.health + healAmount);
                game.addDamageText(caster.x + caster.width/2, caster.y - caster.height, `+${Math.floor(healAmount)}`, '#00FF00');
                for (let i = 0; i < 10; i++) {
                    game.particles.push(new Particle(
                        caster.x + caster.width/2 + (Math.random()-0.5)*30,
                        caster.y - caster.height/2 + (Math.random()-0.5)*30,
                        (Math.random()-0.5)*4,
                        (Math.random()-0.5)*4,
                        '#00FF00', 25, 3
                    ));
                }
                this.state = 'special';
                this.attackDuration = 20;
            })
        };
        // Character class-based selection
        this.selectedSpecial = this.characterClass.specialMoves[0];
        return powers;
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

        // NEW: Update class-specific special states
        this.updateSpecialStates();

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
        
        // NEW: Drop weapon by pressing block + pickup
        if (keys[this.controls.block] && keys[this.controls.pickup] && this.weapon) {
            // Create a new weapon at the player's position
            const droppedWeapon = new Weapon(
                this.x + this.width/2 + this.facing * 20, 
                this.y - 20, 
                this.weapon.type
            );
            
            // Add weapon back to the game's weapon array
            this.currentGame.weapons.push(droppedWeapon);
            
            // Clear player's weapon
            this.weapon = null;
        }
        
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
        const maxMoveSpeed = this.speed * this.berserkerSpeedBoost;
        if (!this.isDashing && !this.attacking) {
            if (keys[this.controls.left]) {
                this.velocityX -= moveAcceleration;
                if (this.velocityX < -maxMoveSpeed) this.velocityX = -maxMoveSpeed;
                this.facing = -1;
                moving = true;
            }
            if (keys[this.controls.right]) {
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
        // NEW: Special ability selection (use number keys 1-4)
        for (let i = 1; i <= 4; i++) {
            if (keys['Digit' + i]) {
                const powerNames = this.characterClass.specialMoves;
                if (powerNames[i-1]) {
                    this.selectedSpecial = powerNames[i-1];
                }
            }
        }
        // Special attacks
        if (keys[this.controls.special]) {
            const power = this.specialPowers[this.selectedSpecial];
            if (power && power.canUse(this)) {
                this.trySpecialAttack = true;
            }
        }
    }

    updatePhysics(groundY) {
        // Improved gravity with faster falling (reduced floatiness)
        if (!this.onGround) {
            // Even stronger gravity for faster falling
            this.velocityY += 1.5;
            
            // Terminal velocity to limit maximum falling speed
            if (this.velocityY > 20) {
                this.velocityY = 20;
            }
        }

        // Apply knockback with faster decay (reduced air time)
        this.velocityX += this.knockbackX;
        this.velocityY += this.knockbackY * 0.6; // Further reduced vertical knockback
        this.knockbackX *= 0.7; // Even faster knockback decay
        this.knockbackY *= 0.7; // Even faster knockback decay

        // Update position with optimized precision (better performance)
        const oldX = this.x;
        this.x += Math.round(this.velocityX * 10) / 10; // Round to 1 decimal place
        this.y += Math.round(this.velocityY * 10) / 10; // Round to 1 decimal place

        // Enhanced movement with momentum and friction
        if (this.onGround) {
            // Ground friction with easing - different for different states
            if (this.state === 'idle' || this.state === 'blocking') {
                this.velocityX *= 0.75; // Even faster stopping when idle/blocking
            } else {
                this.velocityX *= 0.82; // Improved normal friction
            }
        } else {
            // Air resistance
            this.velocityX *= 0.95;
        }

        // Smoother velocity clamping
        const maxSpeed = this.isDashing ? 22 : 14;
        if (Math.abs(this.velocityX) > maxSpeed) {
            this.velocityX = Math.sign(this.velocityX) * maxSpeed;
        }

        // Enhanced ground collision with bounce dampening and landing effect
        if (this.y >= groundY) {
            this.y = groundY;
            if (this.velocityY > 0) {
                this.velocityY = 0;
                
                // Add landing effect if falling from a significant height
                if (!this.wasOnGround && Math.abs(this.velocityY) > 8) {
                    // Landing dust particles
                    for (let i = 0; i < 8; i++) {
                        this.particles.push({
                            x: this.x + this.width / 2 + (Math.random() - 0.5) * 20,
                            y: groundY,
                            vx: (Math.random() - 0.5) * 3,
                            vy: -Math.random() * 2 - 1,
                            size: Math.random() * 4 + 2,
                            color: '#DDD',
                            life: 15
                        });
                    }
                }
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
        let damage = 15 * this.characterClass.stats.attackDamage * this.berserkerDamageBoost;
        let duration = 20;
        let cooldown = 30;
        if (this.combo >= 3) {
            attackType = 'heavy';
            damage = 25 * this.characterClass.stats.attackDamage * this.berserkerDamageBoost;
            duration = 30;
            cooldown = 50;
        } else if (this.combo >= 5) {
            attackType = 'finisher';
            damage = 35 * this.characterClass.stats.attackDamage * this.berserkerDamageBoost;
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
        // NEW: Mark if combo is performed in air
        this.comboInAir = !this.onGround;
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
    
    // NEW: Update class-specific special states
    updateSpecialStates() {
        // Berserker Mode (Warrior)
        if (this.berserkerMode > 0) {
            this.berserkerMode--;
            if (this.berserkerMode <= 0) {
                this.berserkerDamageBoost = 1.0;
                this.berserkerSpeedBoost = 1.0;
            }
        }
        
        // Shadow Clones (Assassin)
        if (this.shadowClones && this.shadowClones.length > 0) {
            this.shadowClones = this.shadowClones.filter(clone => {
                clone.life--;
                clone.attackTimer--;
                
                // Clone attacks nearby enemy occasionally
                if (clone.attackTimer <= 0) {
                    clone.attackTimer = 60 + Math.random() * 60;
                    // Attack logic would go here
                }
                
                return clone.life > 0;
            });
        }
        
        // Mana Shield (Mage)
        if (this.manaShield > 0) {
            this.manaShield--;
        }
        
        // Poison effect
        if (this.poisoned > 0) {
            this.poisoned--;
            this.poisonDamageTimer++;
            
            // Deal poison damage every 30 frames (0.5 seconds)
            if (this.poisonDamageTimer >= 30) {
                this.health -= 2;
                this.poisonDamageTimer = 0;
            }
        }
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
    
    // Check if a weapon is in pickup range (without picking it up)
    checkNearbyWeapons(weapons) {
        this.nearbyWeapon = false;
        
        for (const weapon of weapons) {
            const dx = weapon.x - (this.x + this.width / 2);
            const dy = weapon.y - (this.y + this.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.weaponPickupRadius) {
                this.nearbyWeapon = true;
                break;
            }
        }
    }

    // Check for weapon pickup (now requires pickup button)
    checkWeaponPickup(weapons, keys) {
        if (this.weapon) return; // Already holding a weapon
        
        for (let i = 0; i < weapons.length; i++) {
            const weapon = weapons[i];
            const dx = weapon.x - (this.x + this.width / 2);
            const dy = weapon.y - (this.y + this.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Pickup only when button is pressed and in range
            if (distance < this.weaponPickupRadius && keys[this.controls.pickup]) {
                this.weapon = weapon;
                weapons.splice(i, 1);
                
                // Add a small pickup visual effect
                for (let j = 0; j < 10; j++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 2 + 1;
                    const size = Math.random() * 4 + 2;
                    this.particles.push({
                        x: this.x + this.width / 2,
                        y: this.y + this.height / 2,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed - 2,
                        size: size,
                        color: '#FFD700',
                        life: 20
                    });
                }
                break;
            }
        }
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
        
        // Draw weapon in hand if character has one
        if (this.weapon) {
            this.drawWeaponInHand(ctx, centerX, headY, shoulderY, armY);
        }

        // Special effects
        if (this.state === 'special') {
            this.drawSpecialEffects(ctx, centerX, armY);
        }

        // Health and energy bars above character
        this.drawStatusBars(ctx, centerX);
    }

    // Draw weapon in the character's hand
    drawWeapon(ctx, centerX, shoulderY, armY) {
        if (!this.weapon) return;
        
        // Get weapon position based on character state and facing direction
        let weaponX, weaponY, weaponRotation;
        const isAttacking = this.state === 'attacking' || this.state === 'special';
        const attackIntensity = isAttacking ? Math.sin(this.animationTimer * 8) * 4 : 0;
        
        // Different weapon positions based on character state
        if (isAttacking) {
            // Position during attack
            weaponX = centerX + this.facing * (35 + attackIntensity);
            weaponY = armY - 5;
            weaponRotation = this.facing === 1 ? Math.PI / 4 : -Math.PI / 4;
        } else if (this.state === 'running') {
            // Position during running
            weaponX = centerX + this.facing * 25;
            weaponY = armY + 10 + Math.sin(this.animationFrame * 3) * 2;
            weaponRotation = this.facing === 1 ? Math.PI / 6 : -Math.PI / 6;
        } else {
            // Default idle position
            weaponX = centerX + this.facing * 20;
            weaponY = armY + 15;
            weaponRotation = this.facing === 1 ? Math.PI / 8 : -Math.PI / 8;
        }
        
        ctx.save();
        ctx.translate(weaponX, weaponY);
        ctx.rotate(weaponRotation);
        
        // Draw the weapon with glow effect
        ctx.shadowColor = this.weapon.color;
        ctx.shadowBlur = 8;
        ctx.strokeStyle = this.weapon.color;
        ctx.fillStyle = this.weapon.color;
        ctx.lineWidth = 3;
        
        // Draw different weapon types
        switch(this.weapon.type) {
            case 'sword':
                // Draw sword
                ctx.beginPath();
                ctx.moveTo(0, -20);
                ctx.lineTo(0, 15);
                ctx.stroke();
                
                // Sword handle
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(-8, 15);
                ctx.lineTo(8, 15);
                ctx.stroke();
                
                // Sword blade
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(-3, -18);
                ctx.lineTo(3, -18);
                ctx.lineTo(1, -5);
                ctx.lineTo(-1, -5);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'spear':
                // Draw spear
                ctx.beginPath();
                ctx.moveTo(0, -25);
                ctx.lineTo(0, 20);
                ctx.stroke();
                
                // Spearhead
                ctx.beginPath();
                ctx.moveTo(-5, -15);
                ctx.lineTo(0, -25);
                ctx.lineTo(5, -15);
                ctx.closePath();
                ctx.fill();
                break;
        }
        
        ctx.restore();
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
        
        // Draw pickup indicator when a weapon is nearby
        if (this.nearbyWeapon) {
            const indicatorY = this.y - this.height - 25;
            ctx.save();
            ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.9)';
            ctx.lineWidth = 2;
            
            // Draw pickup key hint
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.controls.pickup.replace('Key', ''), centerX, indicatorY);
            
            // Draw indicator arrow
            ctx.beginPath();
            ctx.moveTo(centerX, indicatorY + 5);
            ctx.lineTo(centerX - 8, indicatorY + 15);
            ctx.lineTo(centerX + 8, indicatorY + 15);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
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

        // NEW: Berserker Mode effect (Warrior)
        if (this.berserkerMode > 0) {
            ctx.save();
            const intensity = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
            ctx.strokeStyle = `rgba(255, 0, 0, ${0.7 + intensity * 0.3})`;
            ctx.lineWidth = 4;
            ctx.shadowColor = '#FF0000';
            ctx.shadowBlur = 20;
            
            // Red berserker aura
            const berserkerRect = {
                x: centerX - 45,
                y: headY - 25,
                w: 90,
                h: this.height + 50
            };
            ctx.strokeRect(berserkerRect.x, berserkerRect.y, berserkerRect.w, berserkerRect.h);
            
            // Rage particles
            for (let i = 0; i < 5; i++) {
                const sparkleX = berserkerRect.x + Math.random() * berserkerRect.w;
                const sparkleY = berserkerRect.y + Math.random() * berserkerRect.h;
                ctx.fillStyle = '#FF0000';
                ctx.beginPath();
                ctx.arc(sparkleX, sparkleY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        // NEW: Mana Shield effect (Mage)
        if (this.manaShield > 0) {
            ctx.save();
            const shieldAlpha = Math.sin(Date.now() * 0.008) * 0.3 + 0.5;
            ctx.strokeStyle = `rgba(0, 191, 255, ${shieldAlpha})`;
            ctx.lineWidth = 6;
            ctx.shadowColor = '#00BFFF';
            ctx.shadowBlur = 25;
            
            // Blue mana shield
            const shieldRadius = 50 + Math.sin(Date.now() * 0.01) * 5;
            ctx.beginPath();
            ctx.arc(centerX, headY + this.height/2, shieldRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Shield hexagons pattern
            for (let i = 0; i < 6; i++) {
                const angle = i * Math.PI / 3 + Date.now() * 0.002;
                const hexX = centerX + Math.cos(angle) * (shieldRadius - 10);
                const hexY = headY + this.height/2 + Math.sin(angle) * (shieldRadius - 10);
                ctx.strokeStyle = `rgba(0, 191, 255, ${shieldAlpha * 0.7})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(hexX, hexY, 4, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        }

        // NEW: Poison effect
        if (this.poisoned > 0) {
            ctx.save();
            const poisonAlpha = Math.sin(Date.now() * 0.02) * 0.3 + 0.4;
            ctx.fillStyle = `rgba(0, 255, 0, ${poisonAlpha})`;
            ctx.shadowColor = '#00FF00';
            ctx.shadowBlur = 10;
            
            // Green poison bubbles
            for (let i = 0; i < 3; i++) {
                const bubbleX = centerX + (Math.random() - 0.5) * 60;
                const bubbleY = headY + Math.random() * this.height;
                ctx.beginPath();
                ctx.arc(bubbleX, bubbleY, 3 + Math.random() * 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        // NEW: Shadow Clones effect (Assassin)
        if (this.shadowClones && this.shadowClones.length > 0) {
            ctx.save();
            this.shadowClones.forEach(clone => {
                const alpha = clone.life / 120 * 0.5;
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = '#9932CC';
                ctx.lineWidth = 3;
                ctx.shadowColor = '#9932CC';
                ctx.shadowBlur = 15;
                
                // Draw shadow clone outline
                ctx.strokeRect(clone.x - 20, clone.y - this.height - 10, 40, this.height + 20);
            });
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
    
    // Draw weapon in the character's hand
    drawWeaponInHand(ctx, centerX, headY, shoulderY, armY) {
        if (!this.weapon) return;
        
        // Get weapon position based on character state and facing direction
        let weaponX, weaponY, weaponRotation;
        const isAttacking = this.state === 'attacking' || this.state === 'special';
        const attackIntensity = isAttacking ? Math.sin(this.animationFrame * 5) * 5 : 0;
        
        // Different weapon positions based on character state
        if (isAttacking) {
            // Position during attack
            weaponX = centerX + this.facing * (35 + attackIntensity);
            weaponY = armY - 5;
            weaponRotation = this.facing === 1 ? Math.PI / 4 : -Math.PI / 4;
        } else if (this.state === 'running') {
            // Position during running
            weaponX = centerX + this.facing * 25;
            weaponY = armY + 10 + Math.sin(this.animationFrame * 3) * 2;
            weaponRotation = this.facing === 1 ? Math.PI / 6 : -Math.PI / 6;
        } else {
            // Default idle position
            weaponX = centerX + this.facing * 20;
            weaponY = armY + 15;
            weaponRotation = this.facing === 1 ? Math.PI / 8 : -Math.PI / 8;
        }
        
        ctx.save();
        ctx.translate(weaponX, weaponY);
        ctx.rotate(weaponRotation * this.facing);
        
        // Draw the weapon with glow effect
        ctx.shadowColor = this.weapon.color;
        ctx.shadowBlur = 8;
        ctx.strokeStyle = this.weapon.color;
        ctx.fillStyle = this.weapon.color;
        ctx.lineWidth = 3;
        
        // Draw different weapon types
        switch(this.weapon.type) {
            case 'sword':
                // Draw sword
                ctx.beginPath();
                ctx.moveTo(0, -20);
                ctx.lineTo(0, 15);
                ctx.stroke();
                
                // Sword handle
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(-8, 15);
                ctx.lineTo(8, 15);
                ctx.stroke();
                
                // Sword blade
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(-3, -18);
                ctx.lineTo(3, -18);
                ctx.lineTo(1, -5);
                ctx.lineTo(-1, -5);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'spear':
                // Draw spear
                ctx.beginPath();
                ctx.moveTo(0, -25);
                ctx.lineTo(0, 20);
                ctx.stroke();
                
                // Spearhead
                ctx.beginPath();
                ctx.moveTo(-5, -15);
                ctx.lineTo(0, -25);
                ctx.lineTo(5, -15);
                ctx.closePath();
                ctx.fill();
                break;
        }
        
        ctx.restore();
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

        // Create players with different character classes
        this.player1 = new StickmanFighter(150, this.groundY, '#FF4444', {
            left: 'KeyA',
            right: 'KeyD',
            jump: 'KeyW',
            attack: 'KeyS',
            special: 'KeyQ',
            block: 'KeyF',
            dash: 'KeyE',
            pickup: 'KeyR'
        }, 1, 'warrior', this);

        this.player2 = new StickmanFighter(850, this.groundY, '#4444FF', {
            left: 'ArrowLeft',
            right: 'ArrowRight',
            jump: 'ArrowUp',
            attack: 'ArrowDown',
            special: 'ShiftRight',
            block: 'ControlRight',
            dash: 'Slash',
            pickup: 'Enter'
        }, -1, 'assassin', this);

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

        // Character class selection during game
        document.addEventListener('keydown', (e) => {
            // Player 1 class selection (Ctrl + 1-4)
            if (e.ctrlKey && ['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) {
                const classNames = Object.keys(CHARACTER_CLASSES);
                const classIndex = parseInt(e.code.replace('Digit', '')) - 1;
                if (classNames[classIndex]) {
                    this.changePlayerClass(this.player1, classNames[classIndex]);
                }
            }
            // Player 2 class selection (Alt + 1-4)
            if (e.altKey && ['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) {
                const classNames = Object.keys(CHARACTER_CLASSES);
                const classIndex = parseInt(e.code.replace('Digit', '')) - 1;
                if (classNames[classIndex]) {
                    this.changePlayerClass(this.player2, classNames[classIndex]);
                }
            }
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
        // NEW: Use selected special ability
        if (this.player1.trySpecialAttack) {
            const power = this.player1.specialPowers[this.player1.selectedSpecial];
            power.use(this.player1, this.player2, this);
            this.player1.trySpecialAttack = false;
        }
        if (this.player2.trySpecialAttack) {
            const power = this.player2.specialPowers[this.player2.selectedSpecial];
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
        // Enhanced air juggle: if attacker is in air and hits target, reset target's vertical velocity and allow juggle
        if (attacker.comboInAir && !target.onGround) {
            target.velocityY = -10; // Launch target up for juggle
            this.addDamageText(target.x + target.width/2, target.y - target.height, 'JUGGLE!', '#00BFFF');
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
        // Reduced damage through block (factor in defense)
        const baseDamage = attacker.currentAttackDamage || 20;
        const blockedDamage = Math.floor(baseDamage * 0.3 / target.characterClass.stats.defense);
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
        
        this.addDamageText(target.x + target.width/2, target.y - target.height, `BLOCKED ${Math.floor(blockedDamage)}`, '#00FFFF');
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
        // Apply defense multiplier
        let finalDamage = damage / target.characterClass.stats.defense;
        
        // Handle mana shield (Mage ability)
        if (target.manaShield > 0 && target.energy > 0) {
            const energyCost = finalDamage * 1.5; // Mana shield costs more energy than damage prevented
            if (target.energy >= energyCost) {
                target.energy -= energyCost;
                finalDamage *= 0.3; // 70% damage reduction
                this.addDamageText(target.x + target.width/2, target.y - target.height - 20, 'SHIELD!', '#00BFFF');
            } else {
                // Not enough energy, shield breaks
                finalDamage *= 0.7; // Partial protection
                target.energy = 0;
                target.manaShield = 0;
                this.addDamageText(target.x + target.width/2, target.y - target.height - 20, 'SHIELD BROKEN!', '#FF6600');
            }
        }
        
        target.health -= finalDamage;
        if (target.health < 0) target.health = 0;

        attacker.hasHit = true;
        this.audioManager.play('hit');

        // NEW: Add hit flash effect
        target.hitFlash = 1.0;
        target.invulnerabilityFrames = 10; // Brief invincibility after hit

        // Add knockback with reduced air time
        target.knockbackX = attacker.facing * 6; // Reduced horizontal knockback
        target.knockbackY = target.onGround ? -3 : -1; // Much less vertical knockback, especially in air

        // Add damage text
        this.addDamageText(target.x + target.width/2, target.y - target.height, Math.floor(finalDamage));

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
            // Handle homing projectiles (Arcane Orb)
            if (projectile.homing && projectile.target) {
                const targetX = projectile.target.x + projectile.target.width/2;
                const targetY = projectile.target.y - projectile.target.height/2;
                const dx = targetX - projectile.x;
                const dy = targetY - projectile.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance > 0) {
                    const speed = 4;
                    projectile.vx += (dx / distance) * 0.3;
                    projectile.vy += (dy / distance) * 0.3;
                    
                    // Limit speed
                    const currentSpeed = Math.sqrt(projectile.vx*projectile.vx + projectile.vy*projectile.vy);
                    if (currentSpeed > speed) {
                        projectile.vx = (projectile.vx / currentSpeed) * speed;
                        projectile.vy = (projectile.vy / currentSpeed) * speed;
                    }
                }
            }
            
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
                // Handle special projectile effects
                if (projectile.poison) {
                    // Poison dart effect
                    target.poisoned = projectile.poisonDuration;
                    target.poisonDamageTimer = 0;
                    this.addDamageText(target.x + target.width/2, target.y - target.height - 20, 'POISONED!', '#00FF00');
                }
                
                // Hit target with damage
                target.health -= projectile.damage;
                if (target.health < 0) target.health = 0;

                target.knockbackX = projectile.vx * 2;
                target.knockbackY = -10;

                this.audioManager.play('hit');
                this.addScreenShake(12);

                // Add explosion particles with projectile-specific colors
                const particleColor = projectile.poison ? '#00FF00' : 
                                    projectile.homing ? '#9966FF' :
                                    projectile.piercing ? '#FFA500' :
                                    `hsl(${Math.random() * 60}, 100%, 50%)`;
                
                for (let i = 0; i < 15; i++) {
                    this.particles.push(new Particle(
                        projectile.x + (Math.random() - 0.5) * 30,
                        projectile.y + (Math.random() - 0.5) * 30,
                        (Math.random() - 0.5) * 10,
                        (Math.random() - 0.5) * 10,
                        particleColor,
                        30 + Math.random() * 20,
                        3 + Math.random() * 3
                    ));
                }

                this.addDamageText(target.x + target.width/2, target.y - target.height, projectile.damage);
                
                // Piercing projectiles don't get removed on hit
                if (projectile.piercing) {
                    projectile.damage *= 0.8; // Reduce damage for subsequent hits
                } else {
                    return false; // Remove projectile
                }
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
        
        // Check for nearby weapons (for indicator)
        this.player1.checkNearbyWeapons(this.weapons);
        this.player2.checkNearbyWeapons(this.weapons);
        
        // Check weapon pickups (now requires button press)
        this.player1.checkWeaponPickup(this.weapons, this.keys);
        this.player2.checkWeaponPickup(this.weapons, this.keys);
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
        
        // Keep camera at a stable height to reduce bouncing
        const stableY = this.groundY - 260; // Fixed height above ground
        this.targetCameraY = stableY; // No vertical tracking
        
        // Much slower camera interpolation for stability
        const horizontalCameraSpeed = 0.03; // Slower horizontal movement
        const verticalCameraSpeed = 0.015; // Even slower vertical movement
        
        // Apply damping to reduce oscillation
        this.cameraX += (this.targetCameraX - this.cameraX) * horizontalCameraSpeed;
        this.cameraY += (this.targetCameraY - this.cameraY) * verticalCameraSpeed;
        
        // Round camera position to reduce micro-jitters
        this.cameraX = Math.round(this.cameraX * 10) / 10;
        this.cameraY = Math.round(this.cameraY * 10) / 10;
        
        // Camera bounds to keep action in view
        this.cameraX = Math.max(-200, Math.min(200, this.cameraX));
        this.cameraY = Math.max(-100, Math.min(50, this.cameraY));
        
        // Reduced camera shake
        if (this.cameraShake > 0) {
            this.cameraShakeX = (Math.random() - 0.5) * (this.cameraShake * 0.7); // Reduced shake
            this.cameraShakeY = (Math.random() - 0.5) * (this.cameraShake * 0.5); // Even less vertical shake
            this.cameraShake *= 0.8; // Faster decay
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

        // NEW: Show character class info
        const classInfo = document.getElementById('classInfo') || this.createClassInfoElement();
        const p1Effects = [];
        const p2Effects = [];
        
        // Check active effects for Player 1
        if (this.player1.berserkerMode > 0) p1Effects.push('BERSERKER');
        if (this.player1.manaShield > 0) p1Effects.push('SHIELD');
        if (this.player1.poisoned > 0) p1Effects.push('POISONED');
        if (this.player1.shadowClones && this.player1.shadowClones.length > 0) p1Effects.push('CLONES');
        
        // Check active effects for Player 2
        if (this.player2.berserkerMode > 0) p2Effects.push('BERSERKER');
        if (this.player2.manaShield > 0) p2Effects.push('SHIELD');
        if (this.player2.poisoned > 0) p2Effects.push('POISONED');
        if (this.player2.shadowClones && this.player2.shadowClones.length > 0) p2Effects.push('CLONES');
        
        classInfo.innerHTML = `
            <div style="color: #FF4444;">P1: ${this.player1.characterClass.name} ${p1Effects.length ? `(${p1Effects.join(', ')})` : ''}</div>
            <div style="color: #4444FF;">P2: ${this.player2.characterClass.name} ${p2Effects.length ? `(${p2Effects.join(', ')})` : ''}</div>
        `;
        classInfo.style.display = 'block';

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

    createClassInfoElement() {
        const classInfo = document.createElement('div');
        classInfo.id = 'classInfo';
        classInfo.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            color: white;
            font-family: Orbitron, monospace;
            font-size: 14px;
            text-align: right;
            background: rgba(0,0,0,0.5);
            padding: 10px;
            border-radius: 5px;
        `;
        document.body.appendChild(classInfo);
        return classInfo;
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

    // NEW: Change player character class
    changePlayerClass(player, className) {
        const oldHealth = player.health;
        const oldEnergy = player.energy;
        const healthPercent = oldHealth / player.maxHealth;
        const energyPercent = oldEnergy / player.maxEnergy;
        
        // Update character class
        player.characterClass = CHARACTER_CLASSES[className];
        player.classType = className;
        
        // Update stats
        player.speed = player.characterClass.stats.speed;
        player.jumpPower = player.characterClass.stats.jumpPower;
        player.energyRegenRate = player.characterClass.stats.energyRegenRate;
        
        // Maintain health and energy percentages
        player.maxHealth = player.characterClass.stats.health;
        player.maxEnergy = player.characterClass.stats.energy;
        player.health = Math.min(player.maxHealth, healthPercent * player.maxHealth);
        player.energy = Math.min(player.maxEnergy, energyPercent * player.maxEnergy);
        
        // Update special powers
        player.selectedSpecial = player.characterClass.specialMoves[0];
        
        // Visual feedback
        this.addDamageText(player.x + player.width/2, player.y - player.height, 
            `${player.characterClass.name.toUpperCase()}!`, '#FFD700');
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
            
            if (projectile.poison) {
                // Poison dart - green and smaller
                const gradient = this.ctx.createRadialGradient(
                    projectile.x, projectile.y, 0,
                    projectile.x, projectile.y, projectile.size
                );
                gradient.addColorStop(0, '#00FF00');
                gradient.addColorStop(0.5, '#008800');
                gradient.addColorStop(1, '#004400');
                this.ctx.fillStyle = gradient;
                
                // Draw dart shape
                this.ctx.beginPath();
                this.ctx.ellipse(projectile.x, projectile.y, projectile.size, projectile.size * 0.3, 
                               Math.atan2(projectile.vy, projectile.vx), 0, Math.PI * 2);
                this.ctx.fill();
                
            } else if (projectile.homing) {
                // Arcane orb - purple and swirling
                const gradient = this.ctx.createRadialGradient(
                    projectile.x, projectile.y, 0,
                    projectile.x, projectile.y, projectile.size
                );
                gradient.addColorStop(0, '#FFFFFF');
                gradient.addColorStop(0.3, '#9966FF');
                gradient.addColorStop(0.7, '#6633CC');
                gradient.addColorStop(1, '#330099');
                this.ctx.fillStyle = gradient;
                
                // Draw swirling orb
                this.ctx.beginPath();
                this.ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Add magical sparkles
                const time = Date.now() * 0.01;
                for (let i = 0; i < 3; i++) {
                    const angle = time + i * Math.PI * 2 / 3;
                    const sparkleX = projectile.x + Math.cos(angle) * projectile.size * 0.7;
                    const sparkleY = projectile.y + Math.sin(angle) * projectile.size * 0.7;
                    this.ctx.fillStyle = '#FFFFFF';
                    this.ctx.beginPath();
                    this.ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                
            } else if (projectile.piercing) {
                // Chi blast - orange energy wave
                const gradient = this.ctx.createRadialGradient(
                    projectile.x, projectile.y, 0,
                    projectile.x, projectile.y, projectile.size
                );
                gradient.addColorStop(0, '#FFCC00');
                gradient.addColorStop(0.5, '#FF9900');
                gradient.addColorStop(1, '#FF6600');
                this.ctx.fillStyle = gradient;
                
                // Draw energy wave
                this.ctx.beginPath();
                this.ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Add energy trails
                this.ctx.strokeStyle = '#FFA500';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(projectile.x, projectile.y, projectile.size + 5, 0, Math.PI * 2);
                this.ctx.stroke();
                
            } else {
                // Regular fireball
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
            }
            
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
