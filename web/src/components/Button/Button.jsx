export default function Button({ children, ...props }) {
  return (
    <button
      className="rounded-lg border-4 border-double border-black px-4 py-2 uppercase"
      {...props}
    >
      {children}
    </button>
  )
}
