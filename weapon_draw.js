// Add this method to the StickmanFighter class
StickmanFighter.prototype.drawWeaponInHand = function(ctx, centerX, headY, shoulderY, armY) {
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
        weaponY = armY + 10 + Math.sin(this.animationTimer * 3) * 2;
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
