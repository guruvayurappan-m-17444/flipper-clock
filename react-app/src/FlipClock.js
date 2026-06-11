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

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const rawHour = now.getHours();
  const displayHour = is24h ? rawHour : rawHour % 12 || 12;
  const ampm = rawHour < 12 ? 'AM' : 'PM';

  const hh = pad(displayHour);
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());

  const dateStr = `${DAY_NAMES[now.getDay()]}, ${MONTH_NAMES[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

  return (
    <div className="clock-wrapper">
      <div className="clock-date">{dateStr}</div>

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

      <button
        className="format-toggle"
        onClick={() => setIs24h(v => !v)}
        aria-label="Toggle time format"
      >
        <span className={!is24h ? 'toggle-active' : ''}>12H</span>
        <span className="toggle-divider">|</span>
        <span className={is24h ? 'toggle-active' : ''}>24H</span>
      </button>
    </div>
  );
}
