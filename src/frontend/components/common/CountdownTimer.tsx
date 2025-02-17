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
    <div className="flex items-center justify-center p-4 bg-background-dark dark:bg-white text-black dark:text-white rounded-lg shadow-md border">
      <div className="text-center px-2">
        <p className="text-blue-500 text-lg font-bold">{formatTime(time.hours)}</p>
        <p className="text-gray-500 text-sm">Hours</p>
      </div>
      <span className="text-lg font-bold px-1">:</span>
      <div className="text-center px-2">
        <p className="text-blue-500 text-lg font-bold">{formatTime(time.minutes)}</p>
        <p className="text-gray-500 text-sm">Minutes</p>
      </div>
      <span className="text-lg font-bold px-1">:</span>
      <div className="text-center px-2">
        <p className="text-blue-500 text-lg font-bold">{formatTime(time.seconds)}</p>
        <p className="text-gray-500 text-sm">Seconds</p>
      </div>
    </div>
  );
};

export default CountdownTimer;
