import { GithubLogo } from '@phosphor-icons/react'

import AirplaneLogo from 'src/components/AirplaneLogo/AirplaneLogo'
import logo from 'src/layouts/DefaultLayout/odeka_letterform_on_white.svg'

const Header = () => {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 pb-8">
      <a href="https://odeka.io">
        <img src={logo} alt="Odeka" width="110" />
      </a>
      <div className="flex flex-wrap items-center gap-3">
        <AirplaneLogo />
        <a href="/">
          <h1 className="select-none text-2xl font-bold">Runway App</h1>
        </a>
        <a
          href="https://github.com/odeka-collab/runway-redwood"
          className="rounded-full border border-black p-2"
        >
          <GithubLogo />
        </a>
      </div>
    </header>
  )
}

export default Header
