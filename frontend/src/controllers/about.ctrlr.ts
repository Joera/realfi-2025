export class AboutController {
  async render() {
    const app = document.querySelector('#app');
    if (app) {
      app.innerHTML = `
        <div class="about-page">
             

        <div>

              <svg id="b" xmlns="http://www.w3.org/2000/svg" data-name="Layer 3" viewBox="0 0 100 125" x="0px" y="0px"><path d="M61.83,37.58a6,6,0,1,0-6-6A6,6,0,0,0,61.83,37.58Zm0-9.52a3.51,3.51,0,1,1-3.51,3.51A3.51,3.51,0,0,1,61.83,28.06ZM38.17,37.58a6,6,0,1,0-6-6A6,6,0,0,0,38.17,37.58Zm0-9.52a3.51,3.51,0,1,1-3.51,3.51A3.52,3.52,0,0,1,38.17,28.06ZM25.09,50A35.16,35.16,0,0,0,45.17,81.67l28,13.2a1.24,1.24,0,0,0,.53.12,1.3,1.3,0,0,0,.67-.19,1.26,1.26,0,0,0,.58-1.06V16a11.32,11.32,0,0,0,5.47-9.74,1.25,1.25,0,0,0-2.5,0,8.84,8.84,0,0,1-5,8,81.4,81.4,0,0,0-46.43-.37,8.86,8.86,0,0,1-4.31-7.63,1.25,1.25,0,0,0-2.5,0A11.32,11.32,0,0,0,25.09,16ZM72.41,74.67H72a8.51,8.51,0,0,1-8.5-8.5V61.1a1.25,1.25,0,0,0-2.5,0v5.07a11,11,0,0,0,11,11h.46v14.6l-5.27-2.49A27.34,27.34,0,0,1,51.85,64.63V50.73a1,1,0,0,0-.05-.25l5.41-6.68a13,13,0,0,0,15.2-4.57ZM48.75,31.57A10.58,10.58,0,1,1,38.17,21,10.59,10.59,0,0,1,48.75,31.57ZM50,37.12a13.19,13.19,0,0,0,4.92,5.54l-4.82,6-4.29-6.45A13.18,13.18,0,0,0,50,37.12ZM61.83,21A10.58,10.58,0,1,1,51.25,31.57,10.59,10.59,0,0,1,61.83,21Zm10.58,2.92a13.16,13.16,0,0,0-6.49-4.76l6.47-2h0Zm-3.79-8.22-9.15,2.86a1.12,1.12,0,0,0-.44.25A13.12,13.12,0,0,0,50,26a13.12,13.12,0,0,0-9-7.23,1.12,1.12,0,0,0-.44-.25L30.44,15.4A78.47,78.47,0,0,1,68.62,15.69Zm-41,1.43h0l6.47,2a13.16,13.16,0,0,0-6.49,4.76ZM38.17,44.65a13,13,0,0,0,5.48-1.21l5.31,8a1.25,1.25,0,0,0,.39.37V64.63a29.84,29.84,0,0,0,7.4,19.75l-10.52-5A32.66,32.66,0,0,1,27.59,50V39.23A13.05,13.05,0,0,0,38.17,44.65Z"/><text x="0" y="115" fill="#000000" font-size="5px" font-weight="bold" font-family="'Helvetica Neue', Helvetica, Arial-Unicode, Arial, Sans-serif"></svg>

              
              <h1 class="cormorant-garamond">S<span>3</span>ntiment</h1>

              <h2 class="operator">anonymous voices, authentic insights</h2>

        </div>

           <div>

              <svg id="e" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="-180 272 250 312.5" style="enable-background:new -180 272 250 250;" xml:space="preserve"><path d="M-55,349.5c-26.2,0-47.5,21.3-47.5,47.5v47.5H-55c26.2,0,47.5-21.3,47.5-47.5S-28.8,349.5-55,349.5z M-55,437h-40v-40  c0-1.2,0.1-2.4,0.2-3.6c0.8-9.3,8.2-16.9,17.6-17.5c0.3,0,0.7,0,1.1,0c10.4,0,18.8,8,19.2,18.4c0.2,4.3-1,8.2-3.2,11.5  c2.4,1.4,4.2,3.3,5.2,5.5c1.1-2.2,2.9-4.1,5.2-5.5c-2.2-3.3-3.3-7.2-3.2-11.5c0.5-10.4,8.8-18.4,19.2-18.4c0.4,0,0.7,0,1.1,0  c9.3,0.5,16.7,8.1,17.6,17.5c0.1,1.2,0.2,2.4,0.2,3.6C-15,419-33,437-55,437z"/><circle cx="-70" cy="395.9" r="6.2"/><circle cx="-40" cy="395.9" r="6.2"/></svg>

              <h1 class="raleway">S<span>3</span>ntiment</h1>

              <h2 class="operator">anonymous voices, authentic insights</h2>

        </div>

        <div class="back">

          <div>

            <svg class="qr" xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 61 61" shape-rendering="crispEdges"><path fill="transparent" d="M0 0h61v61H0z"/><path stroke="#000000" d="M2 2.5h7m2 0h2m1 0h1m2 0h1m3 0h2m1 0h1m1 0h2m1 0h2m1 0h4m2 0h1m1 0h1m2 0h2m1 0h4m2 0h7M2 3.5h1m5 0h1m2 0h1m1 0h1m4 0h2m1 0h3m1 0h2m1 0h2m1 0h1m1 0h2m1 0h4m5 0h1m3 0h1m2 0h1m5 0h1M2 4.5h1m1 0h3m1 0h1m1 0h4m2 0h2m1 0h1m1 0h2m3 0h1m1 0h1m1 0h2m3 0h1m1 0h1m1 0h2m2 0h2m1 0h1m1 0h2m2 0h1m1 0h3m1 0h1M2 5.5h1m1 0h3m1 0h1m1 0h1m1 0h1m1 0h1m3 0h2m1 0h1m1 0h2m2 0h1m1 0h1m1 0h4m3 0h5m2 0h1m1 0h1m1 0h1m2 0h1m1 0h3m1 0h1M2 6.5h1m1 0h3m1 0h1m1 0h1m1 0h1m4 0h2m2 0h2m2 0h2m1 0h5m2 0h5m1 0h1m2 0h2m1 0h1m1 0h1m2 0h1m1 0h3m1 0h1M2 7.5h1m5 0h1m1 0h3m1 0h3m2 0h3m2 0h1m1 0h3m3 0h1m1 0h1m3 0h1m1 0h1m1 0h2m1 0h2m1 0h1m3 0h1m5 0h1M2 8.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M10 9.5h1m1 0h4m1 0h1m2 0h1m1 0h3m1 0h3m3 0h1m2 0h2m5 0h1m1 0h2m1 0h1m2 0h1M2 10.5h1m1 0h5m2 0h3m3 0h1m2 0h1m3 0h1m1 0h1m1 0h5m1 0h1m2 0h3m1 0h1m4 0h1m1 0h1m3 0h5M2 11.5h1m2 0h3m2 0h1m1 0h2m3 0h7m1 0h3m1 0h2m1 0h2m1 0h5m1 0h2m1 0h2m1 0h1m1 0h2m2 0h1m1 0h2M3 12.5h1m4 0h4m2 0h2m1 0h1m2 0h4m1 0h1m3 0h3m1 0h1m5 0h1m3 0h2m1 0h1m1 0h1m1 0h5m1 0h2M3 13.5h4m2 0h3m3 0h2m8 0h5m1 0h5m2 0h2m1 0h2m1 0h1m1 0h2m4 0h1m1 0h5M2 14.5h5m1 0h1m2 0h6m1 0h1m1 0h1m2 0h1m1 0h2m3 0h1m4 0h3m1 0h2m3 0h2m2 0h2m1 0h1m1 0h1m3 0h2M2 15.5h1m6 0h4m2 0h1m3 0h4m3 0h1m2 0h2m1 0h2m4 0h1m2 0h3m3 0h1m2 0h1m1 0h2m2 0h1m1 0h1M2 16.5h3m1 0h3m2 0h1m2 0h1m1 0h7m2 0h3m2 0h2m1 0h1m1 0h6m1 0h3m3 0h1m1 0h1m2 0h1m2 0h2M10 17.5h1m1 0h1m1 0h1m1 0h3m1 0h3m3 0h1m2 0h1m1 0h5m1 0h2m1 0h5m1 0h5m3 0h5M3 18.5h1m3 0h2m1 0h2m1 0h1m1 0h3m1 0h4m2 0h3m2 0h1m1 0h1m2 0h1m1 0h1m2 0h1m2 0h3m1 0h1m2 0h3m4 0h2M3 19.5h1m1 0h2m4 0h1m1 0h3m1 0h2m2 0h1m1 0h2m2 0h1m1 0h1m1 0h1m1 0h3m2 0h2m2 0h6m1 0h2m2 0h3M2 20.5h1m1 0h1m2 0h7m1 0h1m4 0h1m3 0h3m1 0h1m3 0h2m1 0h2m2 0h1m1 0h1m6 0h1m2 0h3m2 0h1m1 0h1M6 21.5h2m2 0h1m1 0h1m1 0h1m1 0h4m2 0h4m1 0h1m2 0h3m1 0h2m5 0h2m1 0h1m1 0h1m2 0h2m3 0h2m1 0h1M3 22.5h2m1 0h1m1 0h1m2 0h2m6 0h3m1 0h3m1 0h1m1 0h1m2 0h2m1 0h1m1 0h2m3 0h1m4 0h1m1 0h1m1 0h1m4 0h1M2 23.5h1m1 0h2m1 0h1m1 0h2m2 0h1m1 0h1m4 0h2m4 0h1m3 0h2m1 0h1m4 0h4m2 0h4m1 0h3m1 0h1m3 0h2M3 24.5h2m1 0h1m1 0h2m2 0h1m1 0h2m2 0h2m1 0h2m2 0h1m1 0h3m2 0h1m1 0h6m3 0h1m1 0h1m2 0h2m1 0h1m1 0h1m2 0h1M3 25.5h1m3 0h1m2 0h9m2 0h2m3 0h1m3 0h2m3 0h3m1 0h3m1 0h2m1 0h1m2 0h1m1 0h1m3 0h3M2 26.5h2m3 0h2m1 0h1m1 0h2m1 0h3m1 0h2m4 0h1m1 0h3m1 0h1m2 0h2m2 0h2m2 0h1m2 0h1m1 0h1m1 0h2m2 0h3m1 0h1M3 27.5h1m1 0h3m3 0h1m1 0h1m2 0h1m2 0h2m5 0h2m1 0h5m2 0h4m1 0h5m2 0h1m2 0h1m3 0h1m1 0h2M2 28.5h1m1 0h8m3 0h2m1 0h3m1 0h2m1 0h8m2 0h3m1 0h2m1 0h1m3 0h1m2 0h8M4 29.5h1m1 0h1m3 0h2m2 0h5m5 0h1m3 0h1m3 0h2m1 0h2m2 0h4m1 0h1m2 0h1m2 0h1m3 0h4M6 30.5h1m1 0h1m1 0h2m1 0h1m3 0h1m4 0h1m1 0h2m2 0h1m1 0h1m1 0h1m1 0h2m1 0h4m3 0h3m1 0h3m1 0h1m1 0h3m1 0h1M2 31.5h3m1 0h1m3 0h1m2 0h2m4 0h1m1 0h1m1 0h1m2 0h1m1 0h1m3 0h2m2 0h2m4 0h1m1 0h1m4 0h2m3 0h3m1 0h1M2 32.5h2m2 0h5m2 0h1m2 0h3m2 0h1m1 0h2m2 0h7m4 0h4m2 0h1m2 0h8m1 0h2M5 33.5h3m4 0h2m2 0h4m1 0h1m1 0h6m2 0h1m2 0h1m1 0h1m1 0h2m1 0h3m1 0h2m2 0h2m1 0h1m3 0h2M2 34.5h3m3 0h4m1 0h1m1 0h2m1 0h1m1 0h1m2 0h1m2 0h1m5 0h2m1 0h1m4 0h1m3 0h1m5 0h1m3 0h2m2 0h1M2 35.5h1m3 0h2m1 0h1m5 0h2m4 0h1m1 0h3m1 0h2m3 0h2m3 0h2m4 0h1m5 0h1m1 0h1m1 0h1m2 0h1M3 36.5h1m4 0h5m1 0h4m3 0h4m6 0h3m1 0h2m1 0h7m2 0h2m1 0h2m6 0h1M2 37.5h2m8 0h2m2 0h1m2 0h1m1 0h1m1 0h3m1 0h2m1 0h2m2 0h1m2 0h2m2 0h3m1 0h2m2 0h1m2 0h3m1 0h1M5 38.5h1m1 0h2m2 0h1m3 0h1m4 0h1m1 0h2m2 0h4m2 0h2m1 0h2m11 0h1m3 0h1m1 0h2M2 39.5h6m1 0h2m1 0h2m1 0h4m2 0h1m1 0h3m1 0h1m1 0h1m2 0h2m3 0h2m2 0h5m1 0h1m2 0h2m1 0h1m2 0h2M2 40.5h1m5 0h1m1 0h1m1 0h1m1 0h3m2 0h1m1 0h2m1 0h1m1 0h1m1 0h2m1 0h2m1 0h1m1 0h3m3 0h2m1 0h1m2 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1M2 41.5h1m6 0h1m1 0h1m4 0h2m1 0h3m1 0h2m4 0h2m3 0h2m4 0h4m1 0h3m1 0h1m1 0h1m3 0h1m1 0h1M5 42.5h6m2 0h5m4 0h1m4 0h2m2 0h1m1 0h1m2 0h4m2 0h4m4 0h1m1 0h1m4 0h1M2 43.5h1m4 0h1m2 0h3m3 0h1m1 0h2m2 0h2m1 0h2m2 0h2m1 0h1m1 0h2m1 0h2m1 0h2m1 0h3m4 0h1m1 0h1m2 0h4M3 44.5h1m1 0h1m2 0h2m5 0h1m1 0h7m1 0h1m1 0h2m2 0h1m1 0h2m1 0h1m1 0h1m8 0h2m1 0h1m2 0h2m1 0h1M2 45.5h2m5 0h4m1 0h1m1 0h1m4 0h1m1 0h1m2 0h3m4 0h1m7 0h1m1 0h2m1 0h1m1 0h3m1 0h6M5 46.5h1m2 0h3m1 0h2m1 0h1m2 0h1m1 0h4m1 0h1m3 0h4m1 0h1m3 0h1m2 0h2m2 0h1m1 0h1m4 0h1m1 0h2m2 0h1M4 47.5h2m1 0h1m1 0h3m1 0h2m1 0h2m1 0h2m1 0h3m1 0h1m1 0h1m2 0h3m1 0h2m1 0h2m1 0h1m2 0h1m3 0h2m7 0h2M2 48.5h1m1 0h1m2 0h4m1 0h1m1 0h1m1 0h1m3 0h3m1 0h2m1 0h1m7 0h1m2 0h1m1 0h2m1 0h1m1 0h1m1 0h1m1 0h2m2 0h1m1 0h2M2 49.5h5m2 0h1m1 0h1m1 0h1m1 0h1m1 0h4m4 0h2m1 0h2m2 0h1m1 0h2m1 0h1m4 0h1m2 0h1m2 0h1m1 0h3m2 0h2M8 50.5h2m1 0h7m2 0h1m1 0h1m2 0h1m2 0h7m2 0h3m1 0h1m3 0h13M10 51.5h5m1 0h1m2 0h1m1 0h2m1 0h1m1 0h1m1 0h1m3 0h1m2 0h3m3 0h1m1 0h1m5 0h2m3 0h1m2 0h2M2 52.5h7m2 0h2m3 0h2m2 0h1m1 0h2m2 0h3m1 0h1m1 0h1m1 0h1m2 0h1m1 0h6m3 0h1m1 0h1m1 0h1m1 0h3M2 53.5h1m5 0h1m1 0h1m1 0h1m1 0h1m4 0h1m1 0h1m2 0h1m1 0h1m1 0h1m3 0h1m1 0h1m3 0h2m1 0h3m1 0h4m1 0h1m3 0h1m1 0h1m1 0h1M2 54.5h1m1 0h3m1 0h1m1 0h3m2 0h1m1 0h1m7 0h9m3 0h1m1 0h2m3 0h1m4 0h7m1 0h1M2 55.5h1m1 0h3m1 0h1m1 0h1m2 0h1m2 0h3m4 0h2m1 0h1m1 0h3m1 0h1m2 0h1m2 0h2m3 0h1m2 0h1m2 0h1m1 0h1m1 0h1M2 56.5h1m1 0h3m1 0h1m1 0h1m2 0h1m3 0h5m3 0h2m4 0h1m1 0h1m1 0h3m2 0h1m1 0h4m4 0h2m2 0h1m1 0h1M2 57.5h1m5 0h1m2 0h2m1 0h2m1 0h1m2 0h3m1 0h1m1 0h2m1 0h1m2 0h1m1 0h2m1 0h2m2 0h6m6 0h1m2 0h1M2 58.5h7m1 0h2m1 0h3m1 0h1m1 0h2m1 0h2m2 0h1m1 0h4m1 0h1m2 0h2m3 0h1m2 0h1m2 0h1m2 0h4m1 0h1m1 0h1"/></svg>

            <p>
You've received a single-use invitation to participate in a web3 onboarding survey, conducted during the RealFi Hack 2025, by Funding The Commons.
Your responses remain completely private through blind computation powered by Nillion—no person can read your individual answers.
Human Network transforms your personal security questions into cryptographic keys, making secure participation simple and passwordless.

            </p>

          </div>

          <h3>Don't worry, be honest!</h3>

        </div>

     
        
        
        </div>
      `;
    }
  }
}