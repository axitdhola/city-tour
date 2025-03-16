"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  TrophyIcon,
  ShareIcon,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Update the interface for quiz history items
interface QuizHistoryItem {
  id: string
  user_id: string
  score: number
  total_questions: number
  created_at: string
  updated_at: string
}

export default function HistoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const username = searchParams.get('username')
  const [history, setHistory] = useState<QuizHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHistory = async () => {
      try {
        if (!username) {
          setLoading(false)
          return
        }

        const response = await fetch(`http://localhost:8080/quiz/list/${username}`, {
          headers: {
            'Accept': 'application/json',
          }
        })
        if (!response.ok) throw new Error('Failed to fetch history')
        const data: QuizHistoryItem[] = await response.json()
        setHistory(data)
      } catch (error) {
        console.error("Failed to load history:", error)
        setHistory([])
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [username])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: 'UTC'
    }).format(date)
  }

  const getChallengeLink = (quizId: string) => {
    return `${window.location.origin}/quiz/${quizId}/invite?invitedBy=${encodeURIComponent(username || '')}`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Challenge link copied! 🎮",
        description: "Share with your friends and see who scores better!",
        duration: 3000, // Toast will show for 3 seconds
        className: "bg-green-50",
      })
    } catch (err) {
      console.error('Failed to copy:', err)
      toast({
        title: "Oops! Failed to copy link",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => router.push("/")} className="flex items-center text-gray-600">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back
          </Button>

          <h1 className="text-2xl font-bold text-gray-900">Quiz History</h1>

          <Button
            onClick={async () => {
              try {
                const username = new URLSearchParams(window.location.search).get('username');
                const response = await fetch('http://localhost:8080/quiz/create', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                  },
                  body: JSON.stringify({
                    name: username
                  }),
                });

                if (!response.ok) {
                  throw new Error('Failed to create quiz');
                }

                const data = await response.json();
                router.push(`/quiz/${data.id}?username=${encodeURIComponent(username || 'Anonymous')}`);
              } catch (error) {
                console.error('Failed to create quiz:', error);
              }
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Start New Quiz
          </Button>
        </div>

        <Card className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Quiz History</h2>

          {!username ? (
            <div className="text-center py-8 text-gray-500">
              Please log in to view your quiz history.
            </div>
          ) : (
            Array.isArray(history) && (
              history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No quiz history found. Start playing to see your results here!
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 p-6 rounded-lg bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <TrophyIcon className="h-5 w-5 text-yellow-500" />
                            <h3 className="font-semibold text-gray-900">Quiz #{item.id.slice(0, 8)}</h3>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mt-3">
                            <div className="flex items-center gap-2 text-gray-600">
                              <CalendarIcon className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">{formatDate(item.created_at)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {item.score / item.total_questions >= 0.7 ? (
                                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircleIcon className="h-4 w-4 text-red-500" />
                              )}
                              <span className="text-sm font-medium">
                                Score: <span className={`${item.score / item.total_questions >= 0.7 ? 'text-green-600' : 'text-red-600'}`}>
                                  {item.score}/{item.total_questions}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(getChallengeLink(item.id))}
                          className="flex items-center gap-2 hover:bg-blue-50 transition-colors duration-200"
                        >
                          <ShareIcon className="h-4 w-4 text-blue-500" />
                          <span className="hidden sm:inline">Challenge Friends</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )
          )}
        </Card>
      </div>
      
      <Toaster />
    </main>
  )
}

