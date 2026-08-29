import React, { useState, useRef, useEffect } from 'react'
import { ClientOnly } from './ClientOnly'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  Settings,
  Check,
  Tv,
  Sparkles,
} from 'lucide-react'

export interface CustomVideoPlayerProps {
  src?: string
  poster?: string
  title?: string
  availableResolutions?: string[]
  currentResolution?: string
  onResolutionChange?: (res: string) => void
}

function VideoPlayerSkeleton({ title }: { title?: string }) {
  return (
    <div className="relative w-full aspect-video bg-[#0E1217] rounded-2xl overflow-hidden border border-white/10 flex flex-col items-center justify-center p-6 text-center animate-pulse shadow-2xl">
      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 border border-white/20">
        <Play className="w-8 h-8 text-white/50 ml-1" />
      </div>
      <p className="text-white/70 font-bold text-sm tracking-wide mb-1">
        {title || 'Loading Adaptive Stream...'}
      </p>
      <span className="text-xs text-white/40 font-mono">HLS Bitrate Transcoding</span>
    </div>
  )
}

export function CustomVideoPlayer(props: CustomVideoPlayerProps) {
  return (
    <ClientOnly fallback={<VideoPlayerSkeleton title={props.title} />}>
      <CustomVideoPlayerInner {...props} />
    </ClientOnly>
  )
}

function CustomVideoPlayerInner({
  src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  poster,
  title = 'Adaptive Bitrate Lecture Stream',
  availableResolutions = ['Auto', '1080p', '720p', '480p', '360p'],
  currentResolution = 'Auto',
  onResolutionChange,
}: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [selectedQuality, setSelectedQuality] = useState(currentResolution)
  const [selectedSpeed, setSelectedSpeed] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [settingsTab, setSettingsTab] = useState<'main' | 'quality' | 'speed'>('main')
  const [bufferedPercent, setBufferedPercent] = useState(0)

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 3000)
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    setCurrentTime(videoRef.current.currentTime)
    if (videoRef.current.buffered.length > 0 && videoRef.current.duration > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1)
      setBufferedPercent((bufferedEnd / videoRef.current.duration) * 100)
    }
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setVolume(val)
    if (videoRef.current) {
      videoRef.current.volume = val
      setIsMuted(val === 0)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    if (isMuted) {
      videoRef.current.muted = false
      videoRef.current.volume = volume || 0.5
      setIsMuted(false)
    } else {
      videoRef.current.muted = true
      setIsMuted(true)
    }
  }

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds))
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  const handleSpeedChange = (speed: number) => {
    setSelectedSpeed(speed)
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
    }
    setShowSettings(false)
    setSettingsTab('main')
  }

  const handleQualitySelect = (quality: string) => {
    setSelectedQuality(quality)
    if (onResolutionChange) onResolutionChange(quality)
    setShowSettings(false)
    setSettingsTab('main')
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const hrs = Math.floor(mins / 60)
    if (hrs > 0) {
      const remMins = mins % 60
      return `${hrs}:${remMins < 10 ? '0' : ''}${remMins}:${secs < 10 ? '0' : ''}${secs}`
    }
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return
      if (e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      } else if (e.code === 'ArrowRight') {
        e.preventDefault()
        skipTime(10)
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault()
        skipTime(-10)
      } else if (e.code === 'KeyF') {
        e.preventDefault()
        toggleFullscreen()
      } else if (e.code === 'KeyM') {
        e.preventDefault()
        toggleMute()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, duration, volume, isMuted])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative group w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-[var(--line)] select-none font-sans aspect-video flex items-center justify-center"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        playsInline
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Top Overlay Badge */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/85 via-black/50 to-transparent flex items-center justify-between transition-opacity duration-300 pointer-events-none ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded bg-[#FF3E00]/20 border border-[#FF3E00]/40 text-[#FF3E00] text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#FF3E00] animate-pulse" />
            HLS ADAPTIVE STREAM
          </div>
          <span className="text-white text-sm font-semibold truncate max-w-md drop-shadow">{title}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-xs font-mono font-semibold backdrop-blur-md">
            {selectedQuality === 'Auto' ? 'AUTO (1080p)' : selectedQuality}
          </span>
        </div>
      </div>

      {/* Central Big Play/Pause Button on Pause */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute z-10 w-20 h-20 rounded-full bg-[#FF3E00]/95 hover:bg-[#FF3E00] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all border-2 border-white/30 backdrop-blur-md cursor-pointer"
          title="Play Lecture"
        >
          <Play className="w-9 h-9 fill-white ml-1 text-white" />
        </button>
      )}

      {/* Bottom Control Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent transition-all duration-300 flex flex-col gap-2.5 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Custom Scrubber Bar */}
        <div className="relative group/scrubber w-full flex items-center h-4 cursor-pointer">
          {/* Background Track */}
          <div className="absolute left-0 right-0 h-1.5 bg-white/25 rounded-full overflow-hidden group-hover/scrubber:h-2 transition-all">
            {/* Buffered Progress */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-white/35 transition-all"
              style={{ width: `${bufferedPercent}%` }}
            />
            {/* Played Progress */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-[#FF3E00] shadow-[0_0_12px_#FF3E00]"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="absolute left-0 right-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>

        {/* Buttons and Controls */}
        <div className="flex items-center justify-between gap-4 text-white">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer hover:scale-105 active:scale-95"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
            </button>

            {/* Skip -10s */}
            <button
              onClick={() => skipTime(-10)}
              className="p-1.5 rounded-lg hover:bg-white/15 text-white/90 hover:text-white transition cursor-pointer"
              title="Rewind 10s (Left Arrow)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Skip +10s */}
            <button
              onClick={() => skipTime(10)}
              className="p-1.5 rounded-lg hover:bg-white/15 text-white/90 hover:text-white transition cursor-pointer"
              title="Forward 10s (Right Arrow)"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg hover:bg-white/15 text-white/90 hover:text-white transition cursor-pointer"
                title={isMuted ? 'Unmute (m)' : 'Mute (m)'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-white/40 rounded-lg accent-[#FF3E00] cursor-pointer"
              />
            </div>

            {/* Time Display */}
            <div className="text-xs font-mono text-white/90 ml-2">
              <span className="text-[#FF3E00] font-semibold">{formatTime(currentTime)}</span>
              <span className="text-white/40 mx-1">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 relative">
            {/* Speed indicator button */}
            <button
              onClick={() => {
                setShowSettings(!showSettings)
                setSettingsTab('speed')
              }}
              className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-mono font-medium text-white transition cursor-pointer"
              title="Playback Speed"
            >
              {selectedSpeed}x
            </button>

            {/* Settings Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSettings(!showSettings)
                  setSettingsTab('main')
                }}
                className={`p-2 rounded-lg hover:bg-white/15 text-white transition cursor-pointer ${
                  showSettings ? 'bg-white/20 text-[#FF3E00]' : ''
                }`}
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Settings Dropdown Menu (Themed for light and dark mode) */}
              {showSettings && (
                <div className="absolute right-0 bottom-12 w-52 bg-[var(--bg-card)] border border-[var(--line)] rounded-xl shadow-2xl p-2 z-50 text-xs font-sans text-[var(--sea-ink)] animate-in fade-in zoom-in-95 backdrop-blur-lg">
                  {settingsTab === 'main' && (
                    <div className="flex flex-col gap-1">
                      <div className="px-2 py-1 text-[11px] font-bold text-[var(--sea-ink-muted)] uppercase tracking-wider">
                        Stream Settings
                      </div>
                      <button
                        onClick={() => setSettingsTab('quality')}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-[var(--chip-bg)] transition cursor-pointer text-left"
                      >
                        <span className="flex items-center gap-2">
                          <Tv className="w-3.5 h-3.5 text-cyan-500" />
                          Quality
                        </span>
                        <span className="font-mono text-cyan-500 font-semibold">{selectedQuality}</span>
                      </button>
                      <button
                        onClick={() => setSettingsTab('speed')}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-[var(--chip-bg)] transition cursor-pointer text-left"
                      >
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-[#FF3E00]" />
                          Playback Speed
                        </span>
                        <span className="font-mono text-[#FF3E00] font-semibold">{selectedSpeed}x</span>
                      </button>
                    </div>
                  )}

                  {settingsTab === 'quality' && (
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setSettingsTab('main')}
                        className="px-2 py-1 text-[11px] text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] text-left mb-1 flex items-center gap-1 cursor-pointer"
                      >
                        ← Back
                      </button>
                      <div className="px-2 py-0.5 text-[11px] font-bold text-cyan-500 uppercase tracking-wider">
                        Select Stream Bitrate
                      </div>
                      {availableResolutions.map((res) => (
                        <button
                          key={res}
                          onClick={() => handleQualitySelect(res)}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[var(--chip-bg)] transition cursor-pointer text-left font-mono"
                        >
                          <span className={selectedQuality === res ? 'text-cyan-500 font-bold' : 'text-[var(--sea-ink)]'}>
                            {res === 'Auto' ? 'Auto (Optimal HLS)' : res}
                          </span>
                          {selectedQuality === res && <Check className="w-3.5 h-3.5 text-cyan-500" />}
                        </button>
                      ))}
                    </div>
                  )}

                  {settingsTab === 'speed' && (
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setSettingsTab('main')}
                        className="px-2 py-1 text-[11px] text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] text-left mb-1 flex items-center gap-1 cursor-pointer"
                      >
                        ← Back
                      </button>
                      <div className="px-2 py-0.5 text-[11px] font-bold text-[#FF3E00] uppercase tracking-wider">
                        Playback Speed
                      </div>
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => handleSpeedChange(spd)}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[var(--chip-bg)] transition cursor-pointer text-left font-mono"
                        >
                          <span className={selectedSpeed === spd ? 'text-[#FF3E00] font-bold' : 'text-[var(--sea-ink)]'}>
                            {spd}x {spd === 1 ? '(Normal)' : ''}
                          </span>
                          {selectedSpeed === spd && <Check className="w-3.5 h-3.5 text-[#FF3E00]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-white/15 text-white/90 hover:text-white transition cursor-pointer hover:scale-105"
              title={isFullscreen ? 'Exit Fullscreen (f)' : 'Fullscreen (f)'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
