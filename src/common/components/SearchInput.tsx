import { useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

interface SearchInputProps {
  id: string;
  label: string;
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

// Input con debounce: escribe en local y "confirma" (URL) cuando el usuario deja de tipear.
// Si la URL cambia desde fuera (atras/adelante), el input se sincroniza.
export function SearchInput({ id, label, value, onCommit, placeholder, maxLength = 80 }: SearchInputProps) {
  const [draft, setDraft] = useState(value);
  const debounced = useDebouncedValue(draft, 350);
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;
  const lastCommitted = useRef(value);

  useEffect(() => {
    if (value !== lastCommitted.current) {
      lastCommitted.current = value;
      setDraft(value);
    }
  }, [value]);

  useEffect(() => {
    if (debounced !== lastCommitted.current) {
      lastCommitted.current = debounced;
      onCommitRef.current(debounced);
    }
  }, [debounced]);

  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <input
        id={id}
        type="search"
        className="field"
        value={draft}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
      />
    </div>
  );
}
