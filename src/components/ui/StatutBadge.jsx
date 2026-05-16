export default function Badge({
  children,
  color = "default"
}) {

  const colors = {

    gold: "bg-[#C87533]/20 text-[#C87533]",
    blue: "bg-blue-500/20 text-blue-300",
    green: "bg-green-500/20 text-green-300",
    red: "bg-red-500/20 text-red-300",
    white: "bg-white/10 text-white/70",

    default: "bg-white/10 text-white/70"
  }

  return (

    <span
      className={`
        px-3
        py-1
        rounded-xl
        text-sm
        border
        border-white/10
        ${colors[color]}
      `}
    >
      {children}
    </span>

  )
}