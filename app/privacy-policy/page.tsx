import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield, Phone, Mail, MapPin } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-muted-foreground text-lg">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-gray max-w-none">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Our Commitment to Your Privacy</CardTitle>
              <CardDescription>
                Ultra21 Dispatch is committed to protecting your privacy and ensuring the security of your personal
                information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                when you use our freight dispatch management platform.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>

              <h3 className="text-xl font-medium mb-3">Personal Information</h3>
              <p className="mb-4">We collect the following types of personal information:</p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>
                  <strong>Contact Information:</strong> Name, email address, phone number, mailing address
                </li>
                <li>
                  <strong>Business Information:</strong> Company name, job title, business address, tax identification
                  numbers
                </li>
                <li>
                  <strong>Account Information:</strong> Username, password, account preferences, billing information
                </li>
                <li>
                  <strong>Driver Information:</strong> Driver's license numbers, CDL information, vehicle details,
                  insurance information
                </li>
                <li>
                  <strong>Load Information:</strong> Pickup and delivery addresses, cargo details, customer information
                </li>
                <li>
                  <strong>Communication Data:</strong> Messages, emails, call logs, SMS communications
                </li>
                <li>
                  <strong>Financial Information:</strong> Payment card details, bank account information, billing
                  addresses
                </li>
              </ul>

              <h3 className="text-xl font-medium mb-3">Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>
                  <strong>Usage Data:</strong> Pages visited, features used, time spent on platform, click patterns
                </li>
                <li>
                  <strong>Device Information:</strong> IP address, browser type, operating system, device identifiers
                </li>
                <li>
                  <strong>Location Data:</strong> GPS coordinates, route information, delivery locations (with consent)
                </li>
                <li>
                  <strong>Cookies and Tracking:</strong> Session cookies, preference cookies, analytics cookies
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">We use your personal information for the following purposes:</p>

              <h3 className="text-xl font-medium mb-3">Service Delivery</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Provide and maintain our dispatch management platform</li>
                <li>Process and manage freight loads and deliveries</li>
                <li>Coordinate between dispatchers, drivers, and customers</li>
                <li>Generate reports and analytics for your business operations</li>
                <li>Facilitate communication between platform users</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">Business Operations</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Process payments and manage billing</li>
                <li>Provide customer support and technical assistance</li>
                <li>Send service-related notifications and updates</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Prevent fraud and ensure platform security</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">Improvement and Marketing</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Analyze usage patterns to improve our services</li>
                <li>Develop new features and functionality</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Conduct research and analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Information Sharing and Disclosure</h2>
              <p className="mb-4">We may share your personal information with the following parties:</p>

              <h3 className="text-xl font-medium mb-3">Service Providers</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Cloud hosting and data storage providers</li>
                <li>Payment processing companies</li>
                <li>Customer support and communication platforms</li>
                <li>Analytics and performance monitoring services</li>
                <li>Security and fraud prevention services</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">Business Partners</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Freight brokers and shippers (as necessary for load coordination)</li>
                <li>Insurance providers (for coverage verification)</li>
                <li>Regulatory agencies (for compliance purposes)</li>
                <li>Integration partners (for connected services)</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">Legal Requirements</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>When required by law or legal process</li>
                <li>To protect our rights, property, or safety</li>
                <li>To prevent fraud or illegal activities</li>
                <li>In connection with business transfers or acquisitions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. SMS and Communication Privacy</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-medium mb-3 text-blue-900">Important SMS Privacy Notice</h3>
                <p className="text-blue-800 font-medium mb-2">
                  <strong>SMS consent is not shared with third parties.</strong>
                </p>
                <p className="text-blue-700">
                  Your consent to receive SMS messages from Ultra21 Dispatch is never shared with third-party companies,
                  affiliates, or marketing partners. We maintain strict control over your communication preferences.
                </p>
              </div>

              <h3 className="text-xl font-medium mb-3">SMS Communications</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Load status updates and delivery notifications</li>
                <li>Driver assignment and coordination messages</li>
                <li>Emergency alerts and time-sensitive communications</li>
                <li>Account security notifications</li>
                <li>Service updates and maintenance notices</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">Communication Controls</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>You can opt out of SMS messages at any time by texting STOP</li>
                <li>Text HELP for assistance with SMS services</li>
                <li>Message and data rates may apply based on your carrier plan</li>
                <li>You can manage email preferences in your account settings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <p className="mb-4">We implement comprehensive security measures to protect your information:</p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>
                  <strong>Encryption:</strong> Data is encrypted in transit and at rest using industry-standard
                  protocols
                </li>
                <li>
                  <strong>Access Controls:</strong> Strict access controls and authentication requirements
                </li>
                <li>
                  <strong>Regular Audits:</strong> Security assessments and vulnerability testing
                </li>
                <li>
                  <strong>Employee Training:</strong> Regular security training for all staff members
                </li>
                <li>
                  <strong>Incident Response:</strong> Comprehensive data breach response procedures
                </li>
                <li>
                  <strong>Compliance:</strong> SOC 2 Type II and other industry certifications
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
              <p className="mb-4">You have the following rights regarding your personal information:</p>

              <h3 className="text-xl font-medium mb-3">Access and Control</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Access and review your personal information</li>
                <li>Update or correct inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Export your data in a portable format</li>
                <li>Restrict certain processing activities</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">Communication Preferences</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Opt out of marketing communications</li>
                <li>Manage SMS notification preferences</li>
                <li>Control email frequency and types</li>
                <li>Set communication channel preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
              <p className="mb-4">We retain your information for the following periods:</p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>
                  <strong>Account Data:</strong> For the duration of your account plus 7 years for business records
                </li>
                <li>
                  <strong>Load Records:</strong> 7 years to comply with transportation regulations
                </li>
                <li>
                  <strong>Financial Data:</strong> 7 years for tax and accounting purposes
                </li>
                <li>
                  <strong>Communication Logs:</strong> 3 years for customer service and dispute resolution
                </li>
                <li>
                  <strong>Analytics Data:</strong> 2 years in aggregated, anonymized form
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
              <p className="mb-4">
                Your information may be transferred to and processed in countries other than your country of residence.
                We ensure appropriate safeguards are in place for international transfers, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Standard Contractual Clauses approved by regulatory authorities</li>
                <li>Adequacy decisions for countries with equivalent privacy protections</li>
                <li>Certification under recognized privacy frameworks</li>
                <li>Your explicit consent for specific transfers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
              <p className="mb-6">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal
                information from children under 18. If we become aware that we have collected personal information from
                a child under 18, we will take steps to delete such information promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to This Privacy Policy</h2>
              <p className="mb-6">
                We may update this Privacy Policy from time to time to reflect changes in our practices or applicable
                laws. We will notify you of material changes by email or through our platform. The updated policy will
                be effective when posted, and your continued use of our services constitutes acceptance of the changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
              <p className="mb-4">
                If you have questions about this Privacy Policy or our privacy practices, please contact us:
              </p>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Ultra21 Dispatch</p>
                        <p className="text-muted-foreground">
                          1489 W. Warm Springs Rd., Suite 110
                          <br />
                          Henderson, NV 89014
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-muted-foreground">(702) 472-7788</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-muted-foreground">dispatch@ultra21.com</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="border-t pt-8">
              <p className="text-sm text-muted-foreground">
                This Privacy Policy is effective as of {new Date().toLocaleDateString()} and applies to all information
                collected by Ultra21 Dispatch through our platform and services.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
