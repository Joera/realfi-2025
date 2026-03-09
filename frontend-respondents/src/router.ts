// src/router.ts

import Navigo from 'navigo';
import { LandingController } from './controllers/landing.ctrlr.js';
import { IServices } from './services.js';
import { AboutController } from './controllers/about.ctrlr.js';
import { SurveyController } from './controllers/survey.ctrlr.js';
import { LogoutController } from './components/logout.ctrlr.js';
import { CardData } from '@s3ntiment/shared';
import { Card, parseCardURL } from './card.factory.js';
import { base } from 'viem/chains';

const router = new Navigo('/');

let currentController: any = null;

export const initRouter = (services: IServices) => {

    router.on('/', 
      () => {
        if (currentController?.destroy) currentController.destroy();
        currentController = new LandingController(services);
        // currentController.render();
      },
      {
        before(done, match) {
          (async () => {
            const cardData: CardData | null = await parseCardURL();
            if (cardData == null) {
              // no card
              done();
            } else {
              const card = new Card(cardData);
              
              const cardIsUsed = await card.isUsed(services);
              if (cardIsUsed) {
                done();
              } else {
                await services.waap.login(base);
                const input = await services.waap.signMessage(`Sign in with your unlinkable account for survey ${cardData.surveyId}`);
                const key = await services.oprf.getSecp256k1(input);
                await services.account.updateSignerWithKey(key);
                await card.validate(services)
                // register
                done();
              }
            }
          })();
        }
      }
    );

//   router
//     .on('/', () => {
      
//     })
//     .before((done, match) => {
//       if (!isAuthenticated()) {
//         router.navigate('/login');
//         done(false); // false cancels the navigation
//       } else {
//         done(); // proceed
//       }
//     })
//     .on('/surveys/:surveyId', function(match) {
//       if (currentController?.destroy) currentController.destroy();      
//       const surveyId = match?.params?.surveyId || match?.data?.surveyId || '';

//       if (!surveyId) {
//         router.navigate('/surveys');
//         return;
//       }
      
//       currentController = new SurveyController(services, surveyId);
//       currentController.render();
//     })
//     .on('/logout', () => {
//       if (currentController?.destroy) currentController.destroy();
//       currentController = new LogoutController(services);
//       currentController.render();
//     })
//     .on('/about', () => {
//       if (currentController?.destroy) currentController.destroy();
//       currentController = new AboutController();
//       currentController.render();
//     })
//     .notFound(() => {
//       router.navigate('/');
//     });

  router.resolve();
};

export { router };