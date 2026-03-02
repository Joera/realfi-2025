// src/router.ts

import Navigo from 'navigo';
import { LandingController } from './controllers/landing.ctrlr.js';
import { IServices } from './services.js';
import { AboutController } from './controllers/about.ctrlr.js';
import { SurveyController } from './controllers/survey.ctrlr.js';
import { LogoutController } from './components/logout.ctrlr.js';

const router = new Navigo('/');

let currentController: any = null;

export const initRouter = (services: IServices) => {
  router
    .on('/', () => {
      if (currentController?.destroy) currentController.destroy();
      currentController = new LandingController(services);
      currentController.render();
    })
    .on('/surveys/:surveyId', function(match) {
      if (currentController?.destroy) currentController.destroy();      
      const surveyId = match?.params?.surveyId || match?.data?.surveyId || '';

      if (!surveyId) {
        router.navigate('/surveys');
        return;
      }
      
      currentController = new SurveyController(services, surveyId);
      currentController.render();
    })
    .on('/logout', () => {
      if (currentController?.destroy) currentController.destroy();
      currentController = new LogoutController(services);
      currentController.render();
    })
    .on('/about', () => {
      if (currentController?.destroy) currentController.destroy();
      currentController = new AboutController();
      currentController.render();
    })
    .notFound(() => {
      router.navigate('/');
    });

  router.resolve();
};

export { router };