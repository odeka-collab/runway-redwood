import RunwayForm from 'src/components/RunwayForm/RunwayForm'
import RunwayVisualizer from 'src/components/RunwayVisualizer/RunwayVisualizer'
import useRunway from 'src/hooks/Runway'
import RunwayProvider, { buildRenderData } from 'src/providers/RunwayProvider'

const RunwayWizard = ({ initialState }) => {
  return (
    <RunwayProvider initialState={initialState}>
      <RunwayWizardStep />
    </RunwayProvider>
  )
}

function RunwayWizardStep() {
  const { update, ...runway } = useRunway()

  async function onSubmit(formData) {
    await update(formData)
  }

  return (
    <>
      <RunwayForm defaultValues={runway?.data} onSubmit={onSubmit} />
      <RunwayVisualizer data={buildRenderData(runway?.data)} />
    </>
  )
}

export default RunwayWizard
