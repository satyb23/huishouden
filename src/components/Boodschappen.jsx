import { useState } from 'react'
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useCollection } from '../hooks/useCollection'

const CATEGORIES = ['Groente & Fruit', 'Vlees & Vis', 'Zuivel', 'Brood & Gebak', 'Dranken', 'Diepvries', 'Huishouden', 'Snacks', 'Overig']

export default function Boodschappen({ familyId }) {
  const { items, loading } = useCollection(familyId, 'boodschappen')
  const [nieuwItem, setNieuwItem] = useState('')
  const [categorie, setCategorie] = useState('Overig')
  const [filter, setFilter] = useState('actief')

  const colRef = collection(db, 'families', familyId, 'boodschappen')

  async function toevoegen() {
    const naam = nieuwItem.trim()
    if (!naam) return
    await addDoc(colRef, { naam, categorie, afgevinkt: false, createdAt: serverTimestamp() })
    setNieuwItem('')
  }

  async function toggleAfgevinkt(item) {
    await updateDoc(doc(db, 'families', familyId, 'boodschappen', item.id), { afgevinkt: !item.afgevinkt })
  }

  async function verwijder(id) {
    await deleteDoc(doc(db, 'families', familyId, 'boodschappen', id))
  }

  async function wisAfgevinkte() {
    await Promise.all(items.filter(i => i.afgevinkt).map(i => deleteDoc(doc(db, 'families', familyId, 'boodschappen', i.id))))
  }

  const gefilterd = items.filter(i => filter === 'actief' ? !i.afgevinkt : filter === 'afgevinkt' ? i.afgevinkt : true)

  const gegroepeerd = CATEGORIES.reduce((acc, cat) => {
    const catItems = gefilterd.filter(i => i.categorie === cat)
    if (catItems.length) acc[cat] = catItems
    return acc
  }, {})

  const aantalAfgevinkt = items.filter(i => i.afgevinkt).length

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">🛒 Boodschappen</h1>
        {aantalAfgevinkt > 0 && (
          <button onClick={wisAfgevinkte} className="text-sm text-red-400 font-medium">
            Wis {aantalAfgevinkt} ✓
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={nieuwItem}
            onChange={e => setNieuwItem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && toevoegen()}
            placeholder="Item toevoegen..."
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
          />
          <button onClick={toevoegen} className="bg-orange-500 text-white rounded-xl px-4 py-2.5 font-bold text-lg leading-none">
            +
          </button>
        </div>
        <select
          value={categorie}
          onChange={e => setCategorie(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-500 focus:outline-none bg-white"
        >
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="flex gap-2 mb-4">
        {[['actief', `Te kopen (${items.filter(i => !i.afgevinkt).length})`], ['afgevinkt', 'Afgevinkt'], ['alle', 'Alles']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${filter === val ? 'bg-orange-500 text-white' : 'bg-white text-gray-400 border border-gray-200'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-300 py-12 text-4xl">⏳</div>
      ) : Object.keys(gegroepeerd).length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">{filter === 'actief' ? '🎉' : '📋'}</div>
          <p className="text-gray-400">{filter === 'actief' ? 'Lijst is leeg!' : 'Geen items'}</p>
        </div>
      ) : (
        Object.entries(gegroepeerd).map(([cat, catItems]) => (
          <div key={cat} className="mb-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-1">{cat}</p>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {catItems.map((item, i) => (
                <div key={item.id} className={`flex items-center px-4 py-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                  <button onClick={() => toggleAfgevinkt(item)} className="mr-3 flex-shrink-0">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${item.afgevinkt ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`}>
                      {item.afgevinkt && <span className="text-white text-xs font-bold">✓</span>}
                    </div>
                  </button>
                  <span className={`flex-1 text-sm ${item.afgevinkt ? 'line-through text-gray-300' : 'text-gray-700'}`}>
                    {item.naam}
                  </span>
                  <button onClick={() => verwijder(item.id)} className="text-gray-200 hover:text-red-400 ml-2 text-lg leading-none">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
