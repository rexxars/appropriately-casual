import * as THREE from 'three'
import React, { Suspense, useCallback, useRef } from 'react'
import { Canvas, useFrame, useThree } from 'react-three-fiber'
import lerp from 'lerp'
import Effects from './Effects'
import Sparks from './Sparks'
import Particles from './Particles'
import JSONfont from './Roboto_Regular.json'
import {phenomena} from './phenomena'

const inputStyle = { margin: '0 10px', backgroundColor: '#000', position: 'absolute', bottom: '2.5vh' }

function TextMesh({ text, yOffset, mouse }) {
  const mesh = useRef(null)
  const { size, viewport } = useThree()
  const aspect = size.width / viewport.width

  useFrame(() => {
    if (mesh.current) {
      mesh.current.position.x = lerp(mesh.current.position.x, mouse.current[0] / aspect / 10 - 100, 0.1)
      mesh.current.rotation.x = lerp(mesh.current.rotation.x, 0 + mouse.current[1] / aspect / 140 + 0.2, 0.1)
      mesh.current.rotation.y = 0.0
      mesh.current.position.y = lerp(mesh.current.position.y, mouse.current[0] / aspect / 10 - yOffset, 0.1)
    }
  })

  // parse JSON file with Three
  const font = new THREE.FontLoader().parse(JSONfont)

  // configure font geometry
  const textOptions = {
    font,
    size: 10,
    height: 1
  }

  return (
    <Suspense fallback={null}>
      <mesh position={[800, 0, -80]} ref={mesh}>
        <textGeometry attach="geometry" args={[text, textOptions]} />
        <meshBasicMaterial attach="material" args={[]} />
      </mesh>
    </Suspense>
  )
}

function getClientQuery() {
  if (typeof window === 'undefined') {
    return {}
  }

  const qs = new URLSearchParams(window.location.search)
  return {
    text: qs.get('text'),
    singular: qs.get('singular')
  }
}

export default function App(props) {
  const [renderPass, bumpRenderPass] = React.useState(0)
  const query = props.query && Object.keys(props.query) > 0 ? props.query : getClientQuery()

  const text = query.text || props.defaultPhenomena || phenomena[0]
  const isSingular = query.singular === 'true'

  const toggleSingular = React.useCallback((newState) => {
    const singular = !isSingular ? `&singular=true` : ''
    window.history.replaceState(null, document.title, `/?text=${encodeURIComponent(text)}${singular}`)
    bumpRenderPass(renderPass + 1)
  })

  const setText = React.useCallback((newText) => {
    const singular = isSingular ? `&singular=true` : ''
    window.history.replaceState(null, document.title, `/?text=${encodeURIComponent(newText)}${singular}`)
    bumpRenderPass(renderPass + 1)
  })

  const mouse = useRef([0, 0])
  const onMouseMove = useCallback(({ clientX: x, clientY: y }) => (mouse.current = [x - window.innerWidth / 2, y - window.innerHeight / 2]), [])
  const isMobile = /iPhone|iPad|iPod|Android/i.test(typeof navigator === 'undefined' ? '' : navigator.userAgent)

  const sanitizedText = text.replace(/[^a-z ]/g, '').replace(/ +/, ' ')

  return (
    <div>
      <Canvas
        style={{ position: 'absolute', bottom: 0 }}
        pixelRatio={Math.min(2, isMobile ? window.devicePixelRatio : 1)}
        camera={{ fov: 100, position: [0, 0, 50] }}
        onMouseMove={onMouseMove}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#020207'))
        }}>
        <fog attach="fog" args={['white', 1, 190]} />
        <pointLight distance={100} intensity={2} color="white" />
        <TextMesh yOffset={0} mouse={mouse} text={sanitizedText} />
        <TextMesh yOffset={20} mouse={mouse} text={`${isSingular ? 'is' : 'are'} appropriately casual`} />
        <Particles count={isMobile ? 5000 : 10000} mouse={mouse} />
        <Sparks count={20} mouse={mouse} colors={['#A2CCB6', '#FCEEB5', '#EE786E', '#e0feff', 'lightpink', 'lightblue']} />
        <Effects />
      </Canvas>
      <div style={inputStyle}>
        <div>
          <input type="text" name="text" defaultValue={text} onChange={(evt) => setText(evt.target.value)} />
        </div>
        <label>
          <input type="checkbox" name="singular" checked={isSingular} onChange={toggleSingular} />
          Singular
        </label>
      </div>
    </div>
  )
}
