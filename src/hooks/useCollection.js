import { useState, useEffect } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

export function useCollection(familyId, collectionName, orderField = 'createdAt', direction = 'desc') {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!familyId) return
    const q = query(
      collection(db, 'families', familyId, collectionName),
      orderBy(orderField, direction)
    )
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [familyId, collectionName, orderField, direction])

  return { items, loading }
}
