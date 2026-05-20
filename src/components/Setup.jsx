import { useState } from 'react'

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function Setup({ onJoin }) {
  const [mode, setMode] = useState(null)
  const [invoerCode, setInvoerCode] = useState('')
  const [nieuweCode] = useState(generateCode)

  if (!mode) {
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-6">
        <div className="text-7xl mb-4">🏠</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Huishouden</h1>
        <p className="text-gray-500 mb-10 text-center">Organiseer jullie gezin samen</p>
        <button
          onClick={() => setMode('aanmaken')}
          className="w-full bg-orange-500 text-white rounded-2xl py-4 font-semibold text-lg mb-3 shadow-md active:scale-95 transition-transform"
        >
          Nieuw gezin aanmaken
        </button>
        <button
          onClick={() => setMode('meedoen')}
          className="w-full bg-white border-2 border-orange-400 text-orange-500 rounded-2xl py-4 font-semibold text-lg"
        >
          Meedoen met bestaand gezin
        </button>
      </div>
    )
  }

  if (mode === 'aanmaken') {
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-6">
        <div className="text-7xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Jouw gezinscode</h2>
        <p className="text-gray-500 mb-6 text-center text-sm">
          Deel deze code met je partner zodat jullie alles samen zien
        </p>
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-md w-full text-center border-2 border-orange-200">
          <div className="text-4xl font-bold text-orange-500 tracking-[0.3em]">{nieuweCode}</div>
        </div>
        <p className="text-gray-400 text-xs mb-8 text-center">
          Je partner kiest "Meedoen met bestaand gezin" en voert deze code in
        </p>
        <button
          onClick={() => onJoin(nieuweCode)}
          className="w-full bg-orange-500 text-white rounded-2xl py-4 font-semibold text-lg shadow-md"
        >
          Beginnen →
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-6">
      <div className="text-7xl mb-4">🔗</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Code invoeren</h2>
      <p className="text-gray-500 mb-6 text-center text-sm">
        Vraag de gezinscode op bij je partner
      </p>
      <input
        type="text"
        value={invoerCode}
        onChange={e => setInvoerCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
        placeholder="ABC123"
        maxLength={6}
        className="w-full border-2 border-gray-200 rounded-2xl p-4 text-center text-3xl font-bold tracking-[0.3em] uppercase mb-4 focus:outline-none focus:border-orange-400 bg-white"
      />
      <button
        onClick={() => invoerCode.length >= 4 && onJoin(invoerCode)}
        disabled={invoerCode.length < 4}
        className="w-full bg-orange-500 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-2xl py-4 font-semibold text-lg mb-3"
      >
        Meedoen
      </button>
      <button onClick={() => setMode(null)} className="text-gray-400 text-sm py-2">
        ← Terug
      </button>
    </div>
  )
}
