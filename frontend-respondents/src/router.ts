// src/router.ts

import Navigo from 'navigo';
import { IServices } from './services.js';
import { AboutController } from './controllers/about.ctrlr.js';
import { SurveyController } from './controllers/survey.ctrlr.js';
import { LogoutController } from './components/logout.ctrlr.js';
import { CardData } from '@s3ntiment/shared';
import { Card, parseCardURL } from './card.factory.js';
import { base } from 'viem/chains';
import { InvalidCardController } from './controllers/invalid-card-ctrlr.js';
import { UsedCardController } from './controllers/used-card-ctrlr.js';
import surveyStore from 's3ntiment-contracts/deployments/base/S3ntimentSurveyStore.json' with { type: 'json' };
import { authenticate, hasParticipatingAccount } from './auth.factory.js';
import { removeSplash } from './onpageload.js';
import { AuthController } from './controllers/auth-ctrlr.js';
import { CompletedController } from './controllers/completed-ctrlr.js';



const router = new Navigo('/');

let currentController: any = null;

export const initRouter = (services: IServices) => {

    router
      .on('/', 
        () => {
          if (currentController?.destroy) currentController.destroy();
          currentController = new AuthController(services);
          removeSplash();
          currentController.render();
        },
        {
          before(done, match) {
            (async () => {
              const cardData: CardData | null = await parseCardURL();
              if (cardData == null) {
                router.navigate('/invalid-card');
                done();
              } else {

                const card = new Card(cardData);         
                const cardIsUsed = await card.isUsed(services);

                if (cardIsUsed) {
                  router.navigate(`/used-card/${card.surveyId}`);
                  done();
                } else {
                  done();
                }
              }
            })();
          }
        }
      ).on('/invalid-card',
        () => {
          if (currentController?.destroy) currentController.destroy();
          currentController = new InvalidCardController(services);
          removeSplash();
          currentController.render();
        }
      )
      .on('/used-card/:surveyId',
        (match: any) => {
          if (currentController?.destroy) currentController.destroy();
          const surveyId = match?.params?.surveyId || match?.data?.surveyId || '';
          currentController = new UsedCardController(services, surveyId);
          removeSplash();
          currentController.render();
        }
      )
      .on('/surveys/:surveyId', 
        (match: any) => {
          if (currentController?.destroy) currentController.destroy();      
          const surveyId = match?.params?.surveyId || match?.data?.surveyId || '';
          currentController = new SurveyController(services, surveyId);
          removeSplash();
          currentController.render();
        },
        {
          before(done,match) {
            (async () => {

              const surveyId = match?.params?.surveyId || match?.data?.surveyId || '';
              if (!surveyId) {
                router.navigate('/surveys');
                done();
              }
         
              // store in session // or LS
              let isParticipant = await hasParticipatingAccount(services, surveyId);
              if(!isParticipant) {
                isParticipant = await authenticate(services, surveyId)  // separate route // with controller + spinner ? 
              }
              if (isParticipant) {
                console.log("isParticipant")
                done()
              } else {
                router.navigate('/invalid-card');
                done()
              }
            })();
          }
        }
      )
      .on('/complete/:surveyId',
        (match: any) => {
          if (currentController?.destroy) currentController.destroy();
          const surveyId = match?.params?.surveyId || match?.data?.surveyId || '';
          currentController = new CompletedController(services, surveyId);
          removeSplash();
          currentController.render();
        }
      )

        

       
        


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