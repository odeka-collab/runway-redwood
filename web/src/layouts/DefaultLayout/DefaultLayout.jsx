const DefaultLayout = ({ children }) => {
  return (
    <div className="m-auto max-w-3xl">
      <h1 className="p-8 text-center text-4xl font-bold">The Runway App</h1>
      <main className="p-2">{children}</main>
    </div>
  )
}

export default DefaultLayout
