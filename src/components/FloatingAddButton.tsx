"use client";

interface FloatingAddButtonProps {
  active: boolean;
  onClick: () => void;
}

export default function FloatingAddButton({ active, onClick }: FloatingAddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={active ? "Cancelar" : "Agregar locación"}
      className={`fixed bottom-8 right-8 z-[1000] flex h-16 w-16 items-center justify-center rounded-full
        text-3xl leading-none shadow-[0_0_24px_rgba(57,255,20,0.55)] transition-transform hover:scale-110
        ${active ? "bg-danger text-[#2a0a0a]" : "bg-primary text-primary-foreground"}`}
    >
      {active ? "×" : "+"}
    </button>
  );
}
