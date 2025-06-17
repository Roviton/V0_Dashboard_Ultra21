import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Truck } from "lucide-react"

export default async function HomePage() {
  const { userId } = auth()

  if (userId) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg blur opacity-20"></div>
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-4">
              <Truck className="h-12 w-12 text-white" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-4xl font-black text-gray-900">
              Ultra<span className="text-blue-600 font-extrabold">21</span>
            </div>
            <div className="text-sm text-gray-600 font-medium tracking-wide">Freight Solutions</div>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Ultra21</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
          Professional freight dispatch management system for modern logistics operations
        </p>

        <div className="space-x-4">
          <Button asChild size="lg">
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
