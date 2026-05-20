import { useState } from 'react'
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useCollection } from '../hooks/useCollection'

const PRIORITEITEN = [
  { waarde: 'hoog', label: '🔴 Hoog', kleur: 'text-red-500 bg-red-50 border-red-100' },
  { waarde: 'middel', label: '🟡 Middel', kleur: 'text-yellow-600 bg-yellow-50 border-yellow-100' },
  { waarde: 'laag', label: '🟢 Laag', kleur: 'text-green-600 bg-green-50 border-green-100' },
]

const VOLGORDE = { hoog: 0, middel: 1, laag: 2 }

const leegForm = { naam: '', prijs: '', prioriteit: 'middel' }

export default function Aankopen({ familyId }) {
  const { items, loading } = useCollection(familyId, 'aankopen')
  const [form, setForm] = useState(leegForm)
  const [toonForm, setToonForm] = useState(false)

  const colRef = collection(db, 'families', familyId, 'aankopen')

  async function opslaan() {
    if (!form.naam.trim()) return
    await addDoc(colRef, {
      naam: form.naam.trim(),
      prijs: form.prijs ? parseFloat(form.prijs) : null,
      prioriteit: form.prioriteit,
      gekocht: false,
      createdAt: serverTimestamp(),
    })
    setForm(leegForm)
    setToonForm(false)
  }

  async function toggleGekocht(item) {
    await updateDoc(doc(db, 'families', familyId, 'aankopen', item.id), { gekocht: !item.gekocht })
  }

  async function verwijder(id) {
    await deleteDoc(doc(db, 'families', familyId, 'aankopen', id))
  }

  const gesorteerd = [...items].sort((a, b) => {
    if (a.gekocht !== b.gekocht) return a.gekocht ? 1 : -1
    return VOLGORDE[a.prioriteit] - VOLGORDE[b.prioriteit]
  })

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">🛍️ Aankopen</h1>
        <button
          onClick={() => setToonForm(!toonForm)}
          className="bg-orange-500 text-white rounded-full w-9 h-9 flex items-center justify-center text-xl font-bold shadow-md"
        >
          {toonForm ? '×' : '+'}
        </button>
      </div>

      {toonForm && (
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-orange-100">
          <p className="text-sm font-semibold text-gray-600 mb-3">Nieuwe aankoop</p>
          <input
            type="text"
            placeholder="Wat wil je kopen?"
            value={form.naam}
            onChange={e => setForm({ ...form, naam: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-2 focus:outline-none focus:border-orange-400"
          />
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              <input
                type="number"
                placeholder="Prijs (optioneel)"
                value={form.prijs}
                onChange={e => setForm({ ...form, prijs: e.target.value })}
                className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            {PRIORITEITEN.map(p => (
              <button
                key={p.waarde}
                onClick={() => setForm({ ...form, prioriteit: p.waarde })}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${form.prioriteit === p.waarde ? p.kleur + ' border-2' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button onClick={opslaan} className="w-full bg-orange-500 text-white rounded-xl py-3 font-semibold text-sm">
            Toevoegen
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-300 py-12 text-4xl">⏳</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🛍️</div>
          <p className="text-gray-400">Verlanglijst is leeg</p>
        </div>
      ) : (
        <div className="space-y-2">
          {gesorteerd.map(item => {
            const prio = PRIORITEITEN.find(p => p.waarde === item.prioriteit)
            return (
              <div key={item.id} className={`bg-white rounded-2xl px-4 py-3 border flex items-center gap-3 ${item.gekocht ? 'opacity-50' : ''}`}>
                <button onClick={() => toggleGekocht(item)} className="flex-shrink-0">
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${item.gekocht ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`}>
                    {item.gekocht && <span className="text-white text-sm font-bold">✓</span>}
                  </div>
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${item.gekocht ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item.naam}</p>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${prio?.kleur}`}>{prio?.label}</span>
                </div>
                <div className="text-right flex-shrink-0">
                  {item.prijs && <p className="text-sm font-bold text-gray-600">€ {item.prijs.toFixed(2)}</p>}
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
