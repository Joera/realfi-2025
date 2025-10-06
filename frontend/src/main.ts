import './styles/main.scss';
import { initRouter } from './router';

const main = async () => {
  // Initialize router
  initRouter();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main)
} else {
  main()
}
