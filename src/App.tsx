import { MachineView } from './machine/MachineView'
import { BuddyProvider } from '../Game engine/mechanics/store'

export function App() {
  return (
    <BuddyProvider>
      <MachineView />
      <div className="page-noise" aria-hidden="true" />
    </BuddyProvider>
  )
}
