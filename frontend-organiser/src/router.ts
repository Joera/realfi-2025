// src/router.ts

import Navigo from 'navigo';
import type { Match } from 'navigo';
import { LandingController } from './controllers/landing.ctrlr';
import { IServices } from './services/services.ts';
import { OverviewController } from './controllers/overview.ctrlr.ts';
import { SurveyController } from './controllers/survey.ctrlr.ts';
import { NewSurveyController } from './controllers/new.ctrlr.ts';
import { LogoutController } from './controllers/logout.ctrlr.ts';
import { AccountController } from './controllers/account.ctrlr.ts';
import { PoolController } from './controllers/pool.ctrlr.ts';
import { BatchController } from './controllers/batch.ctrlr.ts';

const router = new Navigo('/');

let currentController: any = null;

export const initRouter = (services: IServices) => {
  router
    .on('/', () => {
      // if (currentController?.destroy) currentController.destroy();
      // currentController = new LandingController(services);
      // currentController.render();
      router.navigate('/surveys');
    })
    .on('/new', () => {
      if (currentController?.destroy) currentController.destroy();
      currentController = new NewSurveyController(services);
      currentController.render();
    })
    .on('/surveys', () => {
      if (currentController?.destroy) currentController.destroy();
      currentController = new OverviewController(services);
      currentController.render();
    })
    .on('/survey/:surveyId', function(match) {
      if (currentController?.destroy) currentController.destroy();      
      const surveyId = match?.params?.surveyId || match?.data?.surveyId || '';

      if (!surveyId) {
        router.navigate('/surveys');
        return;
      }
      
      currentController = new SurveyController(services, surveyId);
      currentController.render();
    })
    .on('/pool/:poolId', function(match) {
      if (currentController?.destroy) currentController.destroy();      
      const poolId = match?.params?.poolId || match?.data?.poolId || '';

      if (!poolId) {
        router.navigate('/surveys');
        return;
      }
      
      currentController = new PoolController(services, poolId);
      currentController.render();
    })
    .on('/batch/:poolId/:batchId', function(match) {
      if (currentController?.destroy) currentController.destroy();      
      const batchId = match?.params?.batchId || match?.data?.batchId || '';
      const poolId = match?.params?.poolId || match?.data?.poolId || '';

      if (!batchId) {
        router.navigate(`/pool/${poolId}`);
        return;
      }
      
      currentController = new BatchController(services, poolId, batchId);
      currentController.render();
    })
    .on('/logout', () => {
      if (currentController?.destroy) currentController.destroy();
      currentController = new LogoutController(services);
      currentController.render();
    })
    .on('/account', () => {
      if (currentController?.destroy) currentController.destroy();
      currentController = new AccountController(services);
      currentController.render();
    })
    .notFound(() => {
      router.navigate('/');
    });

  router.resolve();
};

export { router };