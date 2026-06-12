import { useState, useEffect } from 'react';
import FlipDigit from './FlipDigit';
import './FlipClock.css';

const DAY_NAMES   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function pad(n) {
  return String(n).padStart(2, '0');
}

function Separator() {
  return (
    <div className="sep-col">
      <span className="sep-colon">:</span>
      <span className="sep-spacer" />
    </div>
  );
}

export default function FlipClock() {
  const [now, setNow]     = useState(new Date());
  const [is24h, setIs24h] = useState(false);
  const [clockMode, setClockMode] = useState('digital');
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));

  useEffect(() => {
    // High-frequency tick keeps analog hands moving smoothly.
    const id = setInterval(() => setNow(new Date()), 50);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const rawHour = now.getHours();
  const displayHour = is24h ? rawHour : rawHour % 12 || 12;
  const ampm = rawHour < 12 ? 'AM' : 'PM';

  const hh = pad(displayHour);
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());

  const secondsWithFraction = now.getSeconds() + now.getMilliseconds() / 1000;
  const minutesWithFraction = now.getMinutes() + secondsWithFraction / 60;
  const hoursWithFraction = (rawHour % 12) + minutesWithFraction / 60;

  const secondHandDegrees = secondsWithFraction * 6;
  const minuteHandDegrees = minutesWithFraction * 6;
  const hourHandDegrees = hoursWithFraction * 30;

  const dateStr = `${DAY_NAMES[now.getDay()]}, ${MONTH_NAMES[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen mode failed:', error);
    }
  };

  return (
    <div className="clock-wrapper">
      <div className="clock-date">{dateStr}</div>

      {clockMode === 'digital' ? (
        <div className="clock-row">
          <div className="clock-group">
            <div className="clock-digits">
              <FlipDigit value={hh[0]} />
              <FlipDigit value={hh[1]} />
            </div>
            <span className="clock-label">Hours</span>
          </div>

          <Separator />

          <div className="clock-group">
            <div className="clock-digits">
              <FlipDigit value={mm[0]} />
              <FlipDigit value={mm[1]} />
            </div>
            <span className="clock-label">Minutes</span>
          </div>

          <Separator />

          <div className="clock-group">
            <div className="clock-digits">
              <FlipDigit value={ss[0]} />
              <FlipDigit value={ss[1]} />
            </div>
            <span className="clock-label">Seconds</span>
          </div>

          {!is24h && (
            <div className="ampm-col">
              <span className={`ampm-badge ${ampm === 'AM' ? 'ampm-am' : 'ampm-pm'}`}>{ampm}</span>
              <span className="sep-spacer" />
            </div>
          )}
        </div>
      ) : (
        <div className="analog-clock" role="img" aria-label="Analog clock with smooth moving hands">
          <div className="analog-marks" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={`tick-${index}`}
                className={`analog-mark ${index % 3 === 0 ? 'major-mark' : 'minor-mark'}`}
                style={{ transform: `rotate(${index * 30}deg)` }}
              />
            ))}
          </div>

          <div
            className="analog-hand hour-hand"
            style={{ transform: `rotate(${hourHandDegrees}deg)` }}
          />
          <div
            className="analog-hand minute-hand"
            style={{ transform: `rotate(${minuteHandDegrees}deg)` }}
          />
          <div
            className="analog-hand second-hand"
            style={{ transform: `rotate(${secondHandDegrees}deg)` }}
          />

          <div className="analog-center-dot" />
        </div>
      )}

      <div className="clock-controls">
        <button
          className="action-btn"
          onClick={toggleFullscreen}
          aria-label="Toggle full screen"
        >
          {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
        </button>

        <button
          className="mode-toggle"
          onClick={() => setClockMode(mode => (mode === 'digital' ? 'analog' : 'digital'))}
          aria-label="Toggle clock mode"
        >
          <span className={clockMode === 'digital' ? 'toggle-active' : ''}>Digital</span>
          <span className="toggle-divider">|</span>
          <span className={clockMode === 'analog' ? 'toggle-active' : ''}>Analog</span>
        </button>

        {clockMode === 'digital' && (
          <button
            className="format-toggle"
            onClick={() => setIs24h(v => !v)}
            aria-label="Toggle time format"
          >
            <span className={!is24h ? 'toggle-active' : ''}>12H</span>
            <span className="toggle-divider">|</span>
            <span className={is24h ? 'toggle-active' : ''}>24H</span>
          </button>
        )}
      </div>
    </div>
  );
}
