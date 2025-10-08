import './styles/main.scss';
import { initRouter } from './router';

const main = async () => {
  // Initialize router
  initRouter();
}

document.addEventListener('survey-complete', (event:any ) => {
  console.log('Survey completed!');
  console.log('Answers:', event.detail.answers);
  console.log('Timestamp:', event.detail.timestamp);
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main)
} else {
  main()
}
