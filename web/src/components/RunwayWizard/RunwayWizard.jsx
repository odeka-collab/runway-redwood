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
          <RunwayForm.Funds
            {...props}
            headerText="How much cash do you have?"
          />
          <RunwayForm.MonthlyDebits
            {...props}
            headerText="How much are you spending each month?"
          />
        </>
      )
    },
    next: 'MONTHLY_CREDITS',
  },
  MONTHLY_CREDITS: {
    name: 'MONTHLY_CREDITS',
    component: function MonthlyCredits(props) {
      return (
        <RunwayForm.MonthlyCredits
          {...props}
          headerText="How much are you earning each month?"
        />
      )
    },
    prev: 'FUNDS_AND_MONTHLY_DEBITS',
    next: 'ONE_TIME_CREDITS',
  },
  ONE_TIME_CREDITS: {
    name: 'ONE_TIME_CREDITS',
    component: function OneTimeCredits(props) {
      return (
        <RunwayForm.OneTimeCredits
          {...props}
          headerText="Are you expecting any money?"
        />
      )
    },
    prev: 'MONTHLY_CREDITS',
    next: 'ONE_TIME_DEBITS',
  },
  ONE_TIME_DEBITS: {
    name: 'ONE_TIME_DEBITS',
    component: function OneTimeDebits(props) {
      return (
        <RunwayForm.OneTimeDebits
          {...props}
          headerText="Do you have any expenses coming up?"
        />
      )
    },
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
          <RunwayView
            {...{
              data: buildRenderData(data),
              onBack,
              onNext,
              stepName: state.step.name,
            }}
          />
          <details className="m-1 mt-24 border-2 border-stone-200 p-2 text-stone-400">
            <summary>DATA</summary>
            <div className="md:grid md:grid-cols-2">
              <pre className="my-2 border-2 border-double border-slate-400 bg-slate-800 p-1 text-stone-200">
                {JSON.stringify(buildRenderData(data), null, 2)}
              </pre>
              <pre className="my-2 border-2 border-double border-slate-400 bg-slate-800 p-1 text-stone-200">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </details>
        </>
      )
    case VIEWS.FORM:
      return (
        <>
          <FormView
            {...{
              step: state?.step,
              data,
              onSubmit,
              onBack: state.step.name !== 'EDIT_RUNWAY' ? onBack : undefined,
            }}
          />
          <details className="m-1 mt-24 border-2 border-stone-200 p-2 text-stone-400">
            <summary>DATA</summary>
            <pre className="my-2 border-2 border-double border-slate-400 bg-slate-800 p-1 text-stone-200">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </>
      )
  }
}

function RunwayView({ stepName, data, onBack, onNext }) {
  return (
    <>
      <RunwayVisualizer data={data} />
      {stepName === 'EDIT_RUNWAY' ? (
        <div>
          <Button onClick={onBack}>Edit</Button>
        </div>
      ) : (
        <div>
          <Button onClick={onBack}>Back</Button>
          <Button onClick={onNext}>Next</Button>
        </div>
      )}
    </>
  )
}

function FormView({ step, data, onSubmit, onBack }) {
  const CurrentStep = step?.component

  if (!CurrentStep) return null

  return (
    <RunwayForm
      defaultValues={data}
      {...(step.prev && { onBack })}
      onSubmit={onSubmit}
      render={CurrentStep}
    />
  )
}

function Button({ children, ...props }) {
  return <button {...props}>{children}</button>
}

export default RunwayWizard
