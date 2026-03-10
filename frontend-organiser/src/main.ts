
const color = "#b3cfe8";
import { injectFonts } from "@s3ntiment/shared/assets";
import { injectTokens, buildTokens } from "@s3ntiment/shared/assets";
import { injectGlobalStyles } from "@s3ntiment/shared/assets";
injectFonts();
buildTokens(color);
injectTokens(color);

injectGlobalStyles();

import { initRouter } from './router';
import { getServices } from './services/services';
import { authenticate } from "./factories/auth.factory";

const onPagePainted = () => {

  const header = document.querySelector('header') as HTMLElement;
  header!.style.display = "flex";
};


const main = async () => {

  const services = getServices();
  await services.initialize();
  // Initialize router

  await authenticate(services);
  initRouter(services);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main)
} else {
  main()
}

window.addEventListener('load', onPagePainted);

