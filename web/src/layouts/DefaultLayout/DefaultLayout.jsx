import { FloppyDiskBack, X } from '@phosphor-icons/react'

import Button from 'src/components/Button/Button'
import useModal from 'src/hooks/UseModal'

const DefaultLayout = ({ children }) => {
  const { open, toggle } = useModal()

  return (
    <div className="m-auto max-w-3xl p-2">
      <header className="flex flex-wrap items-center justify-between gap-2 pb-8">
        <h1 className="flex-grow text-4xl font-bold">The Runway App</h1>
        <Button onClick={toggle}>
          {open ? (
            <X className="h-4 w-auto" />
          ) : (
            <span className="flex items-center gap-1 text-xs">
              <FloppyDiskBack className="h-4 w-auto" aria-hidden />
              Save / Load
            </span>
          )}
        </Button>
      </header>
      <main className="relative p-2">{children}</main>
    </div>
  )
}

export default DefaultLayout
