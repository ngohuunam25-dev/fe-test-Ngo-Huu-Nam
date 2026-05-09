import React from 'react';

const useDebounceInput = (func: (value: string) => void, delay: number) => {
  const timeoutRef = React.useRef<number | null>(null);
  const [inputValue, setInputValue] = React.useState('');

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      setInputValue(value);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        func(value);
      }, delay);
    },
    [func, delay]
  );

  return { inputValue, handleChange };
};

export default useDebounceInput;
