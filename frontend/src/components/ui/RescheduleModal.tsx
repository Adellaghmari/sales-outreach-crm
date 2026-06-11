import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { DatePicker } from './DatePicker';
import './DatePicker.css';

interface RescheduleModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (date: string) => Promise<void>;
  initialDate?: string;
}

function defaultDueDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().split('T')[0];
}

export function RescheduleModal({ open, onClose, onConfirm, initialDate }: RescheduleModalProps) {
  const [date, setDate] = useState(defaultDueDate());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setDate(initialDate?.split('T')[0] || defaultDueDate());
      setError('');
      setSaving(false);
    }
  }, [open, initialDate]);

  const handleConfirm = async () => {
    if (!date) {
      setError('Please select a date');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onConfirm(date);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reschedule follow up');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reschedule follow up"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleConfirm} disabled={saving || !date}>
            {saving ? 'Saving...' : 'Confirm'}
          </button>
        </>
      }
    >
      <div className="form-group">
        <label>New due date</label>
        <DatePicker
          value={date}
          onChange={setDate}
          placeholder="Select due date"
        />
        {error && <p style={{ color: 'var(--danger)', marginTop: 8, fontSize: '0.85rem' }}>{error}</p>}
      </div>
    </Modal>
  );
}
