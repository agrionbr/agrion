import { Link } from "@tanstack/react-router";
import markImg from "@/assets/agrion-mark.png";

export function Logo({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const text = size === "lg" ? "text-3xl" : size === "sm" ? "text-xl" : "text-2xl";
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 font-display font-extrabold tracking-tight ${text} ${className}`}>
      <img src={markImg} alt="AGRION" className={`${dim} object-contain drop-shadow-sm`} />
      <span className="text-gradient-agro">AGRION</span>
    </Link>
  );
}