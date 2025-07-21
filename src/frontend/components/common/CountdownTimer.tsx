import { useEffect, useState } from "react";

interface CountdownTimerProps {
  hours?: number;
  minutes?: number;
  seconds?: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  hours = 0,
  minutes = 52,
  seconds = 0,
}) => {
  const [time, setTime] = useState({ hours, minutes, seconds });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev.hours === 0 && prev.minutes === 0 && prev.seconds === 0) {
          clearInterval(timer);
          return prev;
        }

        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds -= 1;
        } else {
          if (minutes > 0) {
            minutes -= 1;
            seconds = 59;
          } else if (hours > 0) {
            hours -= 1;
            minutes = 59;
            seconds = 59;
          }
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (value: number) => value.toString().padStart(2, "0");

  return (
    <div className="flex items-center justify-center rounded-lg border bg-background-dark p-4 text-black shadow-md dark:bg-white dark:text-white">
      <div className="px-2 text-center">
        <p className="text-lg font-bold text-blue-500">
          {formatTime(time.hours)}
        </p>
        <p className="text-sm text-gray-500">Hours</p>
      </div>
      <span className="px-1 text-lg font-bold">:</span>
      <div className="px-2 text-center">
        <p className="text-lg font-bold text-blue-500">
          {formatTime(time.minutes)}
        </p>
        <p className="text-sm text-gray-500">Minutes</p>
      </div>
      <span className="px-1 text-lg font-bold">:</span>
      <div className="px-2 text-center">
        <p className="text-lg font-bold text-blue-500">
          {formatTime(time.seconds)}
        </p>
        <p className="text-sm text-gray-500">Seconds</p>
      </div>
    </div>
  );
};

export default CountdownTimer;
