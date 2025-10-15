// src/router.ts

import Navigo from 'navigo';
import { LandingController } from './controllers/landing.ctrlr';

const router = new Navigo('/');

let currentController: any = null;

export const initRouter = () => {
  router
    .on('/', () => {
      if (currentController?.destroy) currentController.destroy();
      currentController = new LandingController();
      currentController.render();
    })
    .notFound(() => {
      router.navigate('/');
    });

  router.resolve();
};

export { router };