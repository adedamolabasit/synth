import clsx from "clsx";

interface SwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
}

export function Switch({ checked, onChange }: SwitchProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300",
        checked ? "bg-cyan-400" : "bg-gray-300"
      )}
    >
      <span
        className={clsx(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300",
          checked ? "translate-x-5" : "translate-x-1"
        )}
      />
    </button>
  );
}
