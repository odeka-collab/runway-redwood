import { ArrowFatRight, PersonSimpleRun } from '@phosphor-icons/react'
import { v4 as uuidv4 } from 'uuid'

import Button from 'src/components/Button/Button'
import RunwayForm from 'src/components/RunwayForm/RunwayForm'
import RunwayImport from 'src/components/RunwayImport/RunwayImport'
import RunwayVisualizer from 'src/components/RunwayVisualizer/RunwayVisualizer'
import {
  PRESET_BUSINESS,
  PRESET_LAID_OFF,
} from 'src/components/RunwayWizard/presets'
import {
  BASE_WORKFLOW,
  WIZARD_WORKFLOW,
  BUSINESS_WORKFLOW,
  LAID_OFF_WORKFLOW,
  VIEWS,
} from 'src/components/RunwayWizard/workflows'
import useModal from 'src/hooks/UseModal'
import useRunway from 'src/hooks/UseRunway'
import {
  DEFAULT_VALUE,
  RUNWAY_MONTHS_MAX,
  buildRenderData,
} from 'src/providers/RunwayProvider'

const DEFAULT_STEP = WIZARD_WORKFLOW.WELCOME

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'standard',
  maximumFractionDigits: 0,
})

function RunwayWizard() {
  const [workflow, setWorkflow] = React.useState(WIZARD_WORKFLOW)
  const [step, setStep] = React.useState(DEFAULT_STEP)
  const { open, toggle } = useModal()
  const { data, update } = useRunway()

  async function onClickOnboarding(
    presetFormData = DEFAULT_VALUE.data,
    updatedWorkflow = WIZARD_WORKFLOW
  ) {
    await update(presetFormData)
    setWorkflow(updatedWorkflow)
    setStep(updatedWorkflow[updatedWorkflow[step.name].next] || step)
  }

  async function onSubmit(formData, options = {}) {
    await update(
      step.next === 'EDIT_RUNWAY' ? aggregateFields(formData) : formData
    )

    if (options?.goto === 'save') {
      toggle()
    } else if (options?.goto === 'scenario') {
      setStep(workflow.SCENARIOS)
    } else {
      setStep(workflow[step.next] || step)
    }
  }

  // WARNING: overwrites monthlyDebits with aggregate rows from monthlyDebits*
  function aggregateFields(formData) {
    if (
      formData.monthlyDebitsFixed?.length > 0 ||
      formData.monthlyDebitsFlexible?.length > 0
    ) {
      formData.monthlyDebits = [
        'monthlyDebitsFixed',
        'monthlyDebitsFlexible',
      ].reduce((acc, field, i, arr) => {
        const rows = formData[field] || []
        delete formData[field]
        // Maintain one pristine row
        return i === arr.length - 1 && !acc.length
          ? [DEFAULT_VALUE.data.monthlyDebits[0]]
          : [...acc, ...rows]
      }, [])
    }
    return { ...formData }
  }

  function onBack() {
    setStep(workflow[step.prev] || step)
  }

  async function onCancelImport() {
    toggle()
  }

  async function onImport({ data }) {
    await update(aggregateFields(data))
    setStep(workflow.EDIT_RUNWAY || step)
    toggle()
  }

  return (
    <>
      <RunwayWizardView
        key={uuidv4()} // always re-render to sync with <RunwayProvider> data
        data={data}
        step={step}
        onBack={onBack}
        onClickOnboarding={onClickOnboarding}
        onSubmit={onSubmit}
      />
      {open && <RunwayImport onCancel={onCancelImport} onSubmit={onImport} />}
    </>
  )
}

function RunwayWizardView({ data, step, onBack, onClickOnboarding, onSubmit }) {
  switch (step.view) {
    case VIEWS.WELCOME:
      return <Welcome onClickOnboarding={onClickOnboarding} />
    case VIEWS.RUNWAY:
      return (
        <RunwayView
          {...{
            step,
            data,
            onSubmit,
            onBack,
          }}
        />
      )
    case VIEWS.FORM:
    default:
      return (
        <>
          <FormView
            {...{
              step,
              data,
              onSubmit,
              onBack,
            }}
          />
          <Details datas={[data]} />
        </>
      )
  }
}

function Welcome({ onClickOnboarding }) {
  return (
    <div className="flex flex-col sm:gap-8">
      <h2 className="py-4 text-center text-3xl">Howdy!</h2>
      <p className="text-md mx-auto px-8 py-2 text-center text-lg sm:w-7/12">
        This tool is built for the harsh financial realities we are all dealing
        with. Check out a sample financial runway, or try it for yourself!
      </p>
      <p className="mx-auto px-6 py-2 text-center text-base sm:w-2/3">
        Sh*t just got real. No one&apos;s financial future is certain. Look at a
        few scenarios we&apos;ve already been through.
      </p>
      <div className="grid content-stretch gap-6 p-6 sm:grid-cols-2">
        <Card
          onClick={() => onClickOnboarding(PRESET_BUSINESS, BUSINESS_WORKFLOW)}
        >
          Living off the business with friends
        </Card>
        <Card
          onClick={() => onClickOnboarding(PRESET_LAID_OFF, LAID_OFF_WORKFLOW)}
        >
          I was just laid off
        </Card>
      </div>
      <div className="flex flex-col justify-between gap-6 p-6 pt-0 sm:flex-row">
        <Button onClick={() => onClickOnboarding()}>
          <span className="flex items-center justify-center gap-2">
            Try it myself
            <ArrowFatRight />
          </span>
        </Button>
        <Button
          onClick={() => onClickOnboarding(DEFAULT_VALUE.data, BASE_WORKFLOW)}
        >
          <span className="flex items-center justify-center gap-2">
            I know what I&apos;m doing
            <PersonSimpleRun className="h-6 w-auto" />
          </span>
        </Button>
      </div>
    </div>
  )
}

function Card({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="h-36 rounded-3xl border-4 border-double border-black p-4 text-xl xs:p-8 sm:h-auto sm:py-24"
    >
      {children}
    </button>
  )
}

function RunwayView({ data, ...props }) {
  const renderData = buildRenderData(data)
  const [scenario, setScenario] = React.useState(renderData?.scenarios?.[0])

  return (
    <ScenarioContext.Provider value={{ scenario, setScenario }}>
      <RunwayVisualizer data={renderData} />
      <div className="grid gap-2 sm:grid-flow-col">
        <Summary data={renderData} />
        {scenario && (
          <Summary data={scenario} title={`What if ${scenario.name}`} />
        )}
      </div>
      <FormView
        {...{
          ...props,
          data,
        }}
      />
      <Details datas={[data, renderData]} />
    </ScenarioContext.Provider>
  )
}

export const ScenarioContext = React.createContext()

function Summary({ data, title = 'Summary' }) {
  const lastMonth = data.months[data.months.length - 1]
  const lastMonthLabel = lastMonth.label
  const hasSurplus = lastMonth.balance.end > 0
  const balanceEnd = usd.format(lastMonth.balance.end)
  const surplusAvgPerMo = usd.format(lastMonth.balance.end / RUNWAY_MONTHS_MAX)
  const shakyMonths = data.months.filter(({ balance: { end } }) => end < 0)
  const monthsCalculated = Math.min(RUNWAY_MONTHS_MAX, data.months.length)

  return (
    <section className="rounded-xl border-b border-t border-black p-4">
      <h3 className="text-xl uppercase">{title}</h3>
      <p className="p-4 sm:text-lg">
        We&apos;ve calculated your financial runway for the next{' '}
        {monthsCalculated > 1 ? (
          <em className="whitespace-nowrap text-xl">
            {monthsCalculated} months
          </em>
        ) : (
          'month'
        )}
        .
      </p>
      <div className="px-4">
        <p className="sm:text-lg">
          You have runway to{' '}
          <span className="whitespace-nowrap text-xl font-semibold">
            {lastMonthLabel}
          </span>
          .
        </p>
      </div>
      {hasSurplus && (
        <div className="px-4">
          <p className="sm:text-lg">
            You&apos;ll have a{' '}
            <span className="text-xl font-semibold">{balanceEnd}</span> surplus!
          </p>
          <p className="sm:text-lg">
            That&apos;s an extra{' '}
            <span className="font-semibold">{surplusAvgPerMo}</span> per month!
          </p>
        </div>
      )}
      {shakyMonths.length > 0 && (
        <div className="px-4">
          <h4 className="py-4 uppercase">Shaky months</h4>
          <ul>
            {shakyMonths.map((month) => (
              <ShakyMonth key={month.label} {...month} />
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

function ShakyMonth({ debit, monthLabel, yearLabel, balance: { start, end } }) {
  const startedGood = start > 0
  const deficit = usd.format(Math.abs(end))
  const short = startedGood ? deficit : usd.format(Math.abs(debit))

  return (
    <li className="flex flex-wrap gap-4">
      <span className="text-xl">
        {monthLabel} {yearLabel}
      </span>
      <span className="">
        You&apos;re short <span className="text-lg font-semibold">{short}</span>
      </span>
    </li>
  )
}

function FormView({ step, data, onSubmit, onBack }) {
  const CurrentStep = step?.component

  return (
    <RunwayForm
      defaultValues={data}
      {...(step.prev && { onBack })}
      {...(step.enableScenarios && { enableScenarios: true })}
      {...(step.submitComponent && { submitComponent: step.submitComponent })}
      {...(step.backLabel && { backLabel: step.backLabel })}
      onSubmit={onSubmit}
      render={CurrentStep}
      display={step.display}
    />
  )
}

function Details({ datas }) {
  return (
    <details className="mt-24 border-2 border-stone-200 p-1.5 text-stone-400">
      <summary>DEVELOPER</summary>
      {datas?.length > 0 && (
        <div className={`grid grid-cols-${datas.length}`}>
          {datas.map((data, i) => (
            <pre
              key={i}
              className="my-2 overflow-x-auto border-2 border-double border-slate-400 bg-slate-800 p-1 text-stone-200"
            >
              {JSON.stringify(data, null, 2)}
            </pre>
          ))}
        </div>
      )}
    </details>
  )
}

export default RunwayWizard
