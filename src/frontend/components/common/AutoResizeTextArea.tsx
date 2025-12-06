import React, { useRef, useImperativeHandle, forwardRef } from "react";

export interface AutoResizeTextareaProps {
  placeholder?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  autoFocus?: boolean;
}

export interface AutoResizeTextareaHandle {
  clear: () => void;
}

const AutoResizeTextarea = forwardRef<
  AutoResizeTextareaHandle,
  AutoResizeTextareaProps
>(
  (
    { placeholder = "Type your message here...", onChange, disabled = false, onKeyDown, autoFocus = false },
    ref,
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
      const el = event.currentTarget;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
      onChange(el.value);
    };

    // Expose clear() method
    useImperativeHandle(ref, () => ({
      clear() {
        if (textareaRef.current) {
          textareaRef.current.value = "";
          textareaRef.current.style.height = "auto";
          onChange("");
        }
      },
    }));

    return (
      <textarea
        ref={textareaRef}
        rows={1}
        onInput={handleInput}
        onChange={handleInput}
        onKeyDown={onKeyDown}
        className="box-border w-full resize-none overflow-hidden border-none text-base leading-tight outline-none"
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
      />
    );
  },
);

export default AutoResizeTextarea;
