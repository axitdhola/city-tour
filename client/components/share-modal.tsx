"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { PhoneIcon as WhatsappIcon, CopyIcon, CheckIcon, GlobeIcon } from "lucide-react"
import { toPng } from "html-to-image"

export function ShareModal({ username, score, quizId, onClose }) {
  const [copied, setCopied] = useState(false)
  const [shareImage, setShareImage] = useState(null)
  const shareCardRef = useRef(null)

  const shareUrl =
  typeof window !== "undefined" 
    ? `${window.location.origin}/quiz/${quizId}/invite?invitedBy=${encodeURIComponent(username)}` 
    : ""
  
  useEffect(() => {
    if (shareCardRef.current) {
      generateShareImage()
    }
  }, [])

  const generateShareImage = async () => {
    if (!shareCardRef.current) return

    try {
      const dataUrl = await toPng(shareCardRef.current, { quality: 0.95 })
      setShareImage(dataUrl)
    } catch (error) {
      console.error("Failed to generate share image:", error)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareToWhatsApp = () => {
    const text = `I've been playing Globetrotter and scored ${score.correct} correct answers! Can you beat me? Play here: ${shareUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Challenge a Friend</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div
            ref={shareCardRef}
            className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white mb-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <GlobeIcon className="h-6 w-6 mr-2" />
                <span className="font-bold text-lg">Globetrotter</span>
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm">Challenge</div>
            </div>

            <p className="text-lg font-medium mb-2">{username} is challenging you!</p>

            <p className="text-sm opacity-90 mb-4">
              They've scored {score.correct} correct answers out of {score.correct + score.incorrect}. Can you beat
              them?
            </p>

            <div className="bg-white/10 p-3 rounded text-center">
              <p className="text-xs uppercase tracking-wide opacity-80">Current Score</p>
              <div className="flex justify-center items-center space-x-3 mt-1">
                <div className="text-center">
                  <p className="text-2xl font-bold">{score.correct}</p>
                  <p className="text-xs">Correct</p>
                </div>
                <div className="text-2xl font-light opacity-50">:</div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{score.total - score.correct}</p>
                  <p className="text-xs">Incorrect</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={shareToWhatsApp}>
              <WhatsappIcon className="h-4 w-4 mr-2" />
              Share on WhatsApp
            </Button>

            <Button variant="outline" className="w-full" onClick={copyToClipboard}>
              {copied ? (
                <>
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <CopyIcon className="h-4 w-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </div>

        <DialogFooter className="sm:justify-start">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

