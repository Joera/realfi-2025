import './styles/main.scss';
import { initRouter } from './router';
import { getServices } from './services/services';

const onPagePainted = () => {

  const icon = document.querySelector('header') as HTMLElement;
  icon!.style.display = "flex";
  
  // const nav = document.getElementsByTagName('nav')[0];
  // nav.style.display = "flex";

};


const main = async () => {

  const services = getServices();
  await services.initialize();
  // Initialize router
  initRouter(services);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main)
} else {
  main()
}

window.addEventListener('load', onPagePainted);

