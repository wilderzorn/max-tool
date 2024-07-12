import { useEffect, useState } from 'react';

let timer: NodeJS.Timeout | null = null;

function useRem(uiSize: number): number {
  const [remSize, setRemSize] = useState<number>(Math.floor((window.innerWidth * 100) / uiSize));

  useEffect(() => {
    setFontSize();
    const htmlElement = window.document.querySelector('html');
    htmlElement?.setAttribute('data-rem', 'true');
    window.addEventListener('resize', setFontSize);

    return () => {
      window.removeEventListener('resize', setFontSize);
      htmlElement?.removeAttribute('style');
      htmlElement?.removeAttribute('data-rem');
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  function setFontSize() {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      const remSize = Math.floor((window.innerWidth * 100) / uiSize);
      setRemSize(remSize);
      const htmlElement = window.document.querySelector('html');
      htmlElement?.setAttribute('style', `font-size: ${remSize}px;`);
    }, 200);
  }

  return remSize;
}

export default useRem;
