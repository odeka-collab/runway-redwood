const RunwayVisualizer = ({ renderData, ...rest }) => {
  return (
    <section>
      {renderData?.months?.length > 0 && (
        <RunwayView months={renderData.months} />
      )}
      <pre>{JSON.stringify({ renderData, ...rest }, null, 2)}</pre>
    </section>
  )
}

function RunwayView({ months }) {
  return (
    <div className="flex w-full">
      {months?.map(({ label, debit, funded }) => {
        return (
          <div key={label}>
            <div
              className={`
              h-72 w-24
              border-collapse border-blue-900
              ${
                !debit || funded >= debit
                  ? 'border-2 border-solid bg-blue-600'
                  : 'border border-dashed bg-blue-400'
              }
              text-center
            `
                .replace(/\s+/g, ' ')
                .trim()}
            ></div>
            <div className="text-center">{label}</div>
          </div>
        )
      })}
    </div>
  )
}

export default RunwayVisualizer
