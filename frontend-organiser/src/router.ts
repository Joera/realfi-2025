// src/router.ts

import Navigo from 'navigo';
import type { Match } from 'navigo';
import { LandingController } from './controllers/landing.ctrlr';
import { IServices } from './services/container';
import { ResultsController } from './controllers/results.ctrlr';
import { ResultController } from './controllers/result.ctrlr';

const router = new Navigo('/');

let currentController: any = null;

export const initRouter = (services: IServices) => {
  router
    .on('/', () => {
      if (currentController?.destroy) currentController.destroy();
      currentController = new LandingController(services);
      currentController.render();
    })
    .on('/results', () => {
      if (currentController?.destroy) currentController.destroy();
      currentController = new ResultsController(services);
      currentController.render();
    })
    .on('/result/:surveyId', function(match) {
      if (currentController?.destroy) currentController.destroy();
      
      const surveyId = match?.params?.surveyId || match?.data?.surveyId || '';

      if (!surveyId) {
        router.navigate('/results');
        return;
      }
      
      currentController = new ResultController(services, surveyId);
      currentController.render();
    })
    .notFound(() => {
      router.navigate('/');
    });

  router.resolve();
};

export { router };