import React from 'react';
import TextInput from './TextInput';

interface TimePickerProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  style?: React.CSSProperties;
}

const TimePicker: React.FC<TimePickerProps> = ({
  label = 'Hora',
  value,
  onChange,
  required = false,
  style,
}) => {
  return (
    <div style={style}>
      <TextInput
        label={label}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        icon="Clock"
        required={required}
      />
    </div>
  );
};

export default TimePicker;
