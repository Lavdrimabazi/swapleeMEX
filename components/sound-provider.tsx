"use client"

import { createContext, useContext, useRef, type ReactNode } from "react"

interface SoundContextType {
  playPunch: () => void
  playClick: () => void
  playSuccess: () => void
}

const SoundContext = createContext<SoundContextType | undefined>(undefined)

export function SoundProvider({ children }: { children: ReactNode }) {
  const punchSoundRef = useRef<HTMLAudioElement | null>(null)
  const clickSoundRef = useRef<HTMLAudioElement | null>(null)
  const successSoundRef = useRef<HTMLAudioElement | null>(null)

  const playPunch = () => {
    try {
      if (!punchSoundRef.current) {
        const audio = new Audio("/sounds/066191758-martial-arts-hit-03 copy.mp3")
        audio.volume = 0.4
        audio.preload = "auto"
        punchSoundRef.current = audio
      }
      punchSoundRef.current.currentTime = 0
      const playPromise = punchSoundRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback to synthesized sound
          createSynthSound(150, 80, 0.3, 0.4)
        })
      }
    } catch (error) {
      createSynthSound(150, 80, 0.3, 0.4)
    }
  }

  const playClick = () => {
    try {
      if (!clickSoundRef.current) {
        const audio = new Audio("/sounds/066191728-karate-voice-01.mp3")
        audio.volume = 0.3
        audio.preload = "auto"
        clickSoundRef.current = audio
      }
      clickSoundRef.current.currentTime = 0
      const playPromise = clickSoundRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback to synthesized sound
          createSynthSound(600, 300, 0.2, 0.15)
        })
      }
    } catch (error) {
      createSynthSound(600, 300, 0.2, 0.15)
    }
  }

  const playSuccess = () => {
    try {
      if (!successSoundRef.current) {
        const audio = new Audio("/sounds/060880307-martial-arts-reveal (1).mp3")
        audio.volume = 0.4
        audio.preload = "auto"
        successSoundRef.current = audio
      }
      successSoundRef.current.currentTime = 0
      const playPromise = successSoundRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback to synthesized victory sound
          createVictorySound()
        })
      }
    } catch (error) {
      createVictorySound()
    }
  }

  const createSynthSound = (startFreq: number, endFreq: number, volume: number, duration: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(endFreq, audioContext.currentTime + duration)
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration)
    } catch (error) {
      console.log("Audio not available")
    }
  }

  const createVictorySound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Victory chord progression
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(660, audioContext.currentTime + 0.1)
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.2)
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.6)
    } catch (error) {
      console.log("Audio not available")
    }
  }

  return <SoundContext.Provider value={{ playPunch, playClick, playSuccess }}>{children}</SoundContext.Provider>
}

export function useSound() {
  const context = useContext(SoundContext)
  if (context === undefined) {
    throw new Error("useSound must be used within a SoundProvider")
  }
  return context
}