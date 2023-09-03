import RunwayForm from 'src/components/RunwayForm/RunwayForm'
import { NextLabel } from 'src/components/RunwayWizard/RunwayWizard'

export const VIEWS = {
  WELCOME: 'WELCOME',
  FORM: 'FORM',
  RUNWAY: 'RUNWAY',
}

export const DEFAULT_WORKFLOW = {
  WELCOME: {
    name: 'WELCOME',
    view: VIEWS.WELCOME,
    next: 'FUNDS',
  },
  FUNDS: {
    name: 'FUNDS',
    component: function Funds(props) {
      return (
        <>
          <RunwayForm.Funds
            {...props}
            headerText="How much cash do you have?"
          />
        </>
      )
    },
    submitComponent: NextLabel,
    prev: 'WELCOME',
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
    submitComponent: NextLabel,
    prev: 'FUNDS',
    next: 'MONTHLY_CREDITS',
  },
  MONTHLY_CREDITS: {
    name: 'MONTHLY_CREDITS',
    component: function MonthlyCredits(props) {
      return (
        <RunwayForm.MonthlyCredits
          {...props}
          headerText="Do you have any regular monthly income?"
        />
      )
    },
    submitComponent: NextLabel,
    prev: 'ONE_TIME_CREDITS',
    next: 'MONTHLY_DEBITS',
  },
  MONTHLY_DEBITS: {
    name: 'MONTHLY_DEBITS',
    component: function MonthlyDebits(props) {
      return (
        <>
          <RunwayForm.MonthlyDebits
            {...props}
            headerText="How much are you spending each month?"
          />
        </>
      )
    },
    submitComponent: NextLabel,
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
    prev: 'MONTHLY_DEBITS',
    next: 'VIEW_RUNWAY',
  },
  VIEW_RUNWAY: {
    view: VIEWS.RUNWAY,
    next: 'EDIT_RUNWAY',
  },
  EDIT_RUNWAY: {
    name: 'EDIT_RUNWAY',
    component: RunwayForm.AllFields,
    display: 'compact',
    enableScenarios: true,
    next: 'VIEW_RUNWAY',
  },
  SCENARIOS: {
    name: 'SCENARIOS',
    component: RunwayForm.Scenarios,
    display: 'compact',
    prev: 'EDIT_RUNWAY',
    next: 'VIEW_RUNWAY',
  },
}

export const SKIP_WORKFLOW = {
  WELCOME: {
    ...DEFAULT_WORKFLOW.WELCOME,
    next: 'EDIT_RUNWAY',
  },
  VIEW_RUNWAY: DEFAULT_WORKFLOW.VIEW_RUNWAY,
  EDIT_RUNWAY: DEFAULT_WORKFLOW.EDIT_RUNWAY,
  SCENARIOS: DEFAULT_WORKFLOW.SCENARIOS,
}

export const LAID_OFF_WORKFLOW = {
  ...DEFAULT_WORKFLOW,
  FUNDS: {
    ...DEFAULT_WORKFLOW.FUNDS,
    component: function Funds(props) {
      return (
        <>
          <RunwayForm.Funds
            {...props}
            headerText="How much cash do you have?"
            description="Check your couches and piggy bank."
          />
        </>
      )
    },
  },
  ONE_TIME_CREDITS: {
    ...DEFAULT_WORKFLOW.ONE_TIME_CREDITS,
    component: function OneTimeCredits(props) {
      return (
        <RunwayForm.OneTimeCredits
          {...props}
          headerText="Are you expecting any money?"
          description="Add anything you're pretty sure is coming in. We'll add less sure things later."
        />
      )
    },
  },
  MONTHLY_CREDITS: {
    ...DEFAULT_WORKFLOW.MONTHLY_CREDITS,
    component: function MonthlyCredits(props) {
      return (
        <RunwayForm.MonthlyCredits
          {...props}
          headerText="Do you have any regular monthly earnings?"
          description="Add any income you are expecting each month."
        />
      )
    },
  },
  MONTHLY_DEBITS: {
    ...DEFAULT_WORKFLOW.MONTHLY_DEBITS,
    component: function MonthlyDebits(props) {
      return (
        <>
          <RunwayForm.MonthlyDebits
            {...props}
            headerText="How much are you spending each month?"
            description=""
          />
        </>
      )
    },
  },
  ONE_TIME_DEBITS: {
    ...DEFAULT_WORKFLOW.ONE_TIME_DEBITS,
    component: function OneTimeDebits(props) {
      return (
        <RunwayForm.OneTimeDebits
          {...props}
          headerText="Do you have any expenses coming up?"
        />
      )
    },
  },
}
