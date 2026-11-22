import { Suspense, lazy } from 'react'
import App from '@/App'

// Prova da cena 3D (etapa 8.1): abre com ?3d na URL. Carregada à parte para
// não pesar na versão atual.
const Scene3D = lazy(() => import('@/features/scene3d/Scene3D'))
const show3d = new URLSearchParams(window.location.search).has('3d')

export default function Root() {
  return show3d ? (
    <Suspense fallback={null}>
      <Scene3D />
    </Suspense>
  ) : (
    <App />
  )
}
