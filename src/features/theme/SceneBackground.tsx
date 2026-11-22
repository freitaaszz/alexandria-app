import { THEME } from './themes'

/**
 * O fundo do cenário (parede do castelo renderizada no Blender) e a luz por cima:
 * vinheta escura nas bordas e uma luz quente que tremula devagar, como velas.
 */
export function SceneBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <picture>
        <source
          media="(min-width: 64rem)"
          srcSet={THEME.images.backgroundDesktop}
        />
        <img
          src={THEME.images.backgroundMobile}
          alt=""
          className="size-full object-cover object-[50%_35%]"
        />
      </picture>
      {/* Luz quente das velas da sala, tremulando */}
      <div className="scene-flicker absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_45%,rgb(255_160_80/0.16),transparent_70%)] mix-blend-screen" />
      {/* Vinheta: bordas e topo mergulhados na sombra */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_55%,transparent_45%,rgb(5_3_2/0.85)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[rgb(8_5_3)] to-transparent" />
    </div>
  )
}
