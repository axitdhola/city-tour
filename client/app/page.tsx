import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { GlobeIcon } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <GlobeIcon className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Globetrotter</h1>
          <p className="text-gray-600 mb-8">Test your knowledge of famous destinations around the world!</p>

          <form
            action={async (formData) => {
              "use server"
              const username = formData.get("username") as string
              if (!username || username.trim() === "") return

              try {
                // Call the create user API running on port 8080
                const response = await fetch('http://localhost:8080/user/register', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                  },
                  body: JSON.stringify({ name: username.trim() }),
                })

                if (!response.ok) {
                  throw new Error('Failed to create user')
                }

                // Changed: Redirect to history page instead of quiz
                redirect(`/history?username=${encodeURIComponent(username.trim())}`)
              } catch (error) {
                console.error('Error creating user:', error)
                // You might want to handle this error more gracefully in a production app
                throw error
              }
            }}
          >
            <div className="mb-4">
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors"
            >
              Start Quiz
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}

