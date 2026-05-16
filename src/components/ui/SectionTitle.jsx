export default function SectionTitle({
  eyebrow,
  title,
  description
}) {

  return (

    <div className="mb-10">

      <p className="text-[#C87533] uppercase tracking-[0.3em] text-xs mb-3">
        {eyebrow}
      </p>

      <h1 className="text-5xl mb-4">
        {title}
      </h1>

      {description && (
        <p className="text-white/40 max-w-2xl">
          {description}
        </p>
      )}

    </div>

  )
}