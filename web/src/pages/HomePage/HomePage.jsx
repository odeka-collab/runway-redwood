import { MetaTags } from '@redwoodjs/web'

import RunwayForm from 'src/components/RunwayForm/RunwayForm'
import useRunway from 'src/hooks/runway'

const HomePage = () => {
  const { data, update } = useRunway()
  console.log('<HomePage>', data)

  async function onSubmit(formData) {
    console.log('onSubmit()', formData)
    await update(formData)
  }

  return (
    <>
      <MetaTags title="Runway App" description="How much runway do you have?" />
      <RunwayForm defaultValues={data} onSubmit={onSubmit} />
    </>
  )
}

export default HomePage
