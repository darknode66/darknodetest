import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function VideoTranscription() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [transcription, setTranscription] = useState("")

  // Simulate real-time transcription updates
  useEffect(() => {
    if (isSidebarOpen) {
      const interval = setInterval(() => {
        setTranscription(prev => prev + "Lorem ipsum dolor sit amet. ")
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [isSidebarOpen])

  return (
    <div className="flex h-screen">
      <div className="flex-1 p-4">
        <Card className="w-full aspect-video bg-gray-200 flex items-center justify-center text-2xl font-bold">
          {/* Replace this with actual video player if needed */}
          Video Player
        </Card>
        <Button
          className="mt-4"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? "Close Transcription" : "Open Transcription"}
        </Button>
      </div>

      {isSidebarOpen && (
        <div className="w-1/3 p-4 bg-gray-100 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Real-time Transcription</h2>
          <p>{transcription}</p>
        </div>
      )}
    </div>
  )
}