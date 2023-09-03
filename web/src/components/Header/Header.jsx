import logo from 'src/layouts/DefaultLayout/odeka_letterform_on_white.svg'

const Header = () => {
  return (
    <header className="flex flex-wrap justify-between gap-4 pb-8">
      <img src={logo} alt="Odeka" width="120" />
      <h1 className="text-2xl font-bold">Runway App</h1>
    </header>
  )
}

export default Header
