export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white px-5">
      <img
        src="/logo-segunda-aura.png"
        alt="Segunda Aura"
        className="w-40 h-auto animate-pulse"
      />
      <div className="h-8 w-8 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
    </div>
  );
}
