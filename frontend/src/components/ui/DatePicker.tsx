import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './DatePicker.css';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const POPOVER_WIDTH = 280;
const POPOVER_GAP = 6;

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseISO(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatDisplay(value: string): string {
  const date = parseISO(value);
  if (!date) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildCalendarDays(year: number, month: number): { date: Date; inMonth: boolean }[] {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const days: { date: Date; inMonth: boolean }[] = [];

  for (let i = startOffset; i > 0; i--) {
    days.push({ date: new Date(year, month, 1 - i), inMonth: false });
  }
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ date: new Date(year, month, d), inMonth: true });
  }
  while (days.length % 7 !== 0) {
    const last = days[days.length - 1].date;
    days.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false });
  }
  return days;
}

function computePopoverPosition(trigger: HTMLElement, popoverHeight: number) {
  const rect = trigger.getBoundingClientRect();
  let top = rect.bottom + POPOVER_GAP;
  let left = rect.left;

  if (top + popoverHeight > window.innerHeight - 8) {
    top = rect.top - popoverHeight - POPOVER_GAP;
  }
  if (top < 8) top = 8;

  if (left + POPOVER_WIDTH > window.innerWidth - 8) {
    left = window.innerWidth - POPOVER_WIDTH - 8;
  }
  if (left < 8) left = 8;

  return { top, left };
}

export function DatePicker({ value, onChange, placeholder = 'Select date' }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = parseISO(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [view, setView] = useState(() => selected || today);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverStyle, setPopoverStyle] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    if (selected) setView(selected);
  }, [value]);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const height = popoverRef.current?.offsetHeight || 340;
    setPopoverStyle(computePopoverPosition(triggerRef.current, height));
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const raf = requestAnimationFrame(updatePosition);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, view, value, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const selectDate = (date: Date) => {
    onChange(toISO(date));
    setOpen(false);
  };

  const days = buildCalendarDays(view.getFullYear(), view.getMonth());

  const popover = open ? (
    <div
      ref={popoverRef}
      className="date-picker-popover date-picker-popover--portal"
      role="dialog"
      aria-label="Choose date"
      style={{ top: popoverStyle.top, left: popoverStyle.left, width: POPOVER_WIDTH }}
    >
      <div className="date-picker-header">
        <button type="button" className="date-picker-nav" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))} aria-label="Previous month">‹</button>
        <span className="date-picker-month">{MONTHS[view.getMonth()]} {view.getFullYear()}</span>
        <button type="button" className="date-picker-nav" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))} aria-label="Next month">›</button>
      </div>
      <div className="date-picker-weekdays">
        {WEEKDAYS.map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="date-picker-grid">
        {days.map(({ date, inMonth }) => {
          const iso = toISO(date);
          const isToday = isSameDay(date, today);
          const isSelected = value === iso;
          return (
            <button
              key={iso + inMonth}
              type="button"
              className={`date-picker-day${!inMonth ? ' muted' : ''}${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}`}
              onClick={() => selectDate(date)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
      {value && (
        <button type="button" className="date-picker-clear" onClick={() => { onChange(''); setOpen(false); }}>
          Clear date
        </button>
      )}
    </div>
  ) : null;

  return (
    <div className="date-picker">
      <button
        ref={triggerRef}
        type="button"
        className={`date-picker-trigger input${value ? '' : ' date-picker-empty'}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span>{value ? formatDisplay(value) : placeholder}</span>
        <span className="date-picker-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M2 6.5h12" stroke="currentColor" strokeWidth="1.3" />
            <path d="M5.5 2v2M10.5 2v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      {popover && createPortal(popover, document.body)}
    </div>
  );
}
