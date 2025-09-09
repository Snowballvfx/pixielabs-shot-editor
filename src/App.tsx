import { TimelineProvider } from './contexts/TimelineContext'
import TimelineContainer from './components/TimelineContainer'
import ClipsGallery from './components/ClipsGallery'

function App() {
  return (
    <TimelineProvider>
      <div style={{ display: 'flex', height: '100vh' }}>
        {/* Left sidebar with gallery */}
        <div style={{ 
          width: '200px', 
          flexShrink: 0,
          borderRight: '1px solid #333'
        }}>
          <ClipsGallery />
        </div>
        
        {/* Main timeline area */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <TimelineContainer />
        </div>
      </div>
    </TimelineProvider>
  )
}

export default App