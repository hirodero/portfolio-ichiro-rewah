# Ichiro Rewah — Portfolio

Next.js App Router + TypeScript, with plain CSS and the React Bits PixelSnow background.

## Development

```sh
npm install
npm run dev
```

Open http://localhost:3000.

```sh
npm run typecheck
npm run build
npm start
```

## Customize

- Edit the introduction, projects, about text, and GitHub contact link in `src/app/page.tsx`. The GitHub username is inferred from the workspace owner; confirm it before publishing. The second project is explicitly a placeholder.
- Adjust colors and responsive layout in `src/app/globals.css`.
- Update metadata in `src/app/layout.tsx`.
- Snow settings live in `src/components/SnowBackground.tsx`. The wrapper loads the effect only in the browser, checks WebGL2 support, respects reduced motion, and provides a snow toggle.

## React Bits source

`src/components/PixelSnow.jsx` and `PixelSnow.css` contain the exact JS-CSS registry source fetched from https://reactbits.dev/r/PixelSnow-JS-CSS.json. Its listed dependency is `three@^0.180.0`. The TypeScript app imports this JavaScript component through a client wrapper; `allowJs` is enabled in TypeScript configuration.

Documentation: https://reactbits.dev/backgrounds/pixel-snow

## Hero cursor effect

`SplashCursor.jsx` is based on the JS-CSS registry source from https://reactbits.dev/r/SplashCursor-JS-CSS.json (no additional dependencies). The fluid simulation and default configuration are retained. Integration changes scope pointer listeners and coordinates to `.hero-shell`, size and clip the canvas to the hero, skip simulation while offscreen or the tab is hidden, and clean up listeners on unmount. `SplashCursor.css` keeps the effect behind the hero content without intercepting clicks. The existing client background wrapper loads it only with WebGL support and without reduced motion enabled.

## About profile

`ProfileCard.jsx` and `ProfileCard.css` are copied exactly from https://reactbits.dev/r/ProfileCard-JS-CSS.json (no additional dependencies). `AboutProfile.tsx` supplies Ichiro's details and a working contact action. `AboutProfile.css` places the portrait on the left of the heading and bio in “Behind the screen,” stacking them on mobile. The hero keeps its centered text without a floating portrait.

The supplied HEIC portrait is converted to `public/images/ichiro-rewah.jpg` for browser compatibility. The local `profile-pattern.svg` supplies the subtle pixel pattern. Desktop pointer tilt respects reduced motion, and device motion is disabled.

`src/components/LightRays.jsx` and `LightRays.css` contain the exact JS-CSS source from https://reactbits.dev/r/LightRays-JS-CSS.json, with dependency `ogl@^1.0.11`. The same client wrapper layers white rays above the gradient and below the snow and content, using the requested settings. `.rays-background` in the global CSS softens the effect to 30% opacity. Rays respect reduced motion independently of the snow toggle.
