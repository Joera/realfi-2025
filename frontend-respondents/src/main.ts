const color = "#7ccdbc";
import { injectFonts } from "@s3ntiment/shared/assets";
import { injectTokens, buildTokens } from "@s3ntiment/shared/assets";
import { injectGlobalStyles } from "@s3ntiment/shared/assets";
injectFonts();
buildTokens(color);
injectTokens(color);

injectGlobalStyles();


import { initRouter } from './router.js';
import { getServices } from './services.js';


export const clearLitStorage = () => {
  Object.keys(localStorage)
    .filter(key => key.startsWith('lit-') || key === 'litCapabilityDelegation')
    .forEach(key => localStorage.removeItem(key));
};


const main = async () => {
  // Initialize router

  clearLitStorage();

  const services = getServices();

  await services.initialize();
  // Verify initialization
  if (!services.isInitialized()) {
    throw new Error('Failed to initialize services');
  }

  await document.fonts.ready;

  initRouter(services);

}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main)
} else {
  main()
}

