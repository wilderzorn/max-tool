import { useState, useEffect } from 'react';

const useThemeListener = (): string => {
  const [theme, setTheme] = useState<string>(() => {
    // 初始主题
    return document.documentElement.getAttribute('data-type-color') || 'light';
  });

  useEffect(() => {
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      mutations.forEach((mutation: MutationRecord) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-type-color'
        ) {
          const newTheme =
            document.documentElement.getAttribute('data-type-color') || 'light';
          if (newTheme !== theme) {
            setTheme(newTheme);
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-type-color'],
    });

    // 清理函数
    return () => {
      observer.disconnect();
    };
  }, [theme]);

  return theme;
};

export default useThemeListener;
