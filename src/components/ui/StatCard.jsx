import GlassCard from "./GlassCard"

export default function StatCard({
  title,
  value,
  icon
}) {

  return (

    <GlassCard className="relative overflow-hidden">

      <div className="absolute top-0 right-0 w-32 h-32 bg-[#C87533]/10 blur-3xl rounded-full" />

      <div className="relative flex items-center justify-between">

        <div>

          <p className="text-white/40 text-sm uppercase tracking-widest mb-3">
            {title}
          </p>

          <h2 className="text-5xl font-semibold text-white">
            {value}
          </h2>

        </div>

        <div className="text-5xl">
          {icon}
        </div>

      </div>

    </GlassCard>

  )
}