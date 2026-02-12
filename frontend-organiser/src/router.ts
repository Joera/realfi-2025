// src/router.ts

import Navigo from 'navigo';
import type { Match } from 'navigo';
import { LandingController } from './controllers/landing.ctrlr';
import { IServices } from './services/container';
import { ResultsController } from './controllers/results.ctrlr';
import { ResultController } from './controllers/result.ctrlr';
import { NewSurveyController } from './controllers/new.ctrlr.ts';

const router = new Navigo('/');

let currentController: any = null;

export const initRouter = (services: IServices) => {
  router
    .on('/', () => {
      if (currentController?.destroy) currentController.destroy();
      currentController = new LandingController(services);
      currentController.render();
    })
    .on('/new', () => {
      if (currentController?.destroy) currentController.destroy();
      currentController = new NewSurveyController(services);
      currentController.render();
    })
    .on('/surveys', () => {
      if (currentController?.destroy) currentController.destroy();
      currentController = new ResultsController(services);
      currentController.render();
    })
    .on('/survey/:surveyId', function(match) {
      if (currentController?.destroy) currentController.destroy();
      
      const surveyId = match?.params?.surveyId || match?.data?.surveyId || '';

      if (!surveyId) {
        router.navigate('/surveys');
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