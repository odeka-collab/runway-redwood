import RunwayForm from 'src/components/RunwayForm/RunwayForm'

export const VIEWS = {
  WELCOME: 'WELCOME',
  FORM: 'FORM',
  RUNWAY: 'RUNWAY',
}

export const BASE_WORKFLOW = {
  WELCOME: {
    name: 'WELCOME',
    view: VIEWS.WELCOME,
    next: 'EDIT_RUNWAY',
  },
  EDIT_RUNWAY: {
    name: 'EDIT_RUNWAY',
    view: VIEWS.RUNWAY,
    component: RunwayForm.AllFields,
    display: 'compact',
    submitComponent: RunwayForm.BuildRunwayLabel,
    enableScenarios: true,
    backLabel: 'Start Over',
    prev: 'WELCOME',
  },
  SCENARIOS: {
    name: 'SCENARIOS',
    view: VIEWS.RUNWAY,
    component: RunwayForm.Scenarios,
    display: 'compact',
    submitComponent: RunwayForm.BuildScenarioLabel,
    backLabel: 'Back to Runway',
    prev: 'EDIT_RUNWAY',
  },
}

export const WIZARD_WORKFLOW = {
  ...BASE_WORKFLOW,
  WELCOME: {
    ...BASE_WORKFLOW.WELCOME,
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
    submitComponent: RunwayForm.BuildRunwayLabel,
    prev: 'MONTHLY_DEBITS',
    next: 'EDIT_RUNWAY',
  },
}

export const BUSINESS_WORKFLOW = {
  ...BASE_WORKFLOW,
  WELCOME: {
    ...BASE_WORKFLOW.WELCOME,
    next: 'FUNDS',
  },
  FUNDS: {
    name: 'FUNDS',
    component: function Funds(props) {
      return (
        <>
          <RunwayForm.Funds
            {...props}
            headerText="What's your company's cash situation?"
            description="Just liquid cash here, we'll get to invoices later."
          />
        </>
      )
    },
    prev: 'WELCOME',
    next: 'MONTHLY_DEBITS_FIXED',
  },
  MONTHLY_DEBITS_FIXED: {
    name: 'MONTHLY_DEBITS_FIXED',
    component: function MONTHLY_DEBITS_FIXED(props) {
      return (
        <>
          <RunwayForm.MonthlyDebitsFixed
            {...props}
            headerText="How much is everyone surviving on each month?"
            description="&hellip;to each according to their need."
          />
        </>
      )
    },
    prev: 'FUNDS',
    next: 'MONTHLY_DEBITS_FLEXIBLE',
  },
  MONTHLY_DEBITS_FLEXIBLE: {
    name: 'MONTHLY_DEBITS_FLEXIBLE',
    component: function MONTHLY_DEBITS_FIXED(props) {
      return (
        <>
          <RunwayForm.MonthlyDebitsFlexible
            {...props}
            headerText="What do the monthly operating expenses look like?"
            description={false}
          />
        </>
      )
    },
    prev: 'MONTHLY_DEBITS_FIXED',
    next: 'ONE_TIME_DEBITS',
  },
  ONE_TIME_DEBITS: {
    name: 'ONE_TIME_DEBITS',
    component: function OneTimeDebits(props) {
      return (
        <RunwayForm.OneTimeDebits
          {...props}
          headerText="Are there any upcoming one-off or infrequent expenses?"
          description="&hellip;that you actually know about."
        />
      )
    },
    prev: 'MONTHLY_DEBITS_FLEXIBLE',
    next: 'MONTHLY_CREDITS',
  },
  MONTHLY_CREDITS: {
    name: 'MONTHLY_CREDITS',
    component: function MonthlyCredits(props) {
      return (
        <RunwayForm.MonthlyCredits
          {...props}
          headerText="Do you have any stable clients or subscription income?"
          description='Do yourself a favor and do not "project revenue growth"'
        />
      )
    },
    prev: 'ONE_TIME_DEBITS',
    next: 'ONE_TIME_CREDITS',
  },
  ONE_TIME_CREDITS: {
    name: 'ONE_TIME_CREDITS',
    component: function OneTimeCredits(props) {
      return (
        <RunwayForm.OneTimeCredits
          {...props}
          headerText="For ongoing projects and the day-to-day, what invoices are out or contracted and scheduled?"
          description="Short-term, one-off, or chronically tight-fisted client payment events."
        />
      )
    },
    submitComponent: RunwayForm.BuildRunwayLabel,
    prev: 'MONTHLY_CREDITS',
    next: 'EDIT_RUNWAY',
  },
}

export const LAID_OFF_WORKFLOW = {
  ...BASE_WORKFLOW,
  WELCOME: {
    ...BASE_WORKFLOW.WELCOME,
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
            description="Check your couches and piggy bank."
          />
        </>
      )
    },
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
          description="Add anything you're pretty sure is coming in. You can add less sure things later."
        />
      )
    },
    prev: 'FUNDS',
    next: 'MONTHLY_CREDITS',
  },
  MONTHLY_CREDITS: {
    name: 'MONTHLY_CREDITS',
    component: function MonthlyCredits(props) {
      return (
        <RunwayForm.MonthlyCredits
          {...props}
          headerText="Do you have any regular monthly earnings?"
          description="Add any income you are expecting each month."
        />
      )
    },
    prev: 'ONE_TIME_CREDITS',
    next: 'MONTHLY_DEBITS_FIXED',
  },
  MONTHLY_DEBITS_FIXED: {
    name: 'MONTHLY_DEBITS_FIXED',
    component: function MONTHLY_DEBITS_FIXED(props) {
      return (
        <>
          <RunwayForm.MonthlyDebitsFixed
            {...props}
            headerText="What fixed expenses must you pay every month?"
            description="These are your expenses that have a regular amount. You can include varied expenses later."
          />
        </>
      )
    },
    prev: 'MONTHLY_CREDITS',
    next: 'MONTHLY_DEBITS_FLEXIBLE',
  },
  MONTHLY_DEBITS_FLEXIBLE: {
    name: 'MONTHLY_DEBITS_FLEXIBLE',
    component: function MONTHLY_DEBITS_FIXED(props) {
      return (
        <>
          <RunwayForm.MonthlyDebitsFlexible
            {...props}
            headerText="What other expenses do you usually have every month?"
            description="These amounts may not be consistent, so you may use a high, low, or average of your spending."
          />
        </>
      )
    },
    prev: 'MONTHLY_DEBITS_FIXED',
    next: 'ONE_TIME_DEBITS',
  },
  ONE_TIME_DEBITS: {
    name: 'ONE_TIME_DEBITS',
    component: function OneTimeDebits(props) {
      return (
        <RunwayForm.OneTimeDebits
          {...props}
          headerText="Do you have any one-time expenses coming up?"
        />
      )
    },
    submitComponent: RunwayForm.BuildRunwayLabel,
    prev: 'MONTHLY_DEBITS_FLEXIBLE',
    next: 'EDIT_RUNWAY',
  },
}
