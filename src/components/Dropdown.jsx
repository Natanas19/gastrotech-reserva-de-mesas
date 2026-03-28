import React, { useState, useRef, useEffect } from 'react'

export default function Dropdown({ label, options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectedLabel = options.find(o => (o.value ?? o) === value)?.label ?? value ?? placeholder ?? label

  return (
    <div className="dropdown-wrapper" ref={ref}>
      <button className="dropdown-btn" onClick={() => setOpen(o => !o)} type="button">
        <span>{selectedLabel}</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="dropdown-list">
          {options.map(opt => {
            const val = opt.value ?? opt
            const lbl = opt.label ?? opt
            return (
              <div
                key={val}
                className={`dropdown-item ${val === value ? 'selected' : ''}`}
                onClick={() => { onChange(val); setOpen(false) }}
              >
                {lbl}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
