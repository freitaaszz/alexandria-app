import { OrbitControls, Stats, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { hashString } from '@/features/book/geometry'
import { LIBRARY, range } from '@/features/shelf/config'
import { BOOKCASE, SLOT_WIDTH, bookcaseX, slotX } from './layout'

const MODEL = '/modelos/estante.glb'

/**
 * Uma estante com a luz "assada" no Blender: o material vira "básico" (sem
 * calcular luz em tempo real), porque a textura já tem luz, sombra e rebatimentos.
 */
function BakedBookcase({ x }: { x: number }) {
  const { scene } = useGLTF(MODEL)
  const model = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const original = child.material as THREE.MeshStandardMaterial
        const map = original.map
        if (map) map.colorSpace = THREE.SRGBColorSpace
        child.material = new THREE.MeshBasicMaterial({ map })
      }
    })
    return clone
  }, [scene])
  return <primitive object={model} position={[x, 0, 0]} />
}

/**
 * 204 livros (todas as prateleiras cheias) num único objeto "instanciado":
 * a placa de vídeo desenha todos de uma vez. Pior caso para medir desempenho.
 */
function StressBooks() {
  const ref = useRef<THREE.InstancedMesh>(null)
  const count =
    LIBRARY.bookcases * LIBRARY.shelvesPerBookcase * LIBRARY.slotsPerShelf

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    const color = new THREE.Color()
    let i = 0
    for (const bc of range(LIBRARY.bookcases))
      for (const sh of range(LIBRARY.shelvesPerBookcase))
        for (const s of range(LIBRARY.slotsPerShelf)) {
          const h = hashString(`${bc}-${sh}-${s}`)
          const width = SLOT_WIDTH * (0.5 + 0.48 * h)
          const height =
            BOOKCASE.bookMaxHeight * (0.8 + 0.2 * hashString(`h${i}`))
          m.compose(
            new THREE.Vector3(
              slotX(bc, s),
              BOOKCASE.shelfFloors[sh] + height / 2,
              -(BOOKCASE.bookInset + BOOKCASE.bookDepth / 2),
            ),
            new THREE.Quaternion(),
            new THREE.Vector3(width, height, BOOKCASE.bookDepth),
          )
          mesh.setMatrixAt(i, m)
          mesh.setColorAt(
            i,
            color.setHSL(h, 0.45, 0.22 + 0.1 * hashString(`c${i}`)),
          )
          i++
        }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [])

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry />
      <meshStandardMaterial roughness={0.7} />
    </instancedMesh>
  )
}

/** Prova de desempenho da cena 3D (abre com ?3d na URL). */
export default function Scene3D() {
  return (
    <div className="fixed inset-0 bg-[#080503]">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 1.25, 4.2], fov: 38, near: 0.05, far: 50 }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
        }}
      >
        <color attach="background" args={['#080503']} />
        <fog attach="fog" args={['#080503', 6, 14]} />

        {/* Luz só para os livros (as estantes já vêm iluminadas do Blender) */}
        <ambientLight intensity={0.35} color="#ffd9b0" />
        <directionalLight
          position={[-2, 3, 3]}
          intensity={1.6}
          color="#ffb36b"
        />
        <directionalLight
          position={[3, 1.5, 2]}
          intensity={0.35}
          color="#9fb6ff"
        />

        {/* As estantes aparecem quando o modelo terminar de carregar */}
        <Suspense fallback={null}>
          {range(LIBRARY.bookcases).map((bc) => (
            <BakedBookcase key={bc} x={bookcaseX(bc)} />
          ))}
        </Suspense>
        <StressBooks />

        <OrbitControls
          target={[0, 1.15, 0]}
          enableDamping
          minDistance={1}
          maxDistance={8}
        />
        <Stats />
      </Canvas>
    </div>
  )
}

useGLTF.preload(MODEL)
