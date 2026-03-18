export const removeSplash = () => {

  const splash = document.querySelector('#splash') as HTMLElement;
  if(splash) {
    splash.remove();
    console.log("removes splash")
  }

  const header = document.querySelector('#header') as HTMLElement;
  header!.style.display = "flex";

  const footer = document.querySelector('footer') as HTMLElement;
  footer!.style.display = "flex";

};