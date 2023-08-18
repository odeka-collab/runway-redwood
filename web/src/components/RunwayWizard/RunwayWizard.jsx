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
    next: 'INCOME',
  },
  INCOME: {
    name: 'INCOME',
    prev: 'FUNDS_AND_MONTHLY_DEBITS',
    next: 'EDIT_RUNWAY',
  },
  EDIT_RUNWAY: {
    prev: 'INCOME',
    name: 'EDIT_RUNWAY',
  },
}

function RunwayWizardStateMachine() {
  const { update, data } = useRunway()

  const [state, setState] = React.useState({
    view: 'FORM',
    step: getStepBasedOnData(data),
  })

  async function onSubmit(formData) {
    const updatedData = await update(formData)
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
      return <RunwayView {...{ data: buildRenderData(data), onBack, onNext }} />
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
  switch (step?.name) {
    case STEPS.EDIT_RUNWAY.name:
      return (
        <RunwayForm defaultValues={data} onSubmit={onSubmit} onBack={onBack} />
      )
    case STEPS.INCOME.name:
      return (
        <RunwayForm
          defaultValues={data}
          onSubmit={onSubmit}
          onBack={onBack}
          render={(props) => (
            <>
              <RunwayForm.Income {...props} />
            </>
          )}
        />
      )
    case STEPS.FUNDS_AND_MONTHLY_DEBITS.name:
    default:
      return (
        <RunwayForm
          defaultValues={data}
          onSubmit={onSubmit}
          render={(props) => (
            <>
              <RunwayForm.Funds {...props} />
              <RunwayForm.MonthlyDebits {...props} />
            </>
          )}
        />
      )
  }
}

function getStepBasedOnData(data) {
  const total = {
    debits: sumAmount(data?.monthlyDebits),
    credits: sumAmount(data?.monthlyCredits),
  }

  switch (true) {
    case total.debits > 0 && total.credits > 0:
      return { ...STEPS.EDIT_RUNWAY }
    case total.debits > 0:
      return { ...STEPS.INCOME }
    default:
      return { ...STEPS.FUNDS_AND_MONTHLY_DEBITS }
  }
}

function Button({ children, ...props }) {
  return <button {...props}>{children}</button>
}

export default RunwayWizard
