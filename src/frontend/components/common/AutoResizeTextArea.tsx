import React, { useRef, useImperativeHandle, forwardRef } from 'react';

export interface AutoResizeTextareaProps {
  placeholder?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export interface AutoResizeTextareaHandle {
  clear: () => void;
}

const AutoResizeTextarea = forwardRef<AutoResizeTextareaHandle, AutoResizeTextareaProps>(
  ({ placeholder = 'Type your message here...', onChange, disabled = false }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
      const el = event.currentTarget;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
      onChange(el.value);
    };

    // Expose clear() method
    useImperativeHandle(ref, () => ({
      clear() {
        if (textareaRef.current) {
          textareaRef.current.value = '';
          textareaRef.current.style.height = 'auto';
          onChange('');
        }
      },
    }));

    return (
      <textarea
        ref={textareaRef}
        rows={1}
        onInput={handleInput}
        onChange={handleInput}
        className="w-full resize-none overflow-hidden text-base leading-tight box-border border-none outline-none"
        placeholder={placeholder}
        disabled={disabled}
      />
    );
  }
);

export default AutoResizeTextarea;
