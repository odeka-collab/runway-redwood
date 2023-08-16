import { MetaTags } from '@redwoodjs/web'

import RunwayForm from 'src/components/RunwayForm/RunwayForm'
import RunwayVisualizer from 'src/components/RunwayVisualizer/RunwayVisualizer'
import useRunway from 'src/hooks/runway'

const HomePage = () => {
  const { update, ...runway } = useRunway()
  console.log('<HomePage>', runway)

  async function onSubmit(formData) {
    console.log('onSubmit()', formData)
    await update(formData)
  }

  return (
    <>
      <MetaTags title="Runway App" description="How much runway do you have?" />
      <RunwayForm defaultValues={runway?.data} onSubmit={onSubmit} />
      <RunwayVisualizer {...runway} />
    </>
  )
}

export default HomePage
