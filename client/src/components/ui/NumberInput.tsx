import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';

interface Props {
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
    disabled?: boolean;
    style?: React.CSSProperties;
    className?: string;
}

export const NumberInput: React.FC<Props> = ({ value, min, max, onChange, disabled, style, className }) => {
    const [localValue, setLocalValue] = useState<string>(String(value));

    useEffect(() => {
        setLocalValue(String(value));
    }, [value]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value);
    };

    const handleBlur = () => {
        let newValue = parseInt(localValue, 10);

        if (isNaN(newValue)) {
            // Revert to original if invalid
            setLocalValue(String(value));
            return;
        }

        // Clamp
        newValue = Math.max(min, Math.min(max, newValue));

        setLocalValue(String(newValue));
        if (newValue !== value) {
            onChange(newValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    };

    return (
        <input
            type="number"
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            style={style}
            className={className}
        />
    );
};
