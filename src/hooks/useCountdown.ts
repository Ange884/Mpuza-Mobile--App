import { useEffect, useState } from 'react';

/** Live days/hours/minutes/seconds until `deadline` (ms timestamp), ticking every second. */
export function useCountdown(deadline: number) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const left = Math.max(0, deadline - now);
  return {
    days: Math.floor(left / 86_400_000),
    hours: Math.floor(left / 3_600_000) % 24,
    minutes: Math.floor(left / 60_000) % 60,
    seconds: Math.floor(left / 1000) % 60,
    expired: left === 0,
    /** Under 24 hours left. */
    urgent: left < 86_400_000,
  };
}
