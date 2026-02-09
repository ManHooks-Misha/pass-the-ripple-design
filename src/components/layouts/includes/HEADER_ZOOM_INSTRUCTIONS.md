# Header Zoom Behavior – Implementation Guide

This guide explains how to add the same “top header that scales with browser zoom” behavior to another project. The header stays visually consistent when users zoom in/out (e.g. **Ctrl +** / **Ctrl −**).

---

## What It Does

- Detects zoom (via `window.devicePixelRatio` and `resize`).
- Computes a **scale factor** and stores it in a CSS variable `--header-scale`.
- The header **wrapper** (height, border) and **inner content** (logo, nav, buttons) both use this scale so the header behaves in a controlled way at different zoom levels.

**Note:** On many desktop browsers, **Ctrl +** / **Ctrl −** do not change `devicePixelRatio`; they change layout zoom. The logic still runs on `resize` and a 1s interval, so the behavior may be more reliable on high-DPI devices or when the window is resized.

---

## 1. React Component Logic (e.g. `Header.jsx`)

### 1.1 State and effect

- Use a state value for “zoom” (e.g. from `window.devicePixelRatio`), only if you need it in the UI; the important part is updating the CSS variable.
- In `useEffect`:
  - Define a function that:
    - Reads zoom (e.g. `const zoom = window.devicePixelRatio || 1`).
    - Computes `scaleFactor` from `zoom` (see below).
    - Sets the CSS variable:  
      `document.documentElement.style.setProperty('--header-scale', scaleFactor)`.
  - Call that function once on mount.
  - Add `window.addEventListener('resize', thatFunction)`.
  - Optionally run the same function on an interval (e.g. every 1000 ms) to catch zoom changes that don’t fire `resize`.
  - In the cleanup: remove the `resize` listener and clear the interval.

### 1.2 Scale factor formula

Use the same logic as in this project:

```js
let scaleFactor;
if (zoom < 1) {
  // Zoom out: keep header at ~100% visual size
  scaleFactor = 1 / zoom;
} else if (zoom <= 1.5) {
  // 100%–150%: grow with zoom
  scaleFactor = 1;
} else {
  // Above 150%: cap visual size at 150%
  scaleFactor = 1.5 / zoom;
}
```

Then:

```js
document.documentElement.style.setProperty('--header-scale', scaleFactor);
```

### 1.3 Example `useEffect` (conceptual)

```js
useEffect(() => {
  const handleResize = () => {
    const zoom = window.devicePixelRatio || 1;
    let scaleFactor;
    if (zoom < 1) {
      scaleFactor = 1 / zoom;
    } else if (zoom <= 1.5) {
      scaleFactor = 1;
    } else {
      scaleFactor = 1.5 / zoom;
    }
    document.documentElement.style.setProperty('--header-scale', scaleFactor);
  };

  handleResize();
  window.addEventListener('resize', handleResize);
  const interval = setInterval(handleResize, 1000);

  return () => {
    window.removeEventListener('resize', handleResize);
    clearInterval(interval);
  };
}, []);
```

---

## 2. CSS (e.g. `Header.css`)

### 2.1 Wrapper (full-width bar)

- Use a **fixed** header that spans the width (e.g. `position: fixed; top: 0; left: 0; width: 100%`).
- Make **height** and **border** depend on `--header-scale` with a default of `1`:

```css
.header-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  /* ... other layout/visual styles ... */

  height: calc(80px * var(--header-scale, 1));
  border-bottom: calc(3px * var(--header-scale, 1)) solid var(--secondary-color);
}
```

Adjust `80px` and `3px` to match your design.

### 2.2 Inner content (logo, nav, buttons)

- Use a **centered** block (e.g. fixed max-width like 980px) positioned in the middle of the wrapper.
- Scale that block with `--header-scale` and keep it centered:

```css
.header-content {
  width: 980px;   /* or your content width */
  height: 80px;
  /* ... flex, padding, etc. ... */

  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%) scale(var(--header-scale, 1));
  transform-origin: top center;
}
```

All elements inside `.header-content` will scale together. No need to scale every child separately.

---

## 3. Checklist for Your Other Project

1. **Header component**
   - [ ] Add the `useEffect` that computes `scaleFactor` and sets `--header-scale` on `document.documentElement`.
   - [ ] Call handler on mount, on `resize`, and optionally on an interval (e.g. 1s).
   - [ ] Clean up listener and interval in the effect return.

2. **Wrapper element**
   - [ ] Use a class (e.g. `.header-wrapper`) with `height` and any border using `calc(... * var(--header-scale, 1))`.

3. **Content container**
   - [ ] Use a class (e.g. `.header-content`) with `transform: translateX(-50%) scale(var(--header-scale, 1));` and `transform-origin: top center`, plus `position: absolute; left: 50%;` (or equivalent) so it stays centered.

4. **Root**
   - [ ] Ensure the CSS variable is set on a root that your header styles see (this guide uses `document.documentElement` so `var(--header-scale, 1)` works globally).

---

## 4. Vanilla JS (no React)

If the other project is not React:

- Run the same `handleResize` logic once on load.
- Attach it to `window.addEventListener('resize', handleResize)`.
- Optionally use `setInterval(handleResize, 1000)` and clear it when the page is torn down.

The CSS stays the same: use `--header-scale` on the wrapper and the content block as above.

---

## 5. Quick copy-paste reference

**JS (logic only):**

```js
const updateHeaderScale = () => {
  const zoom = window.devicePixelRatio || 1;
  let scaleFactor =
    zoom < 1 ? 1 / zoom : zoom <= 1.5 ? 1 : 1.5 / zoom;
  document.documentElement.style.setProperty('--header-scale', scaleFactor);
};
updateHeaderScale();
window.addEventListener('resize', updateHeaderScale);
const interval = setInterval(updateHeaderScale, 1000);
// Cleanup: removeEventListener('resize', updateHeaderScale); clearInterval(interval);
```

**CSS (skeleton):**

```css
.header-wrapper {
  height: calc(80px * var(--header-scale, 1));
  border-bottom: calc(3px * var(--header-scale, 1)) solid #ccc;
}

.header-content {
  transform: translateX(-50%) scale(var(--header-scale, 1));
  transform-origin: top center;
}
```

---

You can follow this .md file in your other project to get the same header zoom behavior step by step.
