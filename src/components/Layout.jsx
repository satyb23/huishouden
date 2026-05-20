const TABS = [
  { id: 'boodschappen', label: 'Boodschappen', emoji: '🛒' },
  { id: 'betalingen', label: 'Betalingen', emoji: '💳' },
  { id: 'aankopen', label: 'Aankopen', emoji: '🛍️' },
  { id: 'agenda', label: 'Agenda', emoji: '📅' },
  { id: 'taken', label: 'Taken', emoji: '✅' },
]

export default function Layout({ children, activeTab, onTabChange }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      <main className="flex-1 overflow-y-auto pb-24 pt-2">
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg flex max-w-lg mx-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center py-2 px-1 transition-colors ${
              activeTab === tab.id ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            <span className="text-xl leading-none">{tab.emoji}</span>
            <span className="text-[10px] mt-1 leading-none font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
