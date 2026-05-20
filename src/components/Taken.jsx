import { useState } from 'react'
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useCollection } from '../hooks/useCollection'

const PERSONEN = ['Papa', 'Mama', 'Beiden']
const FREQUENTIES = ['dagelijks', 'wekelijks', 'maandelijks', 'eenmalig']
const PERSOON_KLEUR = {
  'Papa': 'bg-blue-100 text-blue-600',
  'Mama': 'bg-pink-100 text-pink-600',
  'Beiden': 'bg-purple-100 text-purple-600',
}

const leegForm = { naam: '', persoon: 'Beiden', frequentie: 'wekelijks' }

export default function Taken({ familyId }) {
  const { items, loading } = useCollection(familyId, 'taken')
  const [form, setForm] = useState(leegForm)
  const [toonForm, setToonForm] = useState(false)

  const colRef = collection(db, 'families', familyId, 'taken')

  async function opslaan() {
    if (!form.naam.trim()) return
    await addDoc(colRef, {
      naam: form.naam.trim(),
      persoon: form.persoon,
      frequentie: form.frequentie,
      gedaan: false,
      createdAt: serverTimestamp(),
    })
    setForm(leegForm)
    setToonForm(false)
  }

  async function toggleGedaan(item) {
    await updateDoc(doc(db, 'families', familyId, 'taken', item.id), { gedaan: !item.gedaan })
  }

  async function verwijder(id) {
    await deleteDoc(doc(db, 'families', familyId, 'taken', id))
  }

  const gesorteerd = [...items].sort((a, b) => {
    if (a.gedaan !== b.gedaan) return a.gedaan ? 1 : -1
    return 0
  })

  const aantalGedaan = items.filter(i => i.gedaan).length
  const totaal = items.length
  const voortgang = totaal > 0 ? Math.round((aantalGedaan / totaal) * 100) : 0

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">✅ Taken</h1>
        <button
          onClick={() => setToonForm(!toonForm)}
          className="bg-orange-500 text-white rounded-full w-9 h-9 flex items-center justify-center text-xl font-bold shadow-md"
        >
          {toonForm ? '×' : '+'}
        </button>
      </div>

      {totaal > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Voortgang</span>
            <span>{aantalGedaan}/{totaal} gedaan</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${voortgang}%` }}
            />
          </div>
        </div>
      )}

      {toonForm && (
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-orange-100">
          <p className="text-sm font-semibold text-gray-600 mb-3">Nieuwe taak</p>
          <input
            type="text"
            placeholder="Wat moet er gedaan worden?"
            value={form.naam}
            onChange={e => setForm({ ...form, naam: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-2 focus:outline-none focus:border-orange-400"
          />
          <div className="mb-2">
            <p className="text-xs text-gray-400 mb-1.5">Wie?</p>
            <div className="flex gap-2">
              {PERSONEN.map(p => (
                <button
                  key={p}
                  onClick={() => setForm({ ...form, persoon: p })}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${form.persoon === p ? PERSOON_KLEUR[p] + ' border-current' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <p className="text-xs text-gray-400 mb-1.5">Hoe vaak?</p>
            <div className="flex gap-2 flex-wrap">
              {FREQUENTIES.map(f => (
                <button
                  key={f}
                  onClick={() => setForm({ ...form, frequentie: f })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all capitalize ${form.frequentie === f ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                >
                  {f}
                </button>
              ))}
            </div>
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
          <div className="text-5xl mb-3">🏡</div>
          <p className="text-gray-400">Nog geen taken</p>
        </div>
      ) : (
        <div className="space-y-2">
          {gesorteerd.map(item => (
            <div key={item.id} className={`bg-white rounded-2xl px-4 py-3 border border-gray-100 flex items-center gap-3 ${item.gedaan ? 'opacity-50' : ''}`}>
              <button onClick={() => toggleGedaan(item)} className="flex-shrink-0">
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${item.gedaan ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`}>
                  {item.gedaan && <span className="text-white text-sm font-bold">✓</span>}
                </div>
              </button>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${item.gedaan ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item.naam}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PERSOON_KLEUR[item.persoon] || 'bg-gray-100 text-gray-400'}`}>{item.persoon}</span>
                  <span className="text-xs text-gray-300 capitalize">{item.frequentie}</span>
                </div>
              </div>
              <button onClick={() => verwijder(item.id)} className="text-gray-200 hover:text-red-400 text-xl leading-none">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
