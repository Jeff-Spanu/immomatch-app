export default function GlassCard({
  children,
  className = ""
}) {

  return (

    <div
      className={`
        liquid-glass
        rounded-3xl
        border
        border-white/10
        bg-white/[0.03]
        backdrop-blur-xl
        p-6
        shadow-[0_0_40px_rgba(0,0,0,0.25)]
        ${className}
      `}
    >
      {children}
    </div>

  )
}