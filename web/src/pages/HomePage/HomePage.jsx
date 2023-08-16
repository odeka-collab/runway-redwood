import { MetaTags } from '@redwoodjs/web'

import RunwayWizard from 'src/components/RunwayWizard/RunwayWizard'

const HomePage = () => {
  return (
    <>
      <MetaTags title="Runway App" description="How much runway do you have?" />
      <RunwayWizard />
    </>
  )
}

export default HomePage
