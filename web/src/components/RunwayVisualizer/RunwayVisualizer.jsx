import anime from 'animejs'
import Zdog, { TAU } from 'zdog'
import Zfont from 'zfont'

Zfont.init(Zdog)

// Set up a font to use
const FONT = new Zdog.Font({
  src: '/fonts/Ubuntu-Regular.ttf',
})

const DISPLAY = {
  AIRPLANE: {
    COLOR: {
      FUSELAGE: 'darkorange',
      TAIL_Y: 'darkorange',
      TAIL_X: 'darkcyan',
      WINGS: 'darkcyan',
      WINDOW: 'lightskyblue',
    },
    SIZE: 1,
  },
  SEGMENT: {
    BAR: {
      WIDTH: 80,
      HEIGHT: 100,
      DEPTH: 60,
      COLOR: {
        FUNDED: {
          frontFace: 'hsla(43, 74%, 49%, 1.0)',
          rearFace: 'hsla(43, 89%, 38%, 1.0)',
          leftFace: 'hsla(43, 74%, 49%, 1.0)',
          rightFace: 'hsla(43, 89%, 38%, 1.0)',
          topFace: 'hsla(43, 74%, 49%, 1.0)',
          bottomFace: 'hsla(43, 89%, 38%, 1.0)',
        },
        PARTIAL: {
          frontFace: 'hsla(43, 74%, 49%, 0.5)',
          rearFace: 'hsla(43, 89%, 38%, 0.5)',
          leftFace: 'hsla(43, 74%, 49%, 0.5)',
          rightFace: 'hsla(43, 89%, 38%, 0.5)',
          topFace: 'hsla(43, 74%, 49%, 0.5)',
          bottomFace: 'hsla(43, 89%, 38%, 0.5)',
        },
      },
    },
    TEXT: {
      MARGIN: 20,
      FONT_SIZE: 24,
      COLOR: {
        FUNDED: '#66f',
        PARTIAL: '#99f',
      },
    },
  },
}

const RunwayVisualizer = ({ data }) => {
  const [scenario, setScenario] = React.useState(data?.scenarios?.[0])

  const showScenarios = data?.scenarios?.length > 0

  const sectionClassName = showScenarios ? 'grid sm:grid-cols-2' : ''

  return (
    data?.months?.length > 0 && (
      <section className={sectionClassName}>
        <div>
          <h3 className="text-lg uppercase">Your Runway</h3>
          <figure>
            <RunwayVisualizerView data={data} />
          </figure>
        </div>
        {showScenarios && (
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg uppercase">What if&hellip;</h3>
              <select
                onChange={(e) => {
                  setScenario(
                    data.scenarios.find(
                      ({ name }) => name === e.currentTarget.value
                    )
                  )
                }}
                className="text-lg font-bold"
              >
                {!data?.scenarios?.[0] && <option>Select</option>}
                {data?.scenarios.map((scenario, i) => (
                  <option key={i} value={scenario.name}>
                    {scenario.name}
                  </option>
                ))}
              </select>
            </div>
            {scenario && (
              <figure>
                <RunwayVisualizerView data={scenario} />
              </figure>
            )}
          </div>
        )}
      </section>
    )
  )
}

function RunwayVisualizerView({ data: { id, months } }) {
  const canvasRef = React.useRef()

  id = `zdog-canvas-${id}`

  const runway = useVisualizer({
    element: `.${id}`,
    canvasRef,
    months,
    dragRotate: true,
  })

  useAnime(runway)

  return <canvas ref={canvasRef} className={id} />
}

function useVisualizer({
  canvasRef,
  element,
  months,
  width,
  height,
  dragRotate = false,
}) {
  const [state, setState] = React.useState({})

  React.useEffect(() => {
    const stage = {
      width: width || canvasRef.current.parentElement.clientWidth,
      height: height || Math.floor(window.innerHeight * (1 / 3)),
    }

    canvasRef.current.width = stage.width
    canvasRef.current.height = stage.height

    const illo = new Zdog.Illustration({
      element,
      dragRotate,
    })

    const root = new Zdog.Anchor()
    illo.addChild(root)

    const runway = { root: new Zdog.Anchor() }
    root.addChild(runway.root)

    runway.segments = months.map((month, i) => {
      const segment = renderSegment(month)
      segment.root.translate.x = i * DISPLAY.SEGMENT.BAR.WIDTH
      runway.root.addChild(segment.root)
      return { root, ...segment }
    })

    const airplane = renderAirplane()
    airplane.root.translate.y =
      -DISPLAY.SEGMENT.BAR.HEIGHT -
      DISPLAY.SEGMENT.TEXT.MARGIN -
      DISPLAY.AIRPLANE.SIZE

    root.addChild(airplane.root)

    let _animationId
    if (dragRotate) {
      _animate()
    }

    function _animate() {
      // TODO: set drag state
      // NB: __must__ updateRenderGraph for drag rotation to work
      illo.updateRenderGraph()
      _animationId = requestAnimationFrame(_animate)
    }

    setState({ illo, root, runway, airplane, stage })

    return () => {
      if (dragRotate) {
        cancelAnimationFrame(_animationId)
      }
    }
  }, [element, canvasRef, months, width, height, dragRotate])

  return state
}

function renderSegment({ label, balance }) {
  const bar = new Zdog.Box({
    width: DISPLAY.SEGMENT.BAR.WIDTH,
    height: 1,
    depth: DISPLAY.SEGMENT.BAR.DEPTH,
    // highlight when the month's ending balance is positive
    ...(balance.end >= 0
      ? DISPLAY.SEGMENT.BAR.COLOR.FUNDED
      : DISPLAY.SEGMENT.BAR.COLOR.PARTIAL),
  })

  const text = new Zdog.Text({
    font: FONT,
    value: label,
    fontSize: DISPLAY.SEGMENT.TEXT.FONT_SIZE,
    fill: true,
    color:
      // highlight when the month's ending balance is positive
      balance.end >= 0
        ? DISPLAY.SEGMENT.TEXT.COLOR.FUNDED
        : DISPLAY.SEGMENT.TEXT.COLOR.PARTIAL,
    translate: {
      x: -bar.width / 2,
      y: bar.height / 2 + DISPLAY.SEGMENT.TEXT.MARGIN,
      z: bar.depth / 2 + DISPLAY.SEGMENT.TEXT.MARGIN,
    },
  })

  const root = new Zdog.Anchor()
  root.addChild(bar)
  root.addChild(text)

  return { root, bar, text }
}

function renderAirplane() {
  const root = new Zdog.Anchor()

  const fuselage = new Zdog.Group()

  const cabin = new Zdog.Hemisphere({
    diameter: DISPLAY.AIRPLANE.SIZE * 36,
    color: DISPLAY.AIRPLANE.COLOR.FUSELAGE,
    rotate: { x: TAU / 4, y: -TAU / 4 },
  })

  const firstClass = new Zdog.Cylinder({
    diameter: cabin.diameter,
    length: DISPLAY.AIRPLANE.SIZE * 10,
    color: DISPLAY.AIRPLANE.COLOR.FUSELAGE,
    translate: { x: DISPLAY.AIRPLANE.SIZE * -6 },
    rotate: { x: TAU / 4, y: TAU / 4 },
  })

  const coach = new Zdog.Cone({
    diameter: cabin.diameter,
    length: DISPLAY.AIRPLANE.SIZE * 48,
    color: DISPLAY.AIRPLANE.COLOR.FUSELAGE,
    translate: { x: DISPLAY.AIRPLANE.SIZE * -12 },
    rotate: { x: TAU / 4, y: TAU / 4 },
  })

  const tailV = new Zdog.Shape({
    path: [
      { x: DISPLAY.AIRPLANE.SIZE * -48, y: DISPLAY.AIRPLANE.SIZE * -2 },
      { x: DISPLAY.AIRPLANE.SIZE * -68, y: DISPLAY.AIRPLANE.SIZE * -24 },
      { x: DISPLAY.AIRPLANE.SIZE * -82, y: DISPLAY.AIRPLANE.SIZE * -24 },
      { x: DISPLAY.AIRPLANE.SIZE * -70, y: DISPLAY.AIRPLANE.SIZE * -2 },
    ],
    closed: true,
    stroke: DISPLAY.AIRPLANE.SIZE * 8,
    color: DISPLAY.AIRPLANE.COLOR.TAIL_Y,
    fill: DISPLAY.AIRPLANE.COLOR.TAIL_Y,
  })

  const tailR = tailV.copyGraph({
    color: DISPLAY.AIRPLANE.COLOR.TAIL_X,
    fill: DISPLAY.AIRPLANE.COLOR.TAIL_X,
    rotate: { x: -TAU / 4 },
    scale: 0.8,
    translate: {
      x: DISPLAY.AIRPLANE.SIZE * -24,
      y: DISPLAY.AIRPLANE.SIZE * -12,
      z: DISPLAY.AIRPLANE.SIZE * 8,
    },
  })

  const tailL = tailR.copyGraph({
    rotate: { x: TAU / 4 },
    translate: {
      x: DISPLAY.AIRPLANE.SIZE * -24,
      y: DISPLAY.AIRPLANE.SIZE * -12,
      z: DISPLAY.AIRPLANE.SIZE * -8,
    },
  })

  const wingR = new Zdog.Shape({
    path: [
      { x: DISPLAY.AIRPLANE.SIZE * -12, y: DISPLAY.AIRPLANE.SIZE * -24 },
      { x: DISPLAY.AIRPLANE.SIZE * -20, y: DISPLAY.AIRPLANE.SIZE * -56 },
      { x: DISPLAY.AIRPLANE.SIZE * -42, y: DISPLAY.AIRPLANE.SIZE * -58 },
      { x: DISPLAY.AIRPLANE.SIZE * -38, y: DISPLAY.AIRPLANE.SIZE * -14 },
    ],
    closed: true,
    stroke: DISPLAY.AIRPLANE.SIZE * 8,
    fill: DISPLAY.AIRPLANE.COLOR.WINGS,
    color: DISPLAY.AIRPLANE.COLOR.WINGS,
    rotate: { x: -TAU / 4 },
  })

  const wingL = wingR.copy({
    rotate: { x: TAU / 4 },
  })

  const window = new Zdog.Ellipse({
    diameter: DISPLAY.AIRPLANE.SIZE * 14,
    quarters: 1,
    stroke: DISPLAY.AIRPLANE.SIZE * 6,
    color: DISPLAY.AIRPLANE.COLOR.WINDOW,
    translate: { x: DISPLAY.AIRPLANE.SIZE * 6, y: DISPLAY.AIRPLANE.SIZE * -12 },
    rotate: { x: TAU / 4, z: TAU / 8 },
  })

  fuselage.addChild(cabin)
  fuselage.addChild(firstClass)
  fuselage.addChild(coach)
  root.addChild(fuselage)
  root.addChild(wingR)
  root.addChild(wingL)
  root.addChild(tailV)
  root.addChild(tailR)
  root.addChild(tailL)
  root.addChild(window)

  return {
    root,
    cabin,
    firstClass,
    coach,
    wingR,
    wingL,
    tailV,
    tailR,
    tailL,
    window,
  }
}

function useAnime(runway) {
  React.useEffect(() => {
    if (runway?.illo) {
      const timeline = anime.timeline({
        change: function () {
          runway.illo.updateRenderGraph()
        },
      })

      timeline.add({
        targets: runway.root.rotate,
        duration: runway.runway.segments.length * (1000 - 700),
        easing: 'easeInOutCubic',
        x: -TAU / 30,
        y: TAU / 18,
      })

      const rootState = {
        translate: { x: 0 },
      }

      timeline.add(
        {
          targets: rootState.translate,
          duration: runway.runway.segments.length * (1000 - 700),
          easing: 'easeInOutCubic',
          x: -(runway.runway.segments.length * DISPLAY.SEGMENT.BAR.WIDTH),
          update: function () {
            runway.runway.root.translate.x = rootState.translate.x
          },
        },
        500
      )

      const segmentTimeline = anime.timeline()

      runway.runway.segments.forEach((segment) => {
        const segmentState = { height: 0 }

        segmentTimeline.add(
          {
            targets: segmentState,
            easing: 'easeInOutSine',
            duration: 1000,
            height: DISPLAY.SEGMENT.BAR.HEIGHT,
            update: function () {
              const prevBar = segment.bar
              const height = anime.get(segmentState, 'height')
              segment.bar = segment.bar.copy({
                height,
                translate: { y: -height / 2 },
              })
              prevBar.remove()
            },
          },
          '-=700'
        )
      })

      segmentTimeline.add(
        {
          targets: runway.airplane.root.rotate,
          easing: 'easeInSine',
          duration: 1000,
          z: -TAU / 32,
        },
        '-=500'
      )
    }
  }, [runway])
}

export default RunwayVisualizer
