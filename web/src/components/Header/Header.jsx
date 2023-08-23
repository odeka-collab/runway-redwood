import { ArrowFatLeft, FloppyDiskBack, X } from '@phosphor-icons/react'

import Button from 'src/components/Button/Button'
import useModal from 'src/hooks/UseModal'

const Header = () => {
  const { open, toggle } = useModal()

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 pb-8">
      <h1 className="flex-grow text-4xl font-bold">The Runway App</h1>
      <div className="ml-auto">
        <Button onClick={toggle}>
          {open ? (
            <>
              <X className="hidden h-4 w-auto xs:block" />
              <span className="flex items-center gap-2 text-xs xs:hidden">
                <ArrowFatLeft className="h-4 w-auto" />
                Back
              </span>
            </>
          ) : (
            <span className="flex items-center gap-1 text-xs">
              <FloppyDiskBack className="h-4 w-auto" aria-hidden />
              Save / Load
            </span>
          )}
        </Button>
      </div>
    </header>
  )
}

export default Header
