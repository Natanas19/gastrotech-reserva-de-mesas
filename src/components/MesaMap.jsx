import React, { useState, useRef, useEffect } from 'react'

const POSICOES = [
  { x: 12.5, y: 11 },
  { x: 25.7, y: 11 },
  { x: 38.8, y: 11 },
  { x: 64,   y: 11 },
  { x: 77.3, y: 11 },
  { x: 89.5, y: 11 },
  { x: 12.5, y: 51.3 },
  { x: 25.7, y: 51.3 },
  { x: 38.8, y: 51.3 },
  { x: 63.2, y: 51.3 },
  { x: 76.3, y: 51.3 },
  { x: 89.5, y: 51.3 },
]

const MESAS_POR_CAPACIDADE = {
  2:  [0,1,2,3],
  4:  [4,5,6,7],
  8:  [8,9],
  16: [10,11],
}

export default function MesaMap({
  mesasOcupadas = [],
  mesaSelecionada = null,
  onSelect,
  qtdLugares = null,
  readOnly = false,
  mesaAtualEdit = null,
}) {
  const mesas = Array.from({ length: 12 }, (_, i) => i)
  const visiveis = qtdLugares ? MESAS_POR_CAPACIDADE[qtdLugares] : [0,1,2,3,4,5,6,7,8,9,10,11]

  // ---- Zoom & Pan state ----
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [fullscreen, setFullscreen] = useState(false)

  const containerRef = useRef(null)
  const isDragging = useRef(false)
  const lastPan = useRef({ x: 0, y: 0 })
  const lastTouch = useRef(null)
  const lastDist = useRef(null)

  const MIN_SCALE = 1
  const MAX_SCALE = 4

  function clampPan(newPan, newScale) {
    const el = containerRef.current
    if (!el) return newPan
    const w = el.offsetWidth
    const h = el.offsetHeight
    const maxX = (w * newScale - w) / 2
    const maxY = (h * newScale - h) / 2
    return {
      x: Math.min(maxX, Math.max(-maxX, newPan.x)),
      y: Math.min(maxY, Math.max(-maxY, newPan.y)),
    }
  }

  // ---- Scroll zoom (desktop) ----
  function handleWheel(e) {
    e.preventDefault()
    const delta = e.deltaY < 0 ? 0.15 : -0.15
    setScale(prev => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta))
      setPan(p => clampPan(p, next))
      return next
    })
  }

  // ---- Mouse drag (desktop) ----
  function handleMouseDown(e) {
    if (scale === 1) return
    isDragging.current = true
    lastPan.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
  }

  function handleMouseMove(e) {
    if (!isDragging.current) return
    const newPan = { x: e.clientX - lastPan.current.x, y: e.clientY - lastPan.current.y }
    setPan(clampPan(newPan, scale))
  }

  function handleMouseUp() { isDragging.current = false }

  // ---- Touch pinch zoom + drag (mobile) ----
  function handleTouchStart(e) {
    if (e.touches.length === 2) {
      lastDist.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
    } else if (e.touches.length === 1 && scale > 1) {
      lastTouch.current = { x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y }
    }
  }

  function handleTouchMove(e) {
    e.preventDefault()
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      if (lastDist.current) {
        const delta = (dist - lastDist.current) * 0.01
        setScale(prev => {
          const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta))
          setPan(p => clampPan(p, next))
          return next
        })
      }
      lastDist.current = dist
    } else if (e.touches.length === 1 && scale > 1 && lastTouch.current) {
      const newPan = { x: e.touches[0].clientX - lastTouch.current.x, y: e.touches[0].clientY - lastTouch.current.y }
      setPan(clampPan(newPan, scale))
    }
  }

  function handleTouchEnd() {
    lastDist.current = null
    lastTouch.current = null
  }

  // ---- Reset zoom ----
  function resetZoom() {
    setScale(1)
    setPan({ x: 0, y: 0 })
  }

  // ---- Fullscreen ----
  function toggleFullscreen() {
    setFullscreen(f => !f)
    resetZoom()
  }

  // ---- Prevent scroll while zooming ----
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    return () => {
      el.removeEventListener('wheel', handleWheel)
      el.removeEventListener('touchmove', handleTouchMove)
    }
  }, [scale, pan])

  // ---- Fechar fullscreen com ESC ----
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setFullscreen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const mapContent = (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: fullscreen ? '100%' : undefined,
        overflow: 'hidden',
        borderRadius: fullscreen ? 0 : 10,
        cursor: scale > 1 ? 'grab' : 'default',
        touchAction: 'none',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Conteúdo com transform */}
      <div style={{
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
        transformOrigin: 'center center',
        transition: isDragging.current ? 'none' : 'transform 0.1s ease',
        position: 'relative',
        width: '100%',
      }}>
        <img
          src="/mesas.jpg"
          className="mesa-map-img"
          draggable={false}
          style={{ display: 'block', width: '100%', borderRadius: fullscreen ? 0 : 10 }}
        />

        {mesas.map(i => {
          const pos = POSICOES[i]
          const ocupada = mesasOcupadas.includes(i) && i !== mesaAtualEdit
          const visivel = visiveis.includes(i)
          const selecionada = mesaSelecionada === i

          let cls = 'mesa-dot'
          if (!visivel) cls += ' oculta'
          else if (ocupada) cls += ' ocupada'
          else cls += ' disponivel'
          if (selecionada && visivel && !ocupada) cls += ' selecionada'

          return (
            <div
              key={i}
              className={cls}
              style={{ left: pos.x + '%', top: pos.y + '%' }}
              onClick={(e) => {
                e.stopPropagation()
                if (readOnly || !visivel || ocupada) return
                onSelect && onSelect(i)
              }}
            >
              {i + 1}
            </div>
          )
        })}
      </div>

      {/* Botões de controle */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        right: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        zIndex: 10,
      }}>
        {/* Fullscreen */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFullscreen() }}
          title={fullscreen ? 'Sair do fullscreen' : 'Fullscreen'}
          style={{
            background: 'rgba(31,31,31,0.85)',
            border: '1px solid var(--dourado)',
            borderRadius: 6,
            color: 'var(--dourado)',
            width: 32,
            height: 32,
            cursor: 'pointer',
            fontSize: 15,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {fullscreen ? '✕' : '⛶'}
        </button>

        {/* Reset zoom */}
        {scale > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); resetZoom() }}
            title="Resetar zoom"
            style={{
              background: 'rgba(31,31,31,0.85)',
              border: '1px solid var(--dourado)',
              borderRadius: 6,
              color: 'var(--dourado)',
              width: 32,
              height: 32,
              cursor: 'pointer',
              fontSize: 15,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ⊙
          </button>
        )}
      </div>

      {/* Indicador de zoom */}
      {scale > 1 && (
        <div style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          background: 'rgba(31,31,31,0.8)',
          border: '1px solid rgba(235,186,85,0.4)',
          borderRadius: 6,
          padding: '3px 8px',
          fontSize: 11,
          color: 'var(--dourado)',
        }}>
          {Math.round(scale * 100)}%
        </div>
      )}
    </div>
  )

  // ---- Fullscreen overlay ----
  if (fullscreen) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10,5,5,0.95)',
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}>
        <div style={{ width: '100%', maxWidth: 900, maxHeight: '100vh' }}>
          {mapContent}
        </div>
      </div>
    )
  }

  return (
    <div className="mesa-map-container">
      {mapContent}
    </div>
  )
}
