import Header from 'src/components/Header/Header'

const DefaultLayout = ({ children }) => {
  return (
    <div className="m-auto max-w-3xl p-2">
      <Header />
      <main className="relative p-2">{children}</main>
    </div>
  )
}

export default DefaultLayout
