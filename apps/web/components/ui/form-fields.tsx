"use client";

import { useId, type ReactNode } from "react";

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
}

function FieldShell({
  id,
  label,
  error,
  hint,
  required,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="field form-field">
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="field-hint" id={`${id}-message`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={`${id}-message`}>
          {error}
        </p>
      )}
    </div>
  );
}

function controlProps(id: string, props: FieldProps) {
  return {
    id,
    value: props.value,
    required: props.required,
    "aria-invalid": props.error ? true : undefined,
    "aria-describedby": props.error || props.hint ? `${id}-message` : undefined,
    className: "form-control",
  };
}

export function TextField(props: FieldProps & { autoFocus?: boolean }) {
  const id = useId();
  return (
    <FieldShell id={id} {...props}>
      <input
        {...controlProps(id, props)}
        type="text"
        placeholder={props.placeholder}
        autoFocus={props.autoFocus}
        onChange={(event) => props.onChange(event.target.value)}
      />
    </FieldShell>
  );
}

export function SelectField(
  props: FieldProps & { options: { value: string; label: string }[] }
) {
  const id = useId();
  return (
    <FieldShell id={id} {...props}>
      <select
        {...controlProps(id, props)}
        onChange={(event) => props.onChange(event.target.value)}
      >
        {props.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
