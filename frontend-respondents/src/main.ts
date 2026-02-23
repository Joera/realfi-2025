import './styles/main.scss';
import { initRouter } from './router.js';
import { getServices } from './services.js';


const onPagePainted = () => {

  console.log("paint");
  const header = document.querySelector('#header') as HTMLElement;
  console.log(header);
  header!.style.display = "flex";
  
  // const nav = document.getElementsByTagName('nav')[0];
  // nav.style.display = "flex";

};


const main = async () => {
  // Initialize router

  const services = getServices();
  await services.initialize();
  
  // Verify initialization
  if (!services.isInitialized()) {
    throw new Error('Failed to initialize services');
  }
  
  initRouter(services);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main)
} else {
  main()
}

window.addEventListener('load', onPagePainted);
