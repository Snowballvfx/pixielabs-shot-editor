import { TimelineProvider } from './contexts/TimelineContext'
import TimelineContainer from './components/TimelineContainer'

function App() {
  return (
    <TimelineProvider>
      <div style={{ display: 'flex', height: '100vh' }}>
        {/* Main timeline area */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <TimelineContainer />
        </div>
      </div>
    </TimelineProvider>
  )
}

export default App