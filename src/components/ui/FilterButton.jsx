export default function FilterButton({
  active,
  children,
  onClick
}) {

  return (

    <button
      onClick={onClick}
      className={`
        px-5
        py-3
        rounded-2xl
        transition
        border

        ${
          active
            ? "bg-[#C87533] text-black border-[#C87533]"
            : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
        }
      `}
    >
      {children}
    </button>

  )
}