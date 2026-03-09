export const removeSplash = () => {

  const splash = document.querySelector('#splash') as HTMLElement;
  if(splash) {
    splash.remove();
    console.log("removes splash")
  }

  const header = document.querySelector('#header') as HTMLElement;
  console.log(header);
  header!.style.display = "flex";

};