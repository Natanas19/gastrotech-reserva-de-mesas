import React from 'react'

// Posições de cada mesa em % (left, top) para o mapa
const POSICOES = [
  { x: 12.5,  y: 11 }, // 1
  { x: 25.7, y: 11 }, // 2
  { x: 38.8, y: 11 }, // 3
  { x: 64, y: 11 }, // 4
  { x: 77.3, y: 11 }, // 5
  { x: 89.5, y: 11 }, // 6

  { x: 12.5,  y: 51.3 }, // 7
  { x: 25.7, y: 51.3 }, // 8
  { x: 38.8, y: 51.3 }, // 9
  { x: 63.2, y: 51.3 }, // 10
  { x: 76.3, y: 51.3 }, // 11
  { x: 89.5, y: 51.3 }, // 12
]

// Mesas visíveis por filtro de lugares
// 2 lugares: 1-4 (idx 0-3), 4 lugares: 5-8 (idx 4-7), 8 lugares: 9-10 (idx 8-9), 16 lugares: 11-12 (idx 10-11)
const MESAS_POR_CAPACIDADE = {
  2:  [0,1,2,3],
  4:  [4,5,6,7],
  8:  [8,9],
  16: [10,11],
}

export default function MesaMap({
  mesasOcupadas = [],    // array de índices ocupados
  mesaSelecionada = null,
  onSelect,
  qtdLugares = null,     // null = sem filtro, mostra todas
  readOnly = false,
  mesaAtualEdit = null,  // mesa que o usuário já tem (não bloquear na edição)
}) {
  const mesas = Array.from({ length: 12 }, (_, i) => i)

  // Quais mesas ficam visíveis conforme filtro
  const visiveis = qtdLugares ? MESAS_POR_CAPACIDADE[qtdLugares] : [0,1,2,3,4,5,6,7,8,9,10,11]

  return (
    <div className="mesa-map-container">
      {/* Mapa de fundo gerado inline (SVG simples representando o restaurante) */}
        <img src="/mesas.jpg" className="mesa-map-img" />
      {/* Bolinhas das mesas posicionadas absolutamente */}
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
            onClick={() => {
              if (readOnly || !visivel || ocupada) return
              onSelect && onSelect(i)
            }}
          >
            {i + 1}
          </div>
        )
      })}
    </div>
  )
}
