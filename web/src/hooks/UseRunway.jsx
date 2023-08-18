import { RunwayContext } from 'src/providers/RunwayProvider'

export default function useRunway() {
  const { dispatch, ...state } = React.useContext(RunwayContext)

  async function update(data) {
    dispatch({ type: 'patch', payload: { data } })
    return { ...state, data }
  }

  return {
    update,
    ...state,
  }
}
