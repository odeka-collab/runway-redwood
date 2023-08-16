import Zdog from 'zdog'
import Zfont from 'zfont'

Zfont.init(Zdog)

// Set up a font to use
const FONT = new Zdog.Font({
  src: '../../fonts/Ubuntu-Regular.ttf',
})

const RunwayVisualizer = ({ renderData, ...rest }) => {
  return (
    <section>
      {renderData?.months?.length > 0 && (
        <>
          <RunwayView months={renderData.months} />
          <ZRunwayView months={renderData.months} />
        </>
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

function ZRunwayView({ months }) {
  const canvasRef = React.useRef()
  useZDog({ canvasRef, months })
  return <canvas ref={canvasRef} className="zdog-canvas" />
}

function useZDog({ canvasRef, months }) {
  console.log('useZDog()')
  React.useEffect(() => {
    console.log('useZDog.effect')
    canvasRef.current.width = canvasRef.current.parentElement.clientWidth
    const runway = renderRunway(months)

    let animationId
    animate()

    function animate() {
      runway.rotate.y += 0.03
      runway.updateRenderGraph()
      animationId = requestAnimationFrame(animate)
    }

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [canvasRef, months])
}

function renderRunway({ months }) {
  const illo = new Zdog.Illustration({
    element: '.zdog-canvas',
  })

  illo.addChild(
    // circle
    new Zdog.Ellipse({
      diameter: 80,
      translate: { z: 40 },
      stroke: 20,
      color: '#636',
    })
  )

  illo.addChild(
    // square
    new Zdog.Rect({
      width: 80,
      height: 80,
      translate: { z: -40 },
      stroke: 12,
      color: '#E62',
      fill: true,
    })
  )

  illo.addChild(
    // Create a text object
    // This is just a Zdog.Shape object with a couple of extra parameters!
    new Zdog.Text({
      font: FONT,
      value: 'Hey, Zdog!',
      fontSize: 48,
      fill: true,
      color: '#66f',
    })
  )

  return illo
}

export default RunwayVisualizer
