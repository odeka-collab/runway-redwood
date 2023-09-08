import anime from 'animejs'
import Zdog, { TAU } from 'zdog'
import Zfont from 'zfont'

import { ScenarioContext } from '../RunwayWizard'

Zfont.init(Zdog)

// Set up a font to use
const FONT = new Zdog.Font({
  src: '/fonts/Ubuntu-Regular.ttf',
})

export const DISPLAY_DEFAULT = {
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
      HEIGHT: 10,
      DEPTH: 60,
      COLOR: {
        FUNDED: {
          frontFace: 'hsla(43, 74%, 49%, 1.0)',
          rearFace: 'hsla(43, 89%, 38%, 1.0)',
          leftFace: 'hsla(43, 74%, 49%, 1.0)',
          rightFace: 'hsla(43, 89%, 38%, 1.0)',
          topFace: 'hsla(153, 74%, 49%, 1.0)',
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

export const DISPLAY_SCENARIO = {
  AIRPLANE: {
    COLOR: {
      FUSELAGE: 'green',
      TAIL_Y: 'green',
      TAIL_X: 'green',
      WINGS: 'darkcyan',
      WINDOW: 'lightskyblue',
    },
    SIZE: 1,
  },
  SEGMENT: {
    BAR: {
      WIDTH: 80,
      HEIGHT: 10,
      DEPTH: 60,
      COLOR: {
        FUNDED: {
          frontFace: 'hsla(43, 74%, 49%, 1.0)',
          rearFace: 'hsla(43, 89%, 38%, 1.0)',
          leftFace: 'hsla(43, 74%, 49%, 1.0)',
          rightFace: 'hsla(43, 89%, 38%, 1.0)',
          topFace: 'hsla(153, 74%, 49%, 1.0)',
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
  const { scenario, setScenario } = React.useContext(ScenarioContext)

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
                <RunwayVisualizerView
                  data={scenario}
                  display={DISPLAY_SCENARIO}
                />
              </figure>
            )}
          </div>
        )}
      </section>
    )
  )
}

function RunwayVisualizerView({
  data: { id, months },
  display = DISPLAY_DEFAULT,
}) {
  const canvasRef = React.useRef()

  id = `zdog-canvas-${id}`

  const runway = useVisualizer({
    display,
    element: `.${id}`,
    canvasRef,
    months,
    dragRotate: true,
  })

  useAnime(runway, { display })

  return <canvas ref={canvasRef} className={id} />
}

function useVisualizer({
  canvasRef,
  element,
  months,
  width,
  height,
  display,
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

    runway.segments = months.map((month, i, arr) => {
      const segment = renderSegment(month, {
        isFirst: i === 0,
        isLast: i === arr.length - 1,
        display,
      })
      segment.root.translate.x = i * display.SEGMENT.BAR.WIDTH
      runway.root.addChild(segment.root)
      return { root, ...segment }
    })

    const airplane = renderAirplane({ display })
    airplane.root.translate.y =
      -display.SEGMENT.BAR.HEIGHT -
      display.SEGMENT.TEXT.MARGIN -
      display.AIRPLANE.SIZE

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
  }, [element, canvasRef, months, width, height, dragRotate, display])

  return state
}

function renderSegment(
  { balance, monthLabel, yearLabel },
  { isFirst, isLast, display }
) {
  const bar = new Zdog.Box({
    width: display.SEGMENT.BAR.WIDTH,
    height: 1,
    depth: display.SEGMENT.BAR.DEPTH,
    // highlight when the month's ending balance is positive
    ...(balance.end >= 0
      ? display.SEGMENT.BAR.COLOR.FUNDED
      : display.SEGMENT.BAR.COLOR.PARTIAL),
  })

  const text = new Zdog.Group()

  const month = new Zdog.Text({
    font: FONT,
    value: monthLabel,
    fontSize: display.SEGMENT.TEXT.FONT_SIZE,
    fill: true,
    color:
      // highlight when the month's ending balance is positive
      balance.end >= 0
        ? display.SEGMENT.TEXT.COLOR.FUNDED
        : display.SEGMENT.TEXT.COLOR.PARTIAL,
    translate: {
      x: -bar.width / 2,
      y: bar.height / 2 + display.SEGMENT.TEXT.MARGIN,
      z: bar.depth / 2 + display.SEGMENT.TEXT.MARGIN,
    },
  })

  const root = new Zdog.Anchor()
  root.addChild(bar)
  root.addChild(text)
  text.addChild(month)

  let year
  if (monthLabel === 'Jan' || isFirst || isLast) {
    year = new Zdog.Text({
      font: FONT,
      value: yearLabel,
      fontSize: display.SEGMENT.TEXT.FONT_SIZE,
      fill: true,
      color:
        // highlight when the month's ending balance is positive
        balance.end >= 0
          ? display.SEGMENT.TEXT.COLOR.FUNDED
          : display.SEGMENT.TEXT.COLOR.PARTIAL,
      translate: {
        x: -bar.width / 2,
        y:
          bar.height / 2 +
          display.SEGMENT.TEXT.MARGIN +
          display.SEGMENT.TEXT.FONT_SIZE,
        z: bar.depth / 2 + display.SEGMENT.TEXT.MARGIN,
      },
    })

    text.addChild(year)
  }

  return { root, bar, text: { month, year } }
}

function renderAirplane({ display }) {
  const root = new Zdog.Anchor()

  const fuselage = new Zdog.Group()

  const cabin = new Zdog.Hemisphere({
    diameter: display.AIRPLANE.SIZE * 36,
    color: display.AIRPLANE.COLOR.FUSELAGE,
    rotate: { x: TAU / 4, y: -TAU / 4 },
  })

  const firstClass = new Zdog.Cylinder({
    diameter: cabin.diameter,
    length: display.AIRPLANE.SIZE * 10,
    color: display.AIRPLANE.COLOR.FUSELAGE,
    translate: { x: display.AIRPLANE.SIZE * -6 },
    rotate: { x: TAU / 4, y: TAU / 4 },
  })

  const coach = new Zdog.Cone({
    diameter: cabin.diameter,
    length: display.AIRPLANE.SIZE * 48,
    color: display.AIRPLANE.COLOR.FUSELAGE,
    translate: { x: display.AIRPLANE.SIZE * -12 },
    rotate: { x: TAU / 4, y: TAU / 4 },
  })

  const tailV = new Zdog.Shape({
    path: [
      { x: display.AIRPLANE.SIZE * -48, y: display.AIRPLANE.SIZE * -2 },
      { x: display.AIRPLANE.SIZE * -68, y: display.AIRPLANE.SIZE * -24 },
      { x: display.AIRPLANE.SIZE * -82, y: display.AIRPLANE.SIZE * -24 },
      { x: display.AIRPLANE.SIZE * -70, y: display.AIRPLANE.SIZE * -2 },
    ],
    closed: true,
    stroke: display.AIRPLANE.SIZE * 8,
    color: display.AIRPLANE.COLOR.TAIL_Y,
    fill: display.AIRPLANE.COLOR.TAIL_Y,
  })

  const tailR = tailV.copyGraph({
    color: display.AIRPLANE.COLOR.TAIL_X,
    fill: display.AIRPLANE.COLOR.TAIL_X,
    rotate: { x: -TAU / 4 },
    scale: 0.8,
    translate: {
      x: display.AIRPLANE.SIZE * -24,
      y: display.AIRPLANE.SIZE * -12,
      z: display.AIRPLANE.SIZE * 8,
    },
  })

  const tailL = tailR.copyGraph({
    rotate: { x: TAU / 4 },
    translate: {
      x: display.AIRPLANE.SIZE * -24,
      y: display.AIRPLANE.SIZE * -12,
      z: display.AIRPLANE.SIZE * -8,
    },
  })

  const wingR = new Zdog.Shape({
    path: [
      { x: display.AIRPLANE.SIZE * -12, y: display.AIRPLANE.SIZE * -24 },
      { x: display.AIRPLANE.SIZE * -20, y: display.AIRPLANE.SIZE * -56 },
      { x: display.AIRPLANE.SIZE * -42, y: display.AIRPLANE.SIZE * -58 },
      { x: display.AIRPLANE.SIZE * -38, y: display.AIRPLANE.SIZE * -14 },
    ],
    closed: true,
    stroke: display.AIRPLANE.SIZE * 8,
    fill: display.AIRPLANE.COLOR.WINGS,
    color: display.AIRPLANE.COLOR.WINGS,
    rotate: { x: -TAU / 4 },
  })

  const wingL = wingR.copy({
    rotate: { x: TAU / 4 },
  })

  const window = new Zdog.Ellipse({
    diameter: display.AIRPLANE.SIZE * 14,
    quarters: 1,
    stroke: display.AIRPLANE.SIZE * 6,
    color: display.AIRPLANE.COLOR.WINDOW,
    translate: { x: display.AIRPLANE.SIZE * 6, y: display.AIRPLANE.SIZE * -12 },
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

function useAnime(runway, { display }) {
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
          x: -(runway.runway.segments.length * display.SEGMENT.BAR.WIDTH),
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
            height: display.SEGMENT.BAR.HEIGHT,
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
  }, [runway, display])
}

export default RunwayVisualizer
