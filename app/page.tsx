import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Truck,
  Users,
  BarChart3,
  MessageSquare,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Truck className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Ultra21 Dispatch</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Trusted by 500+ Freight Companies
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Streamline Your Freight
            <span className="text-primary block">Dispatch Operations</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Manage loads, coordinate drivers, and optimize your logistics with our comprehensive dispatch management
            platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Manage Your Fleet</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From load management to driver coordination, our platform provides all the tools you need.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Truck className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Load Management</CardTitle>
                <CardDescription>
                  Track and manage all your loads from pickup to delivery with real-time updates.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Driver Coordination</CardTitle>
                <CardDescription>
                  Assign drivers, track their status, and communicate efficiently with your team.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>
                  Get insights into your operations with comprehensive reporting and analytics.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <MessageSquare className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Communication Hub</CardTitle>
                <CardDescription>Centralized messaging system for brokers, drivers, and customers.</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Secure & Compliant</CardTitle>
                <CardDescription>Enterprise-grade security with full compliance to industry standards.</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>AI-Powered</CardTitle>
                <CardDescription>
                  Leverage AI for document processing, route optimization, and predictive analytics.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose Ultra21 Dispatch?</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Increase Efficiency</h3>
                    <p className="text-muted-foreground">Reduce manual work and streamline your dispatch operations.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Real-time Tracking</h3>
                    <p className="text-muted-foreground">
                      Monitor loads and drivers in real-time with GPS integration.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Cost Reduction</h3>
                    <p className="text-muted-foreground">Optimize routes and reduce operational costs by up to 30%.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">24/7 Support</h3>
                    <p className="text-muted-foreground">Get help when you need it with our dedicated support team.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 rounded-lg">
              <img
                src="/dispatch-dashboard-interface.png"
                alt="Ultra21 Dispatch Dashboard Interface"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Dispatch Operations?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join hundreds of freight companies already using Ultra21 Dispatch to streamline their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Start Your Free Trial
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Truck className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Ultra21 Dispatch</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Streamlining freight dispatch operations with cutting-edge technology and AI-powered solutions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/dashboard" className="hover:text-foreground">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/loads" className="hover:text-foreground">
                    Load Management
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/drivers" className="hover:text-foreground">
                    Driver Management
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/reports-analytics" className="hover:text-foreground">
                    Analytics
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="https://www.ultra21.com" className="hover:text-foreground">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="https://www.ultra21.com" className="hover:text-foreground">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="https://www.ultra21.com" className="hover:text-foreground">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="https://www.ultra21.com" className="hover:text-foreground">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact Info</h3>
              <div className="space-y-3 text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>(702) 472-7788</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>dispatch@ultra21.com</span>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span>
                    1489 W. Warm Springs Rd., Suite 110
                    <br />
                    Henderson, NV 89014
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-muted-foreground text-sm">© 2024 Ultra21 Dispatch. All rights reserved.</div>
              <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
                <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
                <Link href="/terms-conditions" className="text-muted-foreground hover:text-foreground">
                  Terms & Conditions
                </Link>
                <a href="https://www.ultra21.com" className="text-muted-foreground hover:text-foreground">
                  Website
                </a>
              </div>
            </div>

            {/* SMS Compliance Notice */}
            <div className="mt-6 pt-6 border-t text-xs text-muted-foreground">
              <p className="mb-2">
                <strong>SMS Terms:</strong> By using our services, you may receive SMS notifications. Message frequency
                varies. Message and data rates may apply. Text STOP to opt out, HELP for assistance.
              </p>
              <p>
                SMS consent is not shared with third parties. Visit our{" "}
                <Link href="/privacy-policy" className="underline hover:text-foreground">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/terms-conditions" className="underline hover:text-foreground">
                  Terms & Conditions
                </Link>{" "}
                for more information.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
