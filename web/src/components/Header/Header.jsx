import logo from 'src/layouts/DefaultLayout/odeka_letterform_on_white.svg'

const Header = () => {
  return (
    <header className="flex flex-wrap justify-between gap-4 pb-8">
      <a href="https://odeka.io">
        <img src={logo} alt="Odeka" width="120" />
      </a>
      <h1 className="select-none text-2xl font-bold">Runway App</h1>
    </header>
  )
}

export default Header
