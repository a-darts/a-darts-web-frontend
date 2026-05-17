import React from 'react';
import TextInput from './TextInput';

interface DatePickerProps {
  dateLabel?: string;
  timeLabel?: string;
  dateValue: string;
  timeValue: string;
  onDateChange: (val: string) => void;
  onTimeChange: (val: string) => void;
  required?: boolean;
  style?: React.CSSProperties;
}

const DatePicker: React.FC<DatePickerProps> = ({
  dateLabel = 'Fecha',
  timeLabel = 'Hora',
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  required = false,
  style,
}) => {
  return (
    <div style={{ ...styles.grid2Col, ...style }}>
      <TextInput
        label={dateLabel}
        type="date"
        value={dateValue}
        onChange={(e) => onDateChange(e.target.value)}
        icon="Calendar"
        required={required}
      />

      <TextInput
        label={timeLabel}
        type="time"
        value={timeValue}
        onChange={(e) => onTimeChange(e.target.value)}
        icon="Clock"
        required={required}
      />
    </div>
  );
};

const styles = {
  grid2Col: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '1rem',
    width: '100%',
  },
};

export default DatePicker;
