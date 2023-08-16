import RunwayForm from 'src/components/RunwayForm/RunwayForm'
import RunwayVisualizer from 'src/components/RunwayVisualizer/RunwayVisualizer'
import useRunway from 'src/hooks/runway'

const RunwayWizard = () => {
  const { update, ...runway } = useRunway()
  console.log('<RunwayWizard>', runway)

  async function onSubmit(formData) {
    console.log('onSubmit()', formData)
    await update(formData)
  }

  return (
    <div>
      <RunwayForm defaultValues={runway?.data} onSubmit={onSubmit} />
      <RunwayVisualizer {...runway} />
    </div>
  )
}

export default RunwayWizard
