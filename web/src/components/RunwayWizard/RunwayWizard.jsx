import RunwayForm from 'src/components/RunwayForm/RunwayForm'
import RunwayVisualizer from 'src/components/RunwayVisualizer/RunwayVisualizer'
import useRunway from 'src/hooks/UseRunway'
import RunwayProvider, {
  buildRenderData,
  sumAmount,
} from 'src/providers/RunwayProvider'

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
    next: 'EDIT_RUNWAY',
  },
  EDIT_RUNWAY: {
    name: 'EDIT_RUNWAY',
    component: RunwayForm.AllFields,
    prev: 'MONTHLY_CREDITS',
  },
}

function RunwayWizardStateMachine() {
  const { update, data } = useRunway()

  const [state, setState] = React.useState({
    view: 'FORM',
    step: getStepBasedOnData(data),
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
          : STEPS[state.step.prev] || STEPS.FUNDS_AND_MONTHLY_DEBITS,
    })
  }

  async function onNext() {
    setState({
      ...state,
      view: VIEWS.FORM,
      step: STEPS[state.step.next] || STEPS.EDIT_RUNWAY,
    })
  }

  switch (state.view) {
    case VIEWS.RUNWAY:
      return (
        <>
          <RunwayView {...{ data: buildRenderData(data), onBack, onNext }} />
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </>
      )
    case VIEWS.FORM:
      return <FormView {...{ step: state?.step, data, onSubmit, onBack }} />
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
      onSubmit={onSubmit}
      render={(props) => (
        <>
          <CurrentStep {...props} />
          {step?.prev && <Button onClick={onBack}>Back</Button>}
        </>
      )}
    />
  )
}

function getStepBasedOnData(data) {
  const total = {
    debits: sumAmount(data?.monthlyDebits),
    credits: sumAmount(data?.monthlyCredits),
  }

  return { ...STEPS.ONE_TIME_CREDITS }
  switch (true) {
    case total.debits > 0 && total.credits > 0:
      return { ...STEPS.EDIT_RUNWAY }
    case total.debits > 0:
      return { ...STEPS.MONTHLY_CREDITS }
    default:
      return { ...STEPS.FUNDS_AND_MONTHLY_DEBITS }
  }
}

function Button({ children, ...props }) {
  return <button {...props}>{children}</button>
}

export default RunwayWizard
