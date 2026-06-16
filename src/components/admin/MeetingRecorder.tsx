'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Square, AlertCircle, Loader2, Sparkles, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface MeetingRecorderProps {
    onTranscription: (text: string, isFinal: boolean, speaker?: number) => void;
    isRecording: boolean;
    setIsRecording: (recording: boolean) => void;
    isInitializing: boolean;
    setIsInitializing: (initializing: boolean) => void;
}

export function MeetingRecorder({
    onTranscription,
    isRecording,
    setIsRecording,
    isInitializing,
    setIsInitializing
}: MeetingRecorderProps) {
    const [error, setError] = useState<string | null>(null)
    const [isSystemAudioCaptured, setIsSystemAudioCaptured] = useState(false)

    const audioContextRef = useRef<AudioContext | null>(null)
    const processorRef = useRef<ScriptProcessorNode | null>(null)
    const socketRef = useRef<WebSocket | null>(null)
    const micStreamRef = useRef<MediaStream | null>(null)
    const systemStreamRef = useRef<MediaStream | null>(null)
    const isRecordingRef = useRef(false)

    const stopRecording = useCallback(() => {
        isRecordingRef.current = false
        setIsRecording(false)

        if (processorRef.current) {
            processorRef.current.disconnect()
            processorRef.current = null
        }

        if (audioContextRef.current) {
            audioContextRef.current.close()
            audioContextRef.current = null
        }

        if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach(track => track.stop())
            micStreamRef.current = null
        }

        if (systemStreamRef.current) {
            systemStreamRef.current.getTracks().forEach(track => track.stop())
            systemStreamRef.current = null
        }

        if (socketRef.current) {
            socketRef.current.close()
            socketRef.current = null
        }

        setIsSystemAudioCaptured(false)
        console.log("Recording stopped")
    }, [setIsRecording])

    useEffect(() => {
        return () => {
            stopRecording()
        }
    }, [stopRecording])

    const startRecording = async () => {
        setIsInitializing(true)
        setError(null)
        setIsSystemAudioCaptured(false)

        try {
            // 1. Get Deepgram Key from our API
            const response = await fetch('/api/transcribe/token')
            const { key, error: keyError } = await response.json()
            if (keyError || !key) throw new Error(keyError || "Deepgram key not found")

            // 2. Capture Microphone
            const micStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            })
            micStreamRef.current = micStream

            // 3. Capture System Audio (Optional but recommended for meetings)
            let systemStream: MediaStream | null = null
            try {
                systemStream = await navigator.mediaDevices.getDisplayMedia({
                    video: { width: 1, height: 1 },
                    audio: true
                })
                systemStreamRef.current = systemStream
                setIsSystemAudioCaptured(true)
            } catch (err) {
                console.warn("System audio capture cancelled or failed", err)
                toast.warning("System audio not captured. Meeting participants will not be transcribed.")
            }

            // 4. Setup Audio Context & Mixing
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
            const audioContext = new AudioContextClass({ sampleRate: 16000 })
            audioContextRef.current = audioContext

            const micSource = audioContext.createMediaStreamSource(micStream)

            // Mixing setup
            const mixer = audioContext.createGain()
            micSource.connect(mixer)

            if (systemStream && systemStream.getAudioTracks().length > 0) {
                const systemSource = audioContext.createMediaStreamSource(systemStream)
                systemSource.connect(mixer)
            }

            // Processor to get raw PCM data
            const processor = audioContext.createScriptProcessor(4096, 1, 1)
            processorRef.current = processor
            mixer.connect(processor)
            processor.connect(audioContext.destination) // Required to keep it running

            // 5. Connect to Deepgram via WebSocket with Diarization enabled
            const socket = new WebSocket('wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000&interim_results=true&endpointing=true&punctuate=true&diarize=true', [
                'token',
                key
            ])
            socketRef.current = socket

            socket.onopen = () => {
                console.log("Deepgram connection opened")
                setIsRecording(true)
                isRecordingRef.current = true
                setIsInitializing(false)
                toast.success("Professional transcription active (Mic + System)")
            }

            socket.onmessage = (message) => {
                const data = JSON.parse(message.data)
                const alternative = data.channel.alternatives[0]
                const transcript = alternative.transcript
                const speaker = alternative.words && alternative.words.length > 0 ? alternative.words[0].speaker : undefined

                if (transcript && data.is_final) {
                    onTranscription(transcript, true, speaker)
                } else if (transcript) {
                    onTranscription(transcript, false, speaker)
                }
            }

            socket.onerror = (err) => {
                console.error("Deepgram WebSocket Error:", err)
                setError("Transcription service error")
                stopRecording()
            }

            socket.onclose = () => {
                console.log("Deepgram connection closed")
                if (isRecordingRef.current) {
                    stopRecording()
                }
            }

            processor.onaudioprocess = (e) => {
                if (socket.readyState === WebSocket.OPEN) {
                    const inputData = e.inputBuffer.getChannelData(0)
                    // Convert Float32 to Int16 for Deepgram linear16
                    const pcmData = new Int16Array(inputData.length)
                    for (let i = 0; i < inputData.length; i++) {
                        pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF
                    }
                    socket.send(pcmData.buffer)
                }
            }

        } catch (err: any) {
            console.error("Failed to start professional recording:", err)
            setError(err.message || "Could not access audio devices")
            toast.error("Failed to start meeting recorder")
            setIsInitializing(false)
            stopRecording()
        }
    }

    return (
        <div className="flex items-center gap-2">
            {isRecording ? (
                <button
                    onClick={stopRecording}
                    className="flex items-center gap-1.5 text-red-500 hover:underline py-1 text-xs font-medium cursor-pointer transition-all lowercase"
                >
                    <Square className="w-2.5 h-2.5 fill-current" />
                    stop
                </button>
            ) : (
                <button
                    onClick={startRecording}
                    disabled={isInitializing}
                    className="flex items-center gap-1.5 text-muted-fg hover:text-foreground hover:underline py-1 text-xs font-medium disabled:opacity-50 whitespace-nowrap cursor-pointer transition-all lowercase"
                >
                    {isInitializing ? (
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    ) : (
                        <Play className="w-2 h-2 fill-current" />
                    )}
                    {isInitializing ? "..." : "start transcription"}
                </button>
            )
            }

            <div className="flex items-center gap-1.5 ml-1">
                {isSystemAudioCaptured && <Volume2 className="w-3 h-3 text-muted-fg" />}
                {error && <AlertCircle className="w-3 h-3 text-red-500" />}
            </div>
        </div>
    )
}
