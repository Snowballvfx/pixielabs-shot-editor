import { TimelineProvider } from './contexts/TimelineContext'
import TimelineContainer from './components/TimelineContainer'

function App() {
  return (
    <TimelineProvider>
      <TimelineContainer />
    </TimelineProvider>
  )
}

export default App