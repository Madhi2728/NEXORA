import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "../ui/input";

export default function PasswordInput({ id, value, onChange, placeholder, required, minLength }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="h-11 bg-background/50 pr-10"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
