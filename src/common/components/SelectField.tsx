interface Option<T extends string> {
  value: T;
  label: string;
}

interface SelectFieldProps<T extends string> {
  id: string;
  label: string;
  value: T | "";
  options: readonly Option<T>[];
  onChange: (value: T | "") => void;
  /** Texto de la opcion vacia; si se omite, no hay opcion vacia. */
  emptyLabel?: string;
}

export function SelectField<T extends string>({ id, label, value, options, onChange, emptyLabel }: SelectFieldProps<T>) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <select
        id={id}
        className="field"
        value={value}
        onChange={(event) => {
          const raw = event.target.value;
          const match = options.find((option) => option.value === raw);
          onChange(match ? match.value : "");
        }}
      >
        {emptyLabel !== undefined && <option value="">{emptyLabel}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function enumOptions<T extends string>(values: readonly T[], format: (value: T) => string): Option<T>[] {
  return values.map((value) => ({ value, label: format(value) }));
}
