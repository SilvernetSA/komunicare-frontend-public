// @ts-nocheck
// Runtime helper kept for backwards compatibility. Vite exposes env values via import.meta.env.
const env = typeof import.meta !== 'undefined' ? import.meta.env : {};

export default env;
