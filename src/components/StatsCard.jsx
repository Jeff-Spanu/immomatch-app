export default function StatsCard({
  title,
  value,
  highlight = false
}) {
  return (
    <div
      className={`
        liquid-glass
        rounded-3xl
        p-7

        ${highlight ? "accent-glow" : ""}
      `}
    >

      <p className="text-white/40 mb-3">
        {title}
      </p>

      <h3
        className={`
          text-6xl
          font-light

          ${highlight ? "text-[#C87533]" : ""}
        `}
      >
        {value}
      </h3>

    </div>
  )
}