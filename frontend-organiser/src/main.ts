import './styles/main.scss';
import { initRouter } from './router';

const onPagePainted = () => {

  const icon = document.querySelector('header svg') as HTMLElement;
  icon!.style.display = "flex";
  
  // const nav = document.getElementsByTagName('nav')[0];
  // nav.style.display = "flex";

};


const main = async () => {
  // Initialize router
  initRouter();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main)
} else {
  main()
}

window.addEventListener('load', onPagePainted);

