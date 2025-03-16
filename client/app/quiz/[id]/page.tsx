"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
    MapPinIcon,
    CheckCircleIcon,
    XCircleIcon,
    RefreshCwIcon,
    ShareIcon,
    ArrowLeftIcon,
    HistoryIcon,
} from "lucide-react"
import confetti from "canvas-confetti"
import { ShareModal } from "@/components/share-modal"
import { useToast } from "@/components/ui/use-toast"

// Define types for our data structures
interface Destination {
    id: string
    city: string
    country: string
    clues: string[]
    fun_fact: string[]
    trivia: string[]
    options: string[]
    created_at: string
    updated_at: string
}

interface QuizResult {
    isCorrect: boolean
    funFact: string
}

// Add the new interface for the API response
interface QuizAnswerResponse {
    is_correct: boolean;
    score: number;
    total_questions: number;
}

export default function QuizPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const params = useParams()
    const username = searchParams.get("username") || "Anonymous"
    const invitedQuizId = searchParams.get("invitedQuizId")
    const quizId = params.id

    const [destination, setDestination] = useState<Destination | null>(null)
    const [options, setOptions] = useState<string[]>([])
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [result, setResult] = useState<QuizResult | null>(null)
    const [score, setScore] = useState({ correct: 0, total: 0 })
    const [loading, setLoading] = useState(true)
    const [showShareModal, setShowShareModal] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        loadNewDestination()
    }, [])

    const loadNewDestination = async () => {
        setLoading(true)
        setSelectedOption(null)
        setResult(null)

        try {
            const queryParams = invitedQuizId ? `?invitedQuizId=${invitedQuizId}` : '';
            const response = await fetch(`http://localhost:8080/quiz/${quizId}/question${queryParams}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load question');
            }

            const data = await response.json();

            // Check if there are no more questions
            if (!data || !data.clues || data.clues.length === 0) {
                toast({
                    title: "Quiz Completed!",
                    description: "You've completed all the questions. Redirecting to history...",
                    duration: 3000,
                })

                // Wait for toast to be visible before redirecting
                setTimeout(() => {
                    router.push(`/history?username=${encodeURIComponent(username)}`)
                }, 2000)
                return
            }

            setDestination(data)
            setOptions(data.options)
        } catch (error) {
            console.error("Failed to load destination:", error)
            toast({
                title: "Error",
                description: "Failed to load the next question",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleAnswer = async (option: string) => {
        setSelectedOption(option)

        if (!destination) return;

        try {
            const response = await fetch(`http://localhost:8080/quiz/answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    answer: option,
                    user_name: username,
                    quiz_id: quizId,
                    question_id: destination.id
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit answer');
            }

            const data: QuizAnswerResponse = await response.json();

            // Update the result state with the response
            setResult({
                isCorrect: data.is_correct,
                funFact: destination.fun_fact[Math.floor(Math.random() * destination.fun_fact.length)],
            })

            // Update score with the actual values from the response
            setScore({
                correct: data.score,
                total: data.total_questions
            })

            // Show confetti only if the answer is correct
            if (data.is_correct) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                })
            }

        } catch (error) {
            console.error("Failed to submit answer:", error)
        }
    }

    const startNewQuiz = async () => {
        try {
            const response = await fetch('http://localhost:8080/quiz/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    username: username
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create new quiz');
            }

            const data = await response.json();
            router.push(`/quiz/${data.id}?username=${encodeURIComponent(username)}`);
        } catch (error) {
            console.error("Failed to create new quiz:", error)
        }
    }

    const handleShare = () => {
        setShowShareModal(true)
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
                    <Button variant="ghost" onClick={() => router.push("/history?username=" + encodeURIComponent(username))} className="flex items-center text-gray-600">
                        <ArrowLeftIcon className="h-4 w-4 mr-1" />
                        Back to History
                    </Button>

                    <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-700">Playing as: {username}</span>
                        <Button variant="outline" size="sm" onClick={() => router.push("/history?username=" + encodeURIComponent(username))} className="flex items-center">
                            <HistoryIcon className="h-4 w-4 mr-1" />
                            History
                        </Button>
                    </div>
                </div>

                <Card className="bg-white p-6 rounded-xl shadow-md mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold text-gray-900">Guess the Destination</h1>
                        <div className="flex items-center space-x-1 bg-blue-100 px-3 py-1 rounded-full">
                            <CheckCircleIcon className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">{score.correct}</span>
                            <span className="text-sm text-gray-500 mx-1">/</span>
                            <span className="text-sm font-medium">{score.total}</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-lg font-medium text-gray-700 mb-2">Clues:</h2>
                        <ul className="space-y-2">
                            {destination?.clues.map((clue: string, index: number) => (
                                <li key={index} className="bg-blue-50 p-3 rounded-lg text-gray-800">
                                    {clue}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-lg font-medium text-gray-700 mb-2">Where am I?</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {options.map((option: string, index: number) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    className={`h-auto py-3 justify-start ${selectedOption && selectedOption !== option ? "opacity-60" : ""
                                        } ${selectedOption === option
                                            ? result
                                                ? result.isCorrect
                                                    ? "bg-green-600 hover:bg-green-600 text-white border-green-600"  // Green for correct
                                                    : "bg-red-600 hover:bg-red-600 text-white border-red-600"        // Red for incorrect
                                                : "bg-blue-600 hover:bg-blue-600 text-white border-blue-600"       // Blue when selected
                                            : ""
                                        }`}
                                    disabled={!!selectedOption}
                                    onClick={() => handleAnswer(option)}
                                >
                                    <MapPinIcon className="h-4 w-4 mr-2" />
                                    {option}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {result && (
                        <div
                            className={`p-4 rounded-lg mb-6 ${result.isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                                }`}
                        >
                            <div className="flex items-start">
                                {result.isCorrect ? (
                                    <CheckCircleIcon className="h-6 w-6 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <XCircleIcon className="h-6 w-6 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                                )}
                                <div>
                                    <h3 className="font-medium text-gray-900">{result.isCorrect ? "Correct!" : "Not quite right!"}</h3>
                                    <p className="text-gray-700 mt-1">{result.funFact}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                        {result && (
                            <>
                                <Button onClick={loadNewDestination} className="flex-1 bg-blue-600 hover:bg-blue-700">
                                    <RefreshCwIcon className="h-4 w-4 mr-2" />
                                    Next Question
                                </Button>

                                <Button onClick={startNewQuiz} variant="outline" className="flex-1">
                                    Start New Quiz
                                </Button>
                            </>
                        )}

                        <Button variant="outline" onClick={handleShare} className="flex-1">
                            <ShareIcon className="h-4 w-4 mr-2" />
                            Challenge a Friend
                        </Button>
                    </div>
                </Card>
            </div>

            {showShareModal && (
                <ShareModal
                    username={username}
                    score={score}
                    quizId={quizId}
                    onClose={() => setShowShareModal(false)}
                />
            )}
        </main>
    )
}