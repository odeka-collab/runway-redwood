import { RunwayContext } from 'src/providers/RunwayProvider'

export default function useRunway() {
  const { dispatch, ...state } = React.useContext(RunwayContext)

  async function update(data) {
    dispatch({ type: 'patch', payload: { data } })
    return { ...state, data }
  }

  async function skipToStep(step) {
    dispatch({ type: 'patch', payload: step })
  }

  return {
    skipToStep,
    update,
    ...state,
  }
}
