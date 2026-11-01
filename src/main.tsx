import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { Breeding } from './Breeding'
import { Discover } from './Discover'
import { Landing } from './Landing'
import { PublicCat } from './PublicCat'
import { Verifier } from './Verifier'
import './styles.css'

const path = window.location.pathname
const play = path === '/play' || path.startsWith('/play/')
const discover = path === '/gallery' || path.startsWith('/gallery/') || path === '/discover' || path.startsWith('/discover/')
const breeding = path === '/breeding' || path.startsWith('/breeding/')
const verify = path === '/verify' || path.startsWith('/verify/')
const cat = path === '/cat' || path.startsWith('/cat/')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {play ? (
      <App />
    ) : discover ? (
      <Discover />
    ) : breeding ? (
      <Breeding />
    ) : verify ? (
      <Verifier />
    ) : cat ? (
      <PublicCat />
    ) : (
      <Landing />
    )}
  </StrictMode>,
)
