import { useState } from 'react'
import Setup from './components/Setup'
import Layout from './components/Layout'
import Boodschappen from './components/Boodschappen'
import Betalingen from './components/Betalingen'
import Aankopen from './components/Aankopen'
import Agenda from './components/Agenda'
import Taken from './components/Taken'

export default function App() {
  const [familyId, setFamilyId] = useState(() => localStorage.getItem('huishouden_family_id'))
  const [activeTab, setActiveTab] = useState('boodschappen')

  function handleJoin(id) {
    localStorage.setItem('huishouden_family_id', id)
    setFamilyId(id)
  }

  if (!familyId) {
    return <Setup onJoin={handleJoin} />
  }

  const tabs = {
    boodschappen: <Boodschappen familyId={familyId} />,
    betalingen: <Betalingen familyId={familyId} />,
    aankopen: <Aankopen familyId={familyId} />,
    agenda: <Agenda familyId={familyId} />,
    taken: <Taken familyId={familyId} />,
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {tabs[activeTab]}
    </Layout>
  )
}
