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
import { onPageLoaded } from "./onpageload.js";





const main = async () => {
  // Initialize router

  const services = getServices();

  await services.initialize();
  // Verify initialization
  if (!services.isInitialized()) {
    throw new Error('Failed to initialize services');
  }

  await document.fonts.ready;

  initRouter(services);

  // if route is 

  onPageLoaded();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main)
} else {
  main()
}

