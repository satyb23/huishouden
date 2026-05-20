import { useState } from 'react'
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useCollection } from '../hooks/useCollection'

const HERHALINGEN = ['eenmalig', 'maandelijks', 'jaarlijks']

function dagenverschil(datum) {
  const vandaag = new Date()
  vandaag.setHours(0, 0, 0, 0)
  const d = new Date(datum)
  d.setHours(0, 0, 0, 0)
  return Math.round((d - vandaag) / (1000 * 60 * 60 * 24))
}

function statusKleur(item) {
  if (item.betaald) return 'bg-green-50 border-green-100'
  const diff = dagenverschil(item.vervaldatum)
  if (diff < 0) return 'bg-red-50 border-red-200'
  if (diff <= 7) return 'bg-orange-50 border-orange-200'
  return 'bg-white border-gray-100'
}

function statusLabel(item) {
  if (item.betaald) return { tekst: 'Betaald', kleur: 'text-green-500' }
  const diff = dagenverschil(item.vervaldatum)
  if (diff < 0) return { tekst: `${Math.abs(diff)}d te laat`, kleur: 'text-red-500' }
  if (diff === 0) return { tekst: 'Vandaag!', kleur: 'text-orange-500' }
  if (diff <= 7) return { tekst: `Nog ${diff}d`, kleur: 'text-orange-400' }
  const datum = new Date(item.vervaldatum)
  return { tekst: datum.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }), kleur: 'text-gray-400' }
}

const leegForm = { naam: '', bedrag: '', vervaldatum: '', herhaling: 'maandelijks' }

export default function Betalingen({ familyId }) {
  const { items, loading } = useCollection(familyId, 'betalingen', 'vervaldatum', 'asc')
  const [form, setForm] = useState(leegForm)
  const [toonForm, setToonForm] = useState(false)

  const colRef = collection(db, 'families', familyId, 'betalingen')

  async function opslaan() {
    if (!form.naam.trim() || !form.vervaldatum) return
    await addDoc(colRef, {
      naam: form.naam.trim(),
      bedrag: form.bedrag ? parseFloat(form.bedrag) : null,
      vervaldatum: form.vervaldatum,
      herhaling: form.herhaling,
      betaald: false,
      createdAt: serverTimestamp(),
    })
    setForm(leegForm)
    setToonForm(false)
  }

  async function toggleBetaald(item) {
    await updateDoc(doc(db, 'families', familyId, 'betalingen', item.id), { betaald: !item.betaald })
  }

  async function verwijder(id) {
    await deleteDoc(doc(db, 'families', familyId, 'betalingen', id))
  }

  const openstaand = items.filter(i => !i.betaald)
  const totaalOpen = openstaand.reduce((s, i) => s + (i.bedrag || 0), 0)

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">💳 Betalingen</h1>
        <button
          onClick={() => setToonForm(!toonForm)}
          className="bg-orange-500 text-white rounded-full w-9 h-9 flex items-center justify-center text-xl font-bold shadow-md"
        >
          {toonForm ? '×' : '+'}
        </button>
      </div>

      {totaalOpen > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-orange-400 font-semibold uppercase tracking-wide">Openstaand</p>
            <p className="text-2xl font-bold text-orange-600">€ {totaalOpen.toFixed(2)}</p>
          </div>
          <div className="text-3xl">📬</div>
        </div>
      )}

      {toonForm && (
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-orange-100">
          <p className="text-sm font-semibold text-gray-600 mb-3">Nieuwe betaling</p>
          <input
            type="text"
            placeholder="Naam (bijv. Huur, Netflix)"
            value={form.naam}
            onChange={e => setForm({ ...form, naam: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-2 focus:outline-none focus:border-orange-400"
          />
          <div className="flex gap-2 mb-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              <input
                type="number"
                placeholder="Bedrag"
                value={form.bedrag}
                onChange={e => setForm({ ...form, bedrag: e.target.value })}
                className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
            <input
              type="date"
              value={form.vervaldatum}
              onChange={e => setForm({ ...form, vervaldatum: e.target.value })}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
          <select
            value={form.herhaling}
            onChange={e => setForm({ ...form, herhaling: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-3 focus:outline-none bg-white"
          >
            {HERHALINGEN.map(h => <option key={h}>{h}</option>)}
          </select>
          <button onClick={opslaan} className="w-full bg-orange-500 text-white rounded-xl py-3 font-semibold text-sm">
            Opslaan
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-300 py-12 text-4xl">⏳</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">💸</div>
          <p className="text-gray-400">Nog geen betalingen</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => {
            const { tekst, kleur } = statusLabel(item)
            return (
              <div key={item.id} className={`rounded-2xl p-4 border flex items-center gap-3 ${statusKleur(item)}`}>
                <button onClick={() => toggleBetaald(item)} className="flex-shrink-0">
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${item.betaald ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                    {item.betaald && <span className="text-white text-sm font-bold">✓</span>}
                  </div>
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${item.betaald ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{item.naam}</p>
                  <p className="text-xs text-gray-400 capitalize">{item.herhaling}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  {item.bedrag && <p className="font-bold text-sm text-gray-700">€ {item.bedrag.toFixed(2)}</p>}
                  <p className={`text-xs font-semibold ${kleur}`}>{tekst}</p>
                </div>
                <button onClick={() => verwijder(item.id)} className="text-gray-200 hover:text-red-400 text-xl leading-none">×</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
