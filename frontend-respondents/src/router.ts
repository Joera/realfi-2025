// src/router.ts

import Navigo from 'navigo';
import { LandingController } from './controllers/landing.ctrlr';
import { IServices } from './services/container';
// import { AccountController } from './controllers/account.ctrlr';
// import { AboutController } from './controllers/about.ctrlr';

const router = new Navigo('/');

let currentController: any = null;

export const initRouter = (services: IServices) => {
  router
    .on('/', () => {
      if (currentController?.destroy) currentController.destroy();
      currentController = new LandingController(services);
      currentController.render();
    })
    // .on('/account', () => {
    //   if (currentController?.destroy) currentController.destroy();
    //   currentController = new AccountController();
    //   currentController.render();
    // })
    // .on('/about', () => {
    //   if (currentController?.destroy) currentController.destroy();
    //   currentController = new AboutController();
    //   currentController.render();
    // })
    .notFound(() => {
      router.navigate('/');
    });

  router.resolve();
};

export { router };