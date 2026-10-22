# Jungle Dash — Endless Runner Game

A browser-based endless runner inspired by classic temple-running games. **Jungle Dash** is built using only HTML, CSS, and JavaScript, without any game engine, frameworks, or backend.

Dodge obstacles, switch between three lanes, jump or slide at the right moment, and collect coins as your running speed gradually increases.

## Features

- **Three-Lane Movement:** Move left and right to avoid obstacles.
- **Jump and Slide:** Jump over obstacles and slide under overhead gates.
- **Collectible Coins:** Gather coins during your run.
- **Live Score:** Track your distance and collected coins.
- **Increasing Difficulty:** The game gradually becomes faster.
- **Best Score:** Save your highest distance locally in your browser.
- **Keyboard Controls:** Play using your keyboard.
- **Mobile Controls:** Use on-screen buttons or swipe gestures.
- **Responsive Design:** The interface adapts to different screen sizes.
- **Canvas Graphics:** The jungle scenery, road, player, coins, and obstacles are drawn using JavaScript.

## Project Structure

```text
temple-run-game/
├── index.html    # Game layout and interface
├── style.css     # Styling and responsive design
├── script.js     # Game logic and animations
├── README.md     # GitHub project documentation
└── README.txt    # Plain-text documentation
```

## Getting Started

No packages or special development tools are required.

1. Download the project ZIP file.
2. Extract the ZIP archive.
3. Open the `temple-run-game` folder.
4. Open `index.html` in Chrome, Edge, Firefox, or another modern browser.
5. Click **Start running** and enjoy the game!

**Important:** Keep `index.html`, `style.css`, and `script.js` together in the same folder.

## Controls

| Action | Keyboard | Mobile |
|---|---|---|
| Move left | Left Arrow / A | Swipe left or tap ← |
| Move right | Right Arrow / D | Swipe right or tap → |
| Jump | Up Arrow / Space | Swipe up or tap Jump |
| Slide | Down Arrow / S | Swipe down or tap Slide |
| Pause / Resume | P | Pause button |
| Start / Restart | Enter or game button | Start / Run again button |

## How It Works

### HTML — Game Structure

The HTML file creates the game screen, canvas, score display, start screen, pause button, and mobile controls.

### CSS — Game Design

The CSS file handles colors, layout, buttons, the score panel, overlays, and responsive styling.

### JavaScript — Game Logic

JavaScript powers the gameplay by:

- Drawing the game world using HTML Canvas.
- Handling keyboard and touch input.
- Moving the player between three lanes.
- Managing jumping and sliding.
- Generating obstacles and coins.
- Detecting collisions.
- Updating the distance and coin count.
- Increasing the running speed over time.
- Saving the best score using browser `localStorage`.

## Built With

- **HTML5** — Structure and Canvas element
- **CSS3** — Styling and responsive layout
- **Vanilla JavaScript** — Gameplay and animations
- **Canvas API** — Rendering the game world
- **localStorage** — Saving the best score

## Future Improvements

Here are some ideas to make Jungle Dash even better:

- Add background music and sound effects.
- Introduce new obstacles and power-ups.
- Add different characters and running animations.
- Create difficulty levels and missions.
- Improve the jungle environment and perspective.
- Add character upgrades and coin-based rewards.
- Introduce a global leaderboard using a backend.
- Enhance the visuals with more advanced 3D-style effects.

## Known Limitations

Jungle Dash is a **2D Canvas game with perspective-style graphics**, not a full 3D remake of Temple Run. It is an independent learning project inspired by the endless-runner genre and is not affiliated with the original Temple Run game.

The game can run locally in a browser without a server. The optional Google Fonts import requires an internet connection; system fonts are used as a fallback.

## Learning Objectives

This project is useful for practicing:

- HTML, CSS, and JavaScript fundamentals
- Canvas drawing and animation
- Event listeners and keyboard controls
- Touch input and swipe gestures
- Game loops and `requestAnimationFrame`
- Collision detection
- Arrays and objects
- Browser storage with `localStorage`

## Contributing

Want to improve Jungle Dash? You can fork the repository, experiment with new features, fix bugs, and submit your improvements.

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Test the game in your browser.
5. Submit a pull request.

## License

This project is intended for learning and personal experimentation. Before redistributing it, add a suitable license and verify the rights to any external assets you include.

---

**Keep building, keep experimenting, and have fun coding!**
