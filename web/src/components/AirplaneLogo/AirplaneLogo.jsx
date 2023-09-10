import Zdog, { TAU } from 'zdog'

import {
  DISPLAY_DEFAULT,
  renderAirplane,
} from 'src/components/RunwayVisualizer/RunwayVisualizer'

const AirplaneLogo = () => {
  useAirplaneLogo({
    element: '.airplane_logo',
  })

  return <canvas className="airplane_logo" width={80} height={50} />
}

export default AirplaneLogo

function useAirplaneLogo({ element }) {
  console.log('useAirplaneLogo()', element)
  React.useEffect(() => {
    const illo = new Zdog.Illustration({
      element,
      rotate: {
        x: TAU / -15,
        y: TAU / 18,
        z: -TAU / 15,
      },
    })

    const root = new Zdog.Anchor()
    illo.addChild(root)

    const airplane = renderAirplane({
      display: {
        ...DISPLAY_DEFAULT,
        AIRPLANE: {
          ...DISPLAY_DEFAULT.AIRPLANE,
          SIZE: 0.5,
        },
      },
    })
    airplane.root.translate.x = 24
    airplane.root.translate.y = 6
    root.addChild(airplane.root)

    let _animationId
    _animate()

    function _animate() {
      illo.rotate.y += 0.005
      illo.updateRenderGraph()
      _animationId = requestAnimationFrame(_animate)
    }

    return () => {
      cancelAnimationFrame(_animationId)
    }
  }, [element])
}
