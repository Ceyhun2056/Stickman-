# Gameplay Improvements Update

This update includes several key improvements to the game mechanics and controls:

## 1. Improved Gravity System
- Increased gravity constant from 0.8 to 1.2 for a more satisfying feel
- Added terminal velocity to prevent excessive fall speeds
- Optimized position updates with rounding for better performance

## 2. Camera Stabilization
- Fixed the bouncy camera issue by implementing a more stable tracking system
- Reduced camera interpolation for smoother transitions
- Added fixed height tracking to minimize vertical bobbing

## 3. Reduced Knockback Effects
- Stickmen no longer get launched too high after each hit
- Added ground-check conditional to prevent excessive air time
- Balanced knockback values for better combat flow

## 4. New Weapon Pickup System
- Weapons now require a button press to pick up (no more accidental pickups)
- Player 1: Press **R** key to pick up weapons
- Player 2: Press **Enter** key to pick up weapons
- Added visual indicator when a weapon is in pickup range
- Gold particles effect when picking up a weapon

## How to Use Weapons
1. Approach a weapon on the ground
2. When the pickup indicator appears above your character, press your pickup key
3. Your character will now use the weapon for attacks until it's dropped

## Performance Improvements
- Optimized physics calculations for better frame rates
- Improved collision detection efficiency
- Reduced unnecessary particle effects during combat

Enjoy the improved gameplay experience!
