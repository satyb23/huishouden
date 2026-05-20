import { useState } from 'react'
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useCollection } from '../hooks/useCollection'

const PERSONEN = ['Papa', 'Mama', 'Beiden', 'Kind 1', 'Kind 2', 'Hele Familie']
const PERSOON_KLEUR = {
  'Papa': 'bg-blue-100 text-blue-600',
  'Mama': 'bg-pink-100 text-pink-600',
  'Beiden': 'bg-purple-100 text-purple-600',
  'Kind 1': 'bg-green-100 text-green-600',
  'Kind 2': 'bg-teal-100 text-teal-600',
  'Hele Familie': 'bg-orange-100 text-orange-600',
}

function formatDatum(datum) {
  const d = new Date(datum + 'T12:00:00')
  const vandaag = new Date()
  vandaag.setHours(0, 0, 0, 0)
  const morgen = new Date(vandaag)
  morgen.setDate(morgen.getDate() + 1)
  const d0 = new Date(datum + 'T00:00:00')

  if (d0.toDateString() === vandaag.toDateString()) return '📍 Vandaag'
  if (d0.toDateString() === morgen.toDateString()) return '⏰ Morgen'
  return d.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })
}

const leegForm = { titel: '', datum: '', tijd: '', beschrijving: '', persoon: 'Beiden' }

export default function Agenda({ familyId }) {
  const { items, loading } = useCollection(familyId, 'agenda', 'datum', 'asc')
  const [form, setForm] = useState(leegForm)
  const [toonForm, setToonForm] = useState(false)

  const colRef = collection(db, 'families', familyId, 'agenda')

  async function opslaan() {
    if (!form.titel.trim() || !form.datum) return
    await addDoc(colRef, {
      titel: form.titel.trim(),
      datum: form.datum,
      tijd: form.tijd || null,
      beschrijving: form.beschrijving.trim() || null,
      persoon: form.persoon,
      createdAt: serverTimestamp(),
    })
    setForm(leegForm)
    setToonForm(false)
  }

  async function verwijder(id) {
    await deleteDoc(doc(db, 'families', familyId, 'agenda', id))
  }

  const vandaag = new Date().toISOString().split('T')[0]
  const komend = items.filter(i => i.datum >= vandaag)
  const verlopen = items.filter(i => i.datum < vandaag)

  // Group upcoming by month
  const perMaand = komend.reduce((acc, item) => {
    const maand = item.datum.substring(0, 7)
    if (!acc[maand]) acc[maand] = []
    acc[maand].push(item)
    return acc
  }, {})

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">📅 Agenda</h1>
        <button
          onClick={() => setToonForm(!toonForm)}
          className="bg-orange-500 text-white rounded-full w-9 h-9 flex items-center justify-center text-xl font-bold shadow-md"
        >
          {toonForm ? '×' : '+'}
        </button>
      </div>

      {toonForm && (
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-orange-100">
          <p className="text-sm font-semibold text-gray-600 mb-3">Nieuw evenement</p>
          <input
            type="text"
            placeholder="Wat is het? (bijv. Tandarts, Verjaardag)"
            value={form.titel}
            onChange={e => setForm({ ...form, titel: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-2 focus:outline-none focus:border-orange-400"
          />
          <div className="flex gap-2 mb-2">
            <input
              type="date"
              value={form.datum}
              onChange={e => setForm({ ...form, datum: e.target.value })}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
            />
            <input
              type="time"
              value={form.tijd}
              onChange={e => setForm({ ...form, tijd: e.target.value })}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
          <input
            type="text"
            placeholder="Opmerking (optioneel)"
            value={form.beschrijving}
            onChange={e => setForm({ ...form, beschrijving: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-2 focus:outline-none focus:border-orange-400"
          />
          <div className="flex flex-wrap gap-2 mb-3">
            {PERSONEN.map(p => (
              <button
                key={p}
                onClick={() => setForm({ ...form, persoon: p })}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${form.persoon === p ? PERSOON_KLEUR[p] + ' border-current' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <button onClick={opslaan} className="w-full bg-orange-500 text-white rounded-xl py-3 font-semibold text-sm">
            Opslaan
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-300 py-12 text-4xl">⏳</div>
      ) : komend.length === 0 && verlopen.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">📅</div>
          <p className="text-gray-400">Agenda is leeg</p>
        </div>
      ) : (
        <>
          {Object.entries(perMaand).map(([maand, maandItems]) => {
            const datum = new Date(maand + '-15')
            const maandNaam = datum.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })
            return (
              <div key={maand} className="mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                  {maandNaam}
                </p>
                <div className="space-y-2">
                  {maandItems.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl px-4 py-3 border border-gray-100 flex items-start gap-3">
                      <div className="text-center flex-shrink-0 w-10">
                        <div className="text-xs text-gray-400 leading-none">{formatDatum(item.datum).includes('Vandaag') ? '📍' : formatDatum(item.datum).includes('Morgen') ? '⏰' : new Date(item.datum + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'short' })}</div>
                        <div className="text-lg font-bold text-gray-700 leading-tight">{new Date(item.datum + 'T12:00:00').getDate()}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-700">{item.titel}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {item.tijd && <span className="text-xs text-gray-400">🕐 {item.tijd}</span>}
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PERSOON_KLEUR[item.persoon] || 'bg-gray-100 text-gray-500'}`}>{item.persoon}</span>
                        </div>
                        {item.beschrijving && <p className="text-xs text-gray-400 mt-1">{item.beschrijving}</p>}
                      </div>
                      <button onClick={() => verwijder(item.id)} className="text-gray-200 hover:text-red-400 text-xl leading-none">×</button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          {verlopen.length > 0 && (
            <details className="mt-2">
              <summary className="text-xs text-gray-400 cursor-pointer py-2">Verlopen ({verlopen.length})</summary>
              <div className="space-y-2 mt-2 opacity-50">
                {verlopen.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm line-through text-gray-400">{item.titel}</p>
                      <p className="text-xs text-gray-300">{new Date(item.datum + 'T12:00:00').toLocaleDateString('nl-NL')}</p>
                    </div>
                    <button onClick={() => verwijder(item.id)} className="text-gray-300 hover:text-red-400 text-xl">×</button>
                  </div>
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  )
}
