"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { GlobeIcon, TrophyIcon } from "lucide-react"

export default function InvitePage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const quizId = params.id
    const invitedBy = searchParams.get("invitedBy")

    const [username, setUsername] = useState("")
    const [inviterScore, setInviterScore] = useState<{ score: number; total: number } | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    // Fetch inviter's score when component mounts
    useEffect(() => {
        const fetchInviterScore = async () => {
            try {
                const response = await fetch(`http://localhost:8080/quiz/${quizId}/score`, {
                    headers: {
                        'Accept': 'application/json',
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch score');

                const data = await response.json();
                setInviterScore({
                    score: data.score,
                    total: data.total_questions
                });
            } catch (error) {
                setError("Failed to load challenge details");
            } finally {
                setLoading(false);
            }
        };

        if (invitedBy) {
            fetchInviterScore();
        }
    }, [quizId, invitedBy]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;

        try {
            // Register the new user
            const registerResponse = await fetch('http://localhost:8080/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ name: username.trim() }),
            });

            if (!registerResponse.ok) {
                throw new Error('Username already taken');
            }

            // Create a new quiz for the invited user
            const createQuizResponse = await fetch('http://localhost:8080/quiz/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    username: username.trim()
                }),
            });

            if (!createQuizResponse.ok) {
                throw new Error('Failed to create new quiz');
            }

            const quizData = await createQuizResponse.json();

            // Redirect to the quiz page with new quiz ID, username, and invitedQuizId
            router.push(`/quiz/${quizData.id}?username=${encodeURIComponent(username.trim())}&invitedQuizId=${quizId}`);
        } catch (error) {
            setError("Username already taken. Please choose another one.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4">
            <Card className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <GlobeIcon className="h-16 w-16 text-blue-600" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Challenge Accepted?</h1>

                    {inviterScore && (
                        <div className="bg-blue-50 p-4 rounded-lg mb-6">
                            <div className="flex items-center justify-center mb-2">
                                <TrophyIcon className="h-5 w-5 text-blue-600 mr-2" />
                                <span className="font-medium text-blue-900">{invitedBy}'s Score</span>
                            </div>
                            <p className="text-center text-blue-800">
                                Scored {inviterScore.score} out of {inviterScore.total} questions
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Start Challenge
                        </Button>
                    </form>
                </div>
            </Card>
        </main>
    );
}