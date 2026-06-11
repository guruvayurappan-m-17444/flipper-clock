import { useState, useEffect, useRef } from 'react';

export default function FlipDigit({ value }) {
  const currentRef = useRef(value);
  const [displayCurrent, setDisplayCurrent] = useState(value);
  const [displayPrev, setDisplayPrev] = useState(value);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (value === currentRef.current) return;

    const oldValue = currentRef.current;
    currentRef.current = value;

    setDisplayPrev(oldValue);
    setFlipping(true);

    const timer = setTimeout(() => {
      setDisplayCurrent(value);
      setFlipping(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="flip-digit">
      {/* Static upper half — shows new value immediately on flip */}
      <div className="digit-half upper">
        <div className="digit-text">
          {flipping ? value : displayCurrent}
        </div>
      </div>

      {/* Static lower half — keeps old value until flip completes */}
      <div className="digit-half lower">
        <div className="digit-text digit-text-lower">
          {displayCurrent}
        </div>
      </div>

      {flipping && (
        <>
          {/* Animated top flap — old value, folds away downward */}
          <div className="digit-flap flap-top">
            <div className="digit-text">{displayPrev}</div>
          </div>

          {/* Animated bottom flap — new value, unfolds from behind */}
          <div className="digit-flap flap-bottom">
            <div className="digit-text digit-text-lower">{value}</div>
          </div>
        </>
      )}
    </div>
  );
}
