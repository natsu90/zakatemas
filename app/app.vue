<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&display=swap');

:root {
  --bg: #0d0b08;
  --surface: #161210;
  --card: #1e1a12;
  --card-hover: #252018;
  --border: rgba(212, 160, 23, 0.18);
  --border-dim: rgba(255, 255, 255, 0.06);
  --gold: #d4a017;
  --gold-bright: #e4b42a;
  --gold-muted: #9a7512;
  --gold-a: rgba(212, 160, 23, 0.1);
  --gold-a2: rgba(212, 160, 23, 0.22);
  --t1: #ece2cb;
  --t2: #8a7a5e;
  --t3: #52473a;
  --red: #f87171;
  --red-a: rgba(248, 113, 113, 0.08);
  --green: #68d391;
  --blue: #60a5fa;
  --r-sm: 8px;
  --r-md: 12px;
  --r-lg: 16px;
  --r-xl: 20px;
  --r-pill: 100px;
}

*, *::before, *::after {
  box-sizing: border-box;
}

html {
  color-scheme: dark;
}

body {
  margin: 0;
  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg);
  color: var(--t1);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ── Layout ── */
.container {
  max-width: 480px;
  margin: 0 auto;
  padding: 16px;
}

/* ── Badges ── */
.badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.63rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: var(--r-pill);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  white-space: nowrap;
}
.badge.gold {
  background: rgba(212, 160, 23, 0.12);
  color: var(--gold-bright);
  border: 1px solid rgba(212, 160, 23, 0.28);
}
.badge.silver {
  background: rgba(148, 163, 184, 0.08);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.2);
}
.badge.physical {
  background: rgba(104, 211, 145, 0.08);
  color: var(--green);
  border: 1px solid rgba(104, 211, 145, 0.2);
}
.badge.digital {
  background: rgba(96, 165, 250, 0.08);
  color: var(--blue);
  border: 1px solid rgba(96, 165, 250, 0.2);
}
.badge.gram {
  background: var(--border-dim);
  color: var(--t2);
  border: 1px solid var(--border-dim);
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
}

/* ── Form ── */
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--t2);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.input {
  width: 100%;
  padding: 12px 14px;
  background: var(--surface);
  border: 1px solid var(--border-dim);
  border-radius: var(--r-sm);
  color: var(--t1);
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.input:focus {
  border-color: var(--border);
  box-shadow: 0 0 0 3px var(--gold-a);
}
.input::placeholder {
  color: var(--t3);
}
.input:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* ── Toggles ── */
.toggle-group {
  display: flex;
  background: var(--surface);
  border: 1px solid var(--border-dim);
  border-radius: var(--r-sm);
  padding: 4px;
  gap: 4px;
}
.toggle-btn {
  flex: 1;
  padding: 9px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--t2);
  font-family: 'Outfit', sans-serif;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.15s ease;
}
.toggle-btn.active {
  background: var(--gold);
  color: #0d0b08;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(212, 160, 23, 0.28);
}

/* ── Shortcuts ── */
.shortcut-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.shortcut-btn {
  padding: 5px 10px;
  background: transparent;
  border: 1px solid var(--border-dim);
  border-radius: 6px;
  color: var(--t2);
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
}
.shortcut-btn:hover,
.shortcut-btn:active {
  background: var(--gold-a);
  border-color: var(--border);
  color: var(--gold-bright);
}
.shortcut-btn:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

/* ── Submit Button ── */
.btn-submit {
  width: 100%;
  padding: 14px;
  background: var(--gold);
  color: #0d0b08;
  border: none;
  border-radius: var(--r-md);
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.3px;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 4px 16px rgba(212, 160, 23, 0.22);
  margin-top: 4px;
}
.btn-submit:hover {
  background: var(--gold-bright);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(212, 160, 23, 0.32);
}
.btn-submit:active {
  transform: translateY(0);
}
.btn-submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* ── Hint ── */
.hint {
  font-size: 0.8rem;
  color: var(--red);
  background: var(--red-a);
  padding: 10px 14px;
  border-radius: var(--r-sm);
  border: 1px solid rgba(248, 113, 113, 0.15);
}

/* ── Image Upload ── */
.image-upload {
  border: 1.5px dashed var(--border-dim);
  border-radius: var(--r-sm);
  padding: 22px 16px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.image-upload:hover,
.image-upload:active {
  border-color: var(--border);
  background: var(--gold-a);
}
.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--t3);
  font-size: 0.85rem;
}
.image-icon {
  font-size: 1.4rem;
  filter: grayscale(0.5);
}
.image-wrapper {
  position: relative;
  display: inline-block;
}
.image-preview {
  max-width: 100%;
  max-height: 200px;
  border-radius: var(--r-sm);
  object-fit: contain;
  border: 1px solid var(--border-dim);
}
.btn-remove-image {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 0.7rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--r-xl);
  padding: 28px 24px;
  max-width: 360px;
  width: calc(100% - 32px);
  text-align: center;
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--border);
}

/* ── Back button ── */
.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--t2);
  text-decoration: none;
  font-size: 0.88rem;
  padding: 6px 0;
  transition: color 0.15s;
}
.btn-back:hover {
  color: var(--t1);
}

/* ── Loading ── */
.loading {
  text-align: center;
  padding: 48px 16px;
  color: var(--t2);
  font-size: 0.9rem;
}

/* ── Info Row (edit pages) ── */
.info-row {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

/* ── Records list ── */
.records-summary {
  background: var(--surface);
  border: 1px solid var(--border-dim);
  border-radius: var(--r-sm);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.record-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}
.record-date {
  color: var(--t3);
}
.record-gram {
  font-weight: 500;
  color: var(--t2);
}
</style>
