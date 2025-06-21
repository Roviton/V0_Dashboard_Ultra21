"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Truck, Users, BarChart3, Clock, CheckCircle, Globe, ArrowRight } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthRedirect = async () => {
      // Check if this is a recovery link
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get("access_token")
      const type = hashParams.get("type")

      if (accessToken && type === "recovery") {
        console.log("🔑 Recovery link detected, redirecting...")
        router.push("/auth/recovery")
        return
      }

      // Check if user is already signed in
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        // Get user profile to determine redirect
        const { data: profile } = await supabase.from("users").select("role").eq("id", session.user.id).single()

        if (profile?.role === "admin") {
          router.push("/dashboard/admin")
        } else {
          router.push("/dashboard")
        }
      }
    }

    handleAuthRedirect()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-2 transform group-hover:scale-105 transition duration-200">
                  <Truck className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-2xl font-black text-gray-900">
                  Ultra<span className="text-blue-600 font-extrabold">21</span>
                </div>
                <div className="text-xs text-gray-600 font-medium tracking-wide">Freight Solutions</div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register/company">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
            Trusted by 1000+ Freight Companies
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Streamline Your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Freight Operations
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Powerful dispatch management system that helps you manage loads, drivers, and customers with ease. Increase
            efficiency and reduce operational costs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register/company">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg px-8 py-3"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Fleet
            </h2>
            <p className="text-xl text-gray-600">Comprehensive tools designed for modern freight dispatchers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Load Management</CardTitle>
                <CardDescription>
                  Create, track, and manage loads with real-time updates and automated workflows.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Driver Management</CardTitle>
                <CardDescription>
                  Assign drivers, track performance, and manage schedules all in one place.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Analytics & Reports</CardTitle>
                <CardDescription>
                  Get insights into your operations with detailed analytics and custom reports.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Real-time Tracking</CardTitle>
                <CardDescription>
                  Monitor loads and drivers in real-time with GPS tracking and status updates.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-xl">Automated Workflows</CardTitle>
                <CardDescription>
                  Streamline operations with automated load assignment and status updates.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Multi-location Support</CardTitle>
                <CardDescription>Manage operations across multiple locations with centralized control.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Freight Operations?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of freight companies already using Ultra21 to streamline their operations.
          </p>
          <Link href="/auth/register/company">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg px-8 py-3"
            >
              Start Your Free Trial Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg blur opacity-20"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-2">
                <Truck className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <div className="text-2xl font-black">
                Ultra<span className="text-blue-400 font-extrabold">21</span>
              </div>
              <div className="text-xs text-gray-400 font-medium tracking-wide">Freight Solutions</div>
            </div>
          </div>
          <p className="text-gray-400">© 2024 Ultra21 Freight Solutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
