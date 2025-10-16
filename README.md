# realfi-2025

## Video

https://s3ntiment.composible.io/video.mp4

## Slides

https://s3ntiment.composible.io/slides.pdf

## Demo

* Scan one of these QR codes in the qrs-to-demo folder. Please be aware the card can be used only once. If ued, try one of the others. Sorry, we can't hand them to you personally. 
* Onboard, fill out survey
* Check results here: https://683432d9-95b2-450a-9a5e-79913a7cb6ba.nillionusercontent.com/api/survey-results/mina_v2",

## Info per Bounty: 

#### Build RealFi
S3ntiment uses Human Tech's OPRF and Nillion's blind computation for truly anonymous surveys. Scan a QR card, submit responses processed privately—only aggregated results are ever visible. Tested at a real event, proving privacy-first feedback can be easy in use, secure, and fraud-proof

#### Privacy Meets Identity
Human Network's OPRF generates secp256k1 keys from card nullifier + user memory—creating burner wallets without stored private keys. These keys function as Nillion DIDs for anonymous survey submissions and Safe signers for future use. Users gain cryptographic identity and agency without surveillance—the issuer cannot track who uses which card. 

qr code generation: https://github.com/Joera/realfi-2025/blob/50a5519fa637c2445cca1a1a9a63b4b61fc7ac8f/cards%2Bcontracts/src/create_batch.ts#L47
card validator contract: https://github.com/Joera/realfi-2025/blob/50a5519fa637c2445cca1a1a9a63b4b61fc7ac8f/cards%2Bcontracts/contracts/card-validator.sol#L4
webcomponent with security questions: https://github.com/Joera/realfi-2025/blob/d179b3c15d50ed68e6b6d07e9efcd7fe0c3d5288/frontend-respondents/src/components/security-questions.ts#L20
format low enthropy input: https://github.com/Joera/realfi-2025/blob/d179b3c15d50ed68e6b6d07e9efcd7fe0c3d5288/frontend-respondents/src/controllers/landing.ctrlr.ts#L193
call human network to get secp256k1 key: https://github.com/Joera/realfi-2025/blob/d179b3c15d50ed68e6b6d07e9efcd7fe0c3d5288/frontend-respondents/src/oprf.factory.ts#L3
we deployed a human network signer behind revere proxy on https://oprf.transport-union.dev

#### Secure Onboarding to RealFi
S3ntiment demonstrates frictionless Web3 onboarding via Human Network's OPRF. Scan card nullifier + answer question = instant secp256k1 key. No apps, seed phrases, or KYC. Creates Nillion DID and Safe signer. Physical card + memory = secure access without barriers.

qr code generation: https://github.com/Joera/realfi-2025/blob/50a5519fa637c2445cca1a1a9a63b4b61fc7ac8f/cards%2Bcontracts/src/create_batch.ts#L47
card validator contract: https://github.com/Joera/realfi-2025/blob/50a5519fa637c2445cca1a1a9a63b4b61fc7ac8f/cards%2Bcontracts/contracts/card-validator.sol#L4
webcomponent with security questions: https://github.com/Joera/realfi-2025/blob/d179b3c15d50ed68e6b6d07e9efcd7fe0c3d5288/frontend-respondents/src/components/security-questions.ts#L20
format low enthropy input: https://github.com/Joera/realfi-2025/blob/d179b3c15d50ed68e6b6d07e9efcd7fe0c3d5288/frontend-respondents/src/controllers/landing.ctrlr.ts#L193
call human network to get secp256k1 key: https://github.com/Joera/realfi-2025/blob/d179b3c15d50ed68e6b6d07e9efcd7fe0c3d5288/frontend-respondents/src/oprf.factory.ts#L3
we deployed a human network signer behind revere proxy on https://oprf.transport-union.dev

#### Private Data Manager (PDM)
S3ntiment uses User Owned Collections on Nillion. Survey responses are stored in collections owned by the user. Survey owners access these through granted permissions within Nillion's TEE for blind aggregation—never seeing raw data. Users can revisit and edit their responses using the same card + memory, demonstrating full control over their private data.

generic NilDB collection: https://github.com/Joera/realfi-2025/blob/d179b3c15d50ed68e6b6d07e9efcd7fe0c3d5288/nilcc-backend/src/create_collection.ts#L3
NilDB store method: https://github.com/Joera/realfi-2025/blob/d179b3c15d50ed68e6b6d07e9efcd7fe0c3d5288/frontend-respondents/src/services/nilldb.service.ts#L83
NilDB retrieve previous answers method: https://github.com/Joera/realfi-2025/blob/d179b3c15d50ed68e6b6d07e9efcd7fe0c3d5288/frontend-respondents/src/services/nilldb.service.ts#L183
NilDB update method: https://github.com/Joera/realfi-2025/blob/d179b3c15d50ed68e6b6d07e9efcd7fe0c3d5288/frontend-respondents/src/services/nilldb.service.ts#L119
Tabulate survey responses inside NilCC: https://github.com/Joera/realfi-2025/blob/d179b3c15d50ed68e6b6d07e9efcd7fe0c3d5288/nilcc-backend/src/nildb.service.ts#L141
Request aggregated results: https://github.com/Joera/realfi-2025/blob/d179b3c15d50ed68e6b6d07e9efcd7fe0c3d5288/nilcc-backend/src/main.ts#L55
or curl https://9b718d9c-08a6-45b3-9300-4ba00315444b.nillionusercontent.com/api/survey-results/mina-v2 | jq


#### Combined Privacy + DeFi App
S3ntiment leverages Nillion's blind computation network to create truly anonymous surveys where individual responses remain completely private. Each response is encrypted and stored in User Owned Collections, processed within Nillion's TEE, with only aggregated results ever becoming visible—not even the survey creator can see raw data.

generic NilDB collection: https://github.com/Joera/realfi-2025/blob/d179b3c15d50ed68e6b6d07e9efcd7fe0c3d5288/nilcc-backend/src/create_collection.ts#L3
NilDB store method: https://github.com/Joera/realfi-2025/blob/d179b3c15d50ed68e6b6d07e9efcd7fe0c3d5288/frontend-respondents/src/services/nilldb.service.ts#L83
NilDB retrieve previous answers method: https://github.com/Joera/realfi-2025/blob/d179b3c15d50ed68e6b6d07e9efcd7fe0c3d5288/frontend-respondents/src/services/nilldb.service.ts#L183
NilDB update method: https://github.com/Joera/realfi-2025/blob/d179b3c15d50ed68e6b6d07e9efcd7fe0c3d5288/frontend-respondents/src/services/nilldb.service.ts#L119
Tabulate survey responses inside NilCC: https://github.com/Joera/realfi-2025/blob/d179b3c15d50ed68e6b6d07e9efcd7fe0c3d5288/nilcc-backend/src/nildb.service.ts#L141
Request aggregated results: https://github.com/Joera/realfi-2025/blob/d179b3c15d50ed68e6b6d07e9efcd7fe0c3d5288/nilcc-backend/src/main.ts#L55
or curl https://9b718d9c-08a6-45b3-9300-4ba00315444b.nillionusercontent.com/api/survey-results/mina-v2 | jq

#### Privacy-Preserving AI
On the last day we aim to implement NillAI within NILCC to create a summary from the survey result, and/or summarize responses to open questions that have been submitted as plaintext. 

Formatting the request: https://github.com/Joera/realfi-2025/blob/d179b3c15d50ed68e6b6d07e9efcd7fe0c3d5288/nilcc-backend/src/main.ts#L90
NilAI Service: https://github.com/Joera/realfi-2025/blob/d179b3c15d50ed68e6b6d07e9efcd7fe0c3d5288/nilcc-backend/src/nillai.service.ts#L3






The demo was run with a fixed 
