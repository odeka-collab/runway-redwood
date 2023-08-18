import anime from 'animejs'
import { v4 as uuidv4 } from 'uuid'
import Zdog, { TAU } from 'zdog'
import Zfont from 'zfont'

Zfont.init(Zdog)

// Set up a font to use
const FONT = new Zdog.Font({
  src: '../../fonts/Ubuntu-Regular.ttf',
})

const DISPLAY = {
  SEGMENT: {
    BAR: {
      WIDTH: 80,
      HEIGHT: 240,
      DEPTH: 60,
      COLOR: {
        FUNDED: {
          frontFace: 'hsla(30, 89%, 52%, 1.0)',
          rearFace: 'hsla(30, 68%, 52%, 1.0)',
          leftFace: 'hsla(30, 68%, 52%, 1.0)',
          rightFace: 'hsla(30, 68%, 52%, 1.0)',
          topFace: 'hsla(30, 89%, 52%, 1.0)',
          bottomFace: 'hsla(30, 68%, 52%, 1.0)',
        },
        PARTIAL: {
          frontFace: 'hsla(30, 89%, 52%, 0.5)',
          rearFace: 'hsla(30, 68%, 52%, 0.5)',
          leftFace: 'hsla(30, 68%, 52%, 0.5)',
          rightFace: 'hsla(30, 68%, 52%, 0.5)',
          topFace: 'hsla(30, 89%, 52%, 0.5)',
          bottomFace: 'hsla(30, 68%, 52%, 0.5)',
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

const RunwayVisualizer = ({ id = uuidv4(), data, ...props }) => {
  return (
    <section>
      {data?.months?.length > 0 && (
        <>
          <RunwayView {...{ data, id: data.id || uuidv4() }} />
        </>
      )}
      <pre>{JSON.stringify({ id, data, ...props }, null, 2)}</pre>
    </section>
  )
}

function RunwayView({ id, data: { months } }) {
  const canvasRef = React.useRef()
  const runway = useRunway({
    element: `.zdog-canvas-${id}`,
    canvasRef,
    months,
    dragRotate: true,
  })
  useAnime(runway)
  return <canvas ref={canvasRef} className={`zdog-canvas-${id}`} />
}

function useRunway({
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
      height: height || Math.floor(window.innerHeight * (2 / 3)),
    }

    canvasRef.current.width = stage.width
    canvasRef.current.height = stage.height

    const illo = new Zdog.Illustration({
      element,
      dragRotate,
    })

    const root = new Zdog.Anchor()

    illo.addChild(root)

    const segments = months.map((month, i) => {
      const segment = renderSegment(month)
      segment.root.translate.x = i * DISPLAY.SEGMENT.BAR.WIDTH
      root.addChild(segment.root)
      return { root, ...segment }
    })

    let _animationId
    if (dragRotate) {
      _animate()
    }

    function _animate() {
      // TODO: set drag state
      // __must__ updateRenderGraph for drag rotation to work
      illo.updateRenderGraph()
      _animationId = requestAnimationFrame(_animate)
    }

    setState({ illo, root, segments, stage })

    return () => {
      if (dragRotate) {
        cancelAnimationFrame(_animationId)
      }
    }
  }, [element, canvasRef, months, width, height, dragRotate])

  return state
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
        duration: runway.segments.length * (1000 - 700),
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
          duration: runway.segments.length * (1000 - 700),
          easing: 'easeInOutCubic',
          x: -(runway.segments.length * DISPLAY.SEGMENT.BAR.WIDTH),
          update: function () {
            runway.root.translate.x = rootState.translate.x
          },
        },
        500
      )

      const segmentTimeline = anime.timeline()

      runway.segments.forEach((segment) => {
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
    }
  }, [runway])
}

function renderSegment({ label, debit, funded }) {
  const bar = new Zdog.Box({
    width: DISPLAY.SEGMENT.BAR.WIDTH,
    height: 1,
    depth: DISPLAY.SEGMENT.BAR.DEPTH,
    ...(!debit || funded >= debit
      ? DISPLAY.SEGMENT.BAR.COLOR.FUNDED
      : DISPLAY.SEGMENT.BAR.COLOR.PARTIAL),
  })

  const text = new Zdog.Text({
    font: FONT,
    value: label,
    fontSize: DISPLAY.SEGMENT.TEXT.FONT_SIZE,
    fill: true,
    color:
      !debit || funded >= debit
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

export default RunwayVisualizer
