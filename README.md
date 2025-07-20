# Stickman Battle Arena

An advanced 2D browser-based fighting game featuring stickman characters with smooth animations, special powers, particle effects, and professional-grade game mechanics. Inspired by popular stickman games like "Stick Fight: The Game" and "Animator vs. Animation".

## 🎮 Features

### Core Gameplay
- **Special abilities** - Unique powers for each fighter with energy costs and cooldowns
### Audio System
**Sound effects** - Punch, special attack, jump, hit, and game over sounds
**Mute functionality** - Toggle sound on/off during gameplay
**Procedural audio** - Dynamic sound generation using Web Audio API

### Optional Features
- **AI opponent** - Single-player mode with basic computer behavior (chase, attack, block)
- **Local leaderboard** - Tracks wins and scores for each player
- **Responsive design** - Playable on mobile devices with touch controls
- **Special powers**:
  - **Red Fighter**: Fireball Attack - Launches a projectile that travels across the arena
  - **Blue Fighter**: Teleport Slash - Instantly teleports behind opponent for a devastating attack
- **Energy management** - Special abilities consume energy that regenerates over time
- **Knockback mechanics** - Dynamic movement from hits adds strategy and excitement

### Visual Effects
- **Particle systems** - Sparks, explosions, fire effects, and impact particles
- **Screen shake** - Intense feedback on powerful hits
- **Slow motion** - Dramatic effect when a player is defeated
- **Damage indicators** - Floating damage numbers with smooth animations
- **Professional UI** - Futuristic interface with glowing effects and smooth transitions

### Audio System
- **Sound effects** - Punch, special attack, jump, hit, and game over sounds
- **Mute functionality** - Toggle sound on/off during gameplay
- **Procedural audio** - Dynamic sound generation using Web Audio API

## 🎯 Controls

### Player 1 (Red Fighter)

### Player 1 (Red Fighter)
- **A** - Move left
- **D** - Move right
- **W** - Jump
- **S** - Basic attack (punch/kick)
- **E** - Special: Fireball Attack
- **F** - Block/Parry
- **Shift** - Dash/Roll

### Player 2 (Blue Fighter)
- **←** - Move left
- **→** - Move right
- **↑** - Jump
- **↓** - Basic attack (punch/kick)
- **Right Shift** - Special: Teleport Slash
- **Right Ctrl** - Block/Parry
- **Enter** - Dash/Roll

### Mobile/Touch Controls (Responsive)
- On-screen buttons for movement, attack, block, dash, and special powers

### AI Opponent
- In single-player mode, Player 2 is controlled by the computer (chase, attack, block)

### Leaderboard
- Tracks wins and scores for each player after each match
- **Right Shift** - Special: Teleport Slash

## 🚀 How to Play

1. **Movement**: Use your character's movement keys to navigate the arena
2. **Basic Combat**: Get close to your opponent and use the attack button
3. **Special Abilities**: Build up energy and unleash powerful special moves
4. **Strategy**: Manage your energy, time your attacks, and use knockback to your advantage
5. **Victory**: Reduce your opponent's health to zero to win the match

## 💻 Installation & Setup

### Quick Start
1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. Start battling immediately - no installation required!


## 🎨 Game Architecture

### Object-Oriented Design
```
StickmanBattleArena (Main Game Class)
├── StickmanFighter (Player Characters)
├── SpecialPower (Ability System)
├── Particle (Visual Effects)
└── AudioManager (Sound System)
```

### Key Components

#### StickmanFighter Class
- **Physics**: Position, velocity, gravity, collision detection
- **Animation**: State-based animation system (idle, running, jumping, attacking, special)
- **Combat**: Health, energy, attack timing, special abilities
- **Rendering**: Advanced stickman drawing with body part animation

#### Particle System
- **Dynamic effects**: Hit sparks, explosion effects, fire particles
- **Performance optimized**: Automatic cleanup and efficient rendering
- **Configurable**: Size, color, lifetime, physics properties

#### Special Powers System
- **Energy-based**: Each ability consumes energy that regenerates over time
- **Cooldown mechanics**: Prevents ability spam and adds strategy
- **Extensible**: Easy to add new special abilities

#### Audio Manager
- **Procedural sound**: Generates sound effects using Web Audio API
- **Sound categories**: Different tones for different game events
- **Mute functionality**: Players can toggle sound on/off

## 📁 File Structure

```
stickman-battle-arena/
├── index.html          # Game HTML structure and UI
├── style.css           # Advanced CSS with animations and effects
├── script.js           # Main game logic and classes
├── README.md           # This documentation


## 🔧 Technical Features

### Performance Optimizations
- **Efficient rendering**: Canvas optimization techniques
- **Particle pooling**: Reuse particle objects to reduce garbage collection
- **Frame rate management**: Adaptive frame rate during slow motion
- **Memory management**: Automatic cleanup of expired effects

### Advanced Visual Effects
- **Gradient backgrounds**: Dynamic sky and ground rendering
- **Screen shake**: Intensity-based camera shake for impact feedback
- **Glow effects**: CSS and canvas-based lighting effects
- **Smooth animations**: Interpolated movement and state transitions

### Game Balance
- **Energy costs**: Special abilities require strategic energy management
- **Attack timing**: Cooldowns prevent button mashing
- **Knockback physics**: Adds spatial strategy to combat
- **Health scaling**: Balanced damage values for engaging fights

## 🎯 Game Statistics

The game tracks various statistics during matches:
- **Game duration**: Total time of the current match
- **Hit counts**: Number of successful attacks per player
- **Victory conditions**: Clear winner announcement with stats

## 🔮 Future Enhancements

Potential features for future versions:
- **Additional special powers**: More unique abilities per character
- **Multiple arenas**: Different fighting environments
- **Power-ups**: Temporary buffs that spawn during fights
- **Tournament mode**: Best-of-three matches
- **Custom key bindings**: Player-configurable controls
- **AI opponents**: Single-player mode with computer opponents

## 🐛 Known Issues

- Audio may require user interaction to start in some browsers (auto-play policy)
- Mobile touch controls not yet implemented
- Performance may vary on older devices



## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs or suggest features
- Submit pull requests for improvements
- Share gameplay videos or screenshots
- Provide feedback on game balance

## 🙏 Acknowledgments

Inspired by:
- **Stick Fight: The Game** - Combat mechanics and visual style
- **Animator vs. Animation** - Smooth stickman animations
- **Fighting game community** - Gameplay balance and mechanics

---

**Enjoy the battle! May the best stickman win! 🥊**
