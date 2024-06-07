import { useState, useEffect } from 'react';

let timer = null;

function useRem(uiSize) {
  const [remSize, setRemSize] = useState(Math.floor((window.innerWidth * 100) / uiSize));
  useEffect(() => {
    setFontSize();
    window.document.querySelector('html').setAttribute('data-rem', 'true');
    window.addEventListener('resize', setFontSize);
    return () => {
      window.removeEventListener('resize', setFontSize);
      window.document.querySelector('html').removeAttribute('style');
      window.document.querySelector('html').removeAttribute('data-rem');
      timer && clearTimeout(timer);
    };
  }, []);

  function setFontSize() {
    // timer && clearTimeout(timer)
    timer = setTimeout(function () {
      const remSize = Math.floor((window.innerWidth * 100) / uiSize);
      setRemSize(remSize);
      window.document.querySelector('html').setAttribute('style', `font-size: ${remSize}px;`);
    }, 200);
  }

  return remSize;
}

export default useRem;
