import Header from 'src/components/Header/Header'

const DefaultLayout = ({ children }) => {
  return (
    <div className="m-auto max-w-3xl p-1 pt-2 sm:pt-8">
      <Header />
      <main className="relative">{children}</main>
    </div>
  )
}

export default DefaultLayout
