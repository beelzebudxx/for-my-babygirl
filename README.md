# A Little Birthday Surprise ♡

A responsive, static romantic birthday website made with HTML, CSS and vanilla JavaScript.

## Open locally
Open `index.html` in a browser. An internet connection is only needed to load the Google Fonts; standard fallback fonts are included.

## Personalize
At the very top of `script.js`, edit the `PERSONAL` object:
- `letterPages`: each quoted string is a page, `\n` makes a line break.
- `flowerSecret`: the hidden bouquet note.
- `wishMessage`: the message after blowing out the candle.

Change the greeting text in `index.html` if you wish. Colors are centralized in the `:root` block of `style.css`.

## Deploy via GitHub + Vercel
1. Make a new GitHub repository and upload the site files (keep `index.html` at the repository root).
2. In Vercel, select **Add New → Project** and import your GitHub repository.
3. Leave the framework preset as **Other**, set build command to none and output directory to the project root (`.`) if prompted.
4. Deploy. Future GitHub pushes will trigger new deployments.

No server, environment variables, paid services or database needed.

## Features
3D flip cards; envelope and multi-page love letter; staggered three-layer cake and candle; pastel confetti; seven individually blooming flowers; reduced-motion support; keyboard-accessible modal dialogs; mobile layout; replay controls.

## Music and messages
- Add your own local MP3 at `assets/music/birthday-song.mp3`. It is intentionally not bundled. The opening animation still works without it.
- Edit `PERSONAL.musicFile`, `PERSONAL.letterPages`, `PERSONAL.wishMessage`, `PERSONAL.flowerSecret`, and `PERSONAL.bottleWishes` at the beginning of `script.js`.
- The greeting and card headings can be changed in `index.html`.

## Implementation priority
**Required:** working disc-to-greeting-to-cards flow, persistent user-started audio, four exact letter pages, cake and bouquet animations, five interactive wish notes, mobile-friendly modal controls and replay functionality.

**Enhancements (optional):** a custom MP3, additional decorative particles, more elaborate transitions, alternate custom fonts and further illustration refinements. The site doesn't depend on these.

## Check before sharing
Open `index.html` in Chrome/Edge and tap the disc, flip each card, check all four letter pages, complete the cake, watch flowers bloom, and reveal all five wishes. Repeat on a phone. Test the pause control after adding your MP3. The source code passed a JavaScript syntax check; a full browser/device interaction test has not been performed.
