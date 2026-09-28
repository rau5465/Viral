/**
 * Advanced Device & Browser Fingerprint Generator
 * Enforces "One Device, One Account" policy to eliminate fake/duplicate registrations.
 * Generates a persistent, deterministic 64-char SHA-256 hash without third-party dependencies.
 */

const STORAGE_KEY = 'far_device_fingerprint';

// Fast fallback hash if crypto.subtle is unavailable (e.g. non-HTTPS local IP)
const fastHash64 = (str) => {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c64e6d ^ 0;
  let h3 = 0x9e3779b9 ^ 0;
  let h4 = 0x12345678 ^ 0;

  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 2246822507);
    h4 = Math.imul(h4 ^ ch, 3266489909);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 1597334677) ^ Math.imul(h3 ^ (h3 >>> 13), 2654435761);
  h3 = Math.imul(h3 ^ (h3 >>> 16), 2654435761) ^ Math.imul(h4 ^ (h4 >>> 13), 2246822507);
  h4 = Math.imul(h4 ^ (h4 >>> 16), 3266489909) ^ Math.imul(h1 ^ (h1 >>> 13), 1597334677);

  const hex = (n) => (n >>> 0).toString(16).padStart(8, '0');
  return `${hex(h1)}${hex(h2)}${hex(h3)}${hex(h4)}${hex(h2 ^ h3)}${hex(h1 ^ h4)}${hex(h3 ^ h1)}${hex(h2 ^ h4)}`;
};

/**
 * Collect Canvas 2D fingerprint
 */
const getCanvasFingerprint = () => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 240, 60);
    grad.addColorStop(0, '#0066FF');
    grad.addColorStop(0.5, '#00EEFD');
    grad.addColorStop(1, '#FDA702');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 240, 60);

    // Render complex text and glyphs with shadows
    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial', sans-serif";
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#070B14';
    ctx.shadowColor = 'rgba(0, 238, 253, 0.8)';
    ctx.shadowBlur = 6;
    ctx.fillText('FAR⚡Recharge#1Device', 10, 28);

    // Render arcs and composite operations
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(253, 167, 2, 0.7)';
    ctx.beginPath();
    ctx.arc(190, 30, 20, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    return canvas.toDataURL();
  } catch {
    return 'canvas-error';
  }
};

/**
 * Collect WebGL hardware renderer strings
 */
const getWebGLFingerprint = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'no-webgl';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) {
      return `${gl.getParameter(gl.VENDOR)}~${gl.getParameter(gl.RENDERER)}`;
    }
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
    return `${vendor}~${renderer}`;
  } catch {
    return 'webgl-error';
  }
};

/**
 * Collect screen and hardware metrics
 */
const getHardwareMetrics = () => {
  const screen = window.screen || {};
  const nav = window.navigator || {};

  return [
    screen.width || 0,
    screen.height || 0,
    screen.availWidth || 0,
    screen.availHeight || 0,
    screen.colorDepth || 0,
    window.devicePixelRatio || 1,
    nav.hardwareConcurrency || 'unknown',
    nav.deviceMemory || 'unknown',
    nav.maxTouchPoints || 0,
    nav.platform || '',
    nav.language || '',
    (nav.languages || []).join(','),
    Intl?.DateTimeFormat?.().resolvedOptions?.().timeZone || '',
    new Date().getTimezoneOffset(),
  ].join(';');
};

/**
 * Generate or retrieve persistent Device Fingerprint (64-char hex SHA-256)
 */
export const getDeviceFingerprint = async () => {
  // Check local cache
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached && cached.length === 64) {
      return cached;
    }
  } catch {}

  const canvasSig = getCanvasFingerprint();
  const webglSig = getWebGLFingerprint();
  const hwSig = getHardwareMetrics();
  const rawEntropy = `FAR_V1::${hwSig}::${webglSig}::${canvasSig}`;

  let finalHash = '';

  // Use Web Crypto API if available
  if (window.crypto && window.crypto.subtle && window.TextEncoder) {
    try {
      const msgBuffer = new TextEncoder().encode(rawEntropy);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      finalHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      finalHash = fastHash64(rawEntropy);
    }
  } else {
    finalHash = fastHash64(rawEntropy);
  }

  // Ensure 64-char hex string
  if (!finalHash || finalHash.length !== 64) {
    finalHash = fastHash64(rawEntropy);
  }

  // Persist locally
  try {
    localStorage.setItem(STORAGE_KEY, finalHash);
    sessionStorage.setItem(STORAGE_KEY, finalHash);
  } catch {}

  return finalHash;
};
