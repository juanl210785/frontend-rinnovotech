import { useState, useEffect } from 'react';

export const useCountdown = (initialSeconds = 1200, onExpire = null) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive || secondsLeft <= 0) {
      if (secondsLeft === 0 && onExpire) {
        onExpire();
      }
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, secondsLeft, onExpire]);

  const restart = (newSeconds = initialSeconds) => {
    setSecondsLeft(newSeconds);
    setIsActive(true);
  };

  const pause = () => setIsActive(false);
  const resume = () => setIsActive(true);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    secondsLeft,
    formattedTime,
    isExpired: secondsLeft === 0,
    restart,
    pause,
    resume,
  };
};
