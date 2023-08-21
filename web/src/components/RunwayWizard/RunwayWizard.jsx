import RunwayForm from 'src/components/RunwayForm/RunwayForm'
import RunwayVisualizer from 'src/components/RunwayVisualizer/RunwayVisualizer'
import useRunway from 'src/hooks/UseRunway'
import RunwayProvider, { buildRenderData } from 'src/providers/RunwayProvider'

const RunwayWizard = ({ initialState }) => {
  return (
    <RunwayProvider initialState={initialState}>
      <RunwayWizardStateMachine />
    </RunwayProvider>
  )
}

const VIEWS = {
  FORM: 'FORM',
  RUNWAY: 'RUNWAY',
}

const STEPS = {
  FUNDS_AND_MONTHLY_DEBITS: {
    name: 'FUNDS_AND_MONTHLY_DEBITS',
    component: function FundsAndMonthlyDebits(props) {
      return (
        <>
          <RunwayForm.Funds {...props} />
          <RunwayForm.MonthlyDebits {...props} />
        </>
      )
    },
    next: 'MONTHLY_CREDITS',
  },
  MONTHLY_CREDITS: {
    name: 'MONTHLY_CREDITS',
    component: RunwayForm.MonthlyCredits,
    prev: 'FUNDS_AND_MONTHLY_DEBITS',
    next: 'ONE_TIME_CREDITS',
  },
  ONE_TIME_CREDITS: {
    name: 'ONE_TIME_CREDITS',
    component: RunwayForm.OneTimeCredits,
    prev: 'MONTHLY_CREDITS',
    next: 'ONE_TIME_DEBITS',
  },
  ONE_TIME_DEBITS: {
    name: 'ONE_TIME_DEBITS',
    component: RunwayForm.OneTimeDebits,
    prev: 'ONE_TIME_CREDITS',
    next: 'EDIT_RUNWAY',
  },
  EDIT_RUNWAY: {
    name: 'EDIT_RUNWAY',
    component: RunwayForm.AllFields,
    prev: 'MONTHLY_CREDITS',
  },
}

const DEFAULT_STEP = STEPS.FUNDS_AND_MONTHLY_DEBITS

function RunwayWizardStateMachine() {
  const { update, data } = useRunway()

  const [state, setState] = React.useState({
    view: 'FORM',
    step: DEFAULT_STEP,
  })

  async function onSubmit(formData) {
    await update(formData)
    setState({ ...state, view: VIEWS.RUNWAY })
  }

  async function onBack() {
    setState({
      ...state,
      view: VIEWS.FORM,
      step:
        state.view === VIEWS.RUNWAY
          ? state.step
          : STEPS[state.step.prev] || state.step,
    })
  }

  async function onNext() {
    setState({
      ...state,
      view: VIEWS.FORM,
      step: STEPS[state.step.next] || state.step,
    })
  }

  switch (state.view) {
    case VIEWS.RUNWAY:
      return (
        <>
          <RunwayView {...{ data: buildRenderData(data), onBack, onNext }} />
          <pre className="m-4 border-2 border-double border-stone-400 bg-slate-800 p-1 text-stone-100">
            {JSON.stringify(buildRenderData(data), null, 2)}
          </pre>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </>
      )
    case VIEWS.FORM:
      return (
        <>
          <FormView {...{ step: state?.step, data, onSubmit, onBack }} />
          <pre className="m-4 border-2 border-double border-stone-400 bg-slate-800 p-1 text-stone-100">
            {JSON.stringify(data, null, 2)}
          </pre>
        </>
      )
  }
}

function RunwayView({ data, onBack, onNext }) {
  return (
    <>
      <RunwayVisualizer data={data} />
      <Button onClick={onBack}>Back</Button>
      <Button onClick={onNext}>Next</Button>
    </>
  )
}

function FormView({ step, data, onSubmit, onBack }) {
  const CurrentStep = STEPS[step?.name]?.component

  return (
    <RunwayForm
      defaultValues={data}
      {...(step?.prev && { onBack })}
      onSubmit={onSubmit}
      render={CurrentStep}
    />
  )
}

function Button({ children, ...props }) {
  return <button {...props}>{children}</button>
}

export default RunwayWizard
