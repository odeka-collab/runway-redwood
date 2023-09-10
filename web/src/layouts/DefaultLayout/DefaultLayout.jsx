import Header from 'src/components/Header/Header'

const DefaultLayout = ({ children }) => {
  return (
    <div className="m-auto max-w-3xl p-1 py-2 sm:py-8">
      <Header />
      <main className="relative">{children}</main>
    </div>
  )
}

export default DefaultLayout
