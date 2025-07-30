import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileText, Phone, Mail, MapPin, MessageSquare } from "lucide-react"

export default function TermsConditionsPage() {
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
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Terms & Conditions</h1>
          </div>
          <p className="text-muted-foreground text-lg">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-gray max-w-none">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Agreement to Terms</CardTitle>
              <CardDescription>
                By accessing and using Ultra21 Dispatch services, you agree to be bound by these Terms & Conditions and
                all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited
                from using our services.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Definitions</h2>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>
                  <strong>"Company," "we," "us," "our"</strong> refers to Ultra21 Dispatch
                </li>
                <li>
                  <strong>"Service"</strong> refers to the freight dispatch management platform and related services
                </li>
                <li>
                  <strong>"User," "you," "your"</strong> refers to the individual or entity using our services
                </li>
                <li>
                  <strong>"Account"</strong> refers to your registered user account on our platform
                </li>
                <li>
                  <strong>"Content"</strong> refers to all data, information, and materials on our platform
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
              <p className="mb-4">
                Ultra21 Dispatch provides a comprehensive freight dispatch management platform that includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Load management and tracking systems</li>
                <li>Driver coordination and communication tools</li>
                <li>Customer relationship management features</li>
                <li>Reporting and analytics capabilities</li>
                <li>Document management and processing</li>
                <li>Integration with third-party logistics services</li>
                <li>Mobile applications for drivers and dispatchers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Account Registration and Security</h2>

              <h3 className="text-xl font-medium mb-3">Registration Requirements</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>You must provide accurate and complete information during registration</li>
                <li>You must be at least 18 years old to create an account</li>
                <li>You must have legal authority to bind your organization to these terms</li>
                <li>One person may not maintain multiple accounts</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">Account Security</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>You are responsible for maintaining the confidentiality of your login credentials</li>
                <li>You must notify us immediately of any unauthorized access to your account</li>
                <li>You are liable for all activities that occur under your account</li>
                <li>We reserve the right to suspend accounts that pose security risks</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. SMS Terms of Service</h2>

              <Card className="mb-6 border-blue-200 bg-blue-50">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                    <CardTitle className="text-blue-900">SMS Communication Agreement</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-blue-800">
                    <p className="font-medium">
                      By opting into SMS from Ultra21 Dispatch through web forms or other medium, you are agreeing to
                      receive SMS messages from Ultra21 Dispatch.
                    </p>
                    <p>
                      This includes SMS messages for load notifications, driver updates, delivery confirmations,
                      emergency alerts, account notifications, and service updates.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <h3 className="text-xl font-medium mb-3">Message Types</h3>
              <p className="mb-4">You can expect to receive the following types of SMS messages:</p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>
                  <strong>Load Notifications:</strong> New load assignments, status updates, delivery confirmations
                </li>
                <li>
                  <strong>Driver Updates:</strong> Driver assignments, location updates, ETA changes
                </li>
                <li>
                  <strong>Emergency Alerts:</strong> Urgent notifications requiring immediate attention
                </li>
                <li>
                  <strong>Account Notifications:</strong> Security alerts, password changes, account updates
                </li>
                <li>
                  <strong>Service Updates:</strong> System maintenance, new features, service announcements
                </li>
                <li>
                  <strong>Appointment Reminders:</strong> Pickup and delivery appointment notifications
                </li>
                <li>
                  <strong>Order Alerts:</strong> Order status changes and completion notifications
                </li>
              </ul>

              <h3 className="text-xl font-medium mb-3">SMS Terms and Conditions</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                <ul className="space-y-3">
                  <li>
                    <strong>Messaging frequency may vary</strong> based on your account activity and preferences.
                  </li>
                  <li>
                    <strong>Message and data rates may apply</strong> according to your mobile carrier's plan.
                  </li>
                  <li>
                    <strong>To opt out at any time, text STOP</strong> to any message you receive from us.
                  </li>
                  <li>
                    <strong>For assistance, text HELP</strong> or visit our website at www.ultra21.com.
                  </li>
                  <li>
                    Visit{" "}
                    <Link href="/privacy-policy" className="text-primary hover:underline">
                      our Privacy Policy
                    </Link>{" "}
                    for privacy policy and{" "}
                    <Link href="/terms-conditions" className="text-primary hover:underline">
                      Terms & Conditions
                    </Link>
                    .
                  </li>
                </ul>
              </div>

              <h3 className="text-xl font-medium mb-3">Opt-Out and Help</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>
                  <strong>STOP:</strong> Reply STOP to any SMS to immediately unsubscribe from all messages
                </li>
                <li>
                  <strong>HELP:</strong> Reply HELP to receive assistance and support information
                </li>
                <li>
                  <strong>Customer Support:</strong> Contact us at (702) 472-7788 or dispatch@ultra21.com
                </li>
                <li>
                  <strong>Re-subscription:</strong> Text START to re-enable SMS notifications after opting out
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use Policy</h2>

              <h3 className="text-xl font-medium mb-3">Permitted Uses</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Managing freight dispatch operations for your business</li>
                <li>Coordinating with drivers, customers, and business partners</li>
                <li>Generating reports and analytics for business purposes</li>
                <li>Storing and managing transportation-related documents</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">Prohibited Uses</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Using the service for illegal activities or purposes</li>
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>Interfering with or disrupting our services</li>
                <li>Uploading malicious software or harmful content</li>
                <li>Violating any applicable laws or regulations</li>
                <li>Sharing your account credentials with unauthorized parties</li>
                <li>Using the service to compete with our business</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Payment Terms</h2>

              <h3 className="text-xl font-medium mb-3">Subscription Fees</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>We reserve the right to change pricing with 30 days' notice</li>
                <li>Taxes may apply based on your location and applicable laws</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">Payment Processing</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Payments are processed securely through third-party payment processors</li>
                <li>You authorize us to charge your payment method for all applicable fees</li>
                <li>Failed payments may result in service suspension or termination</li>
                <li>You are responsible for keeping payment information current</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Data and Privacy</h2>
              <p className="mb-4">
                Your privacy is important to us. Our collection and use of your information is governed by our
                <Link href="/privacy-policy" className="text-primary hover:underline ml-1">
                  Privacy Policy
                </Link>
                , which is incorporated into these terms by reference.
              </p>

              <h3 className="text-xl font-medium mb-3">Data Ownership</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>You retain ownership of all data you input into our system</li>
                <li>We may use aggregated, anonymized data for service improvement</li>
                <li>You grant us a license to use your data to provide our services</li>
                <li>We will not sell your personal data to third parties</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Service Availability</h2>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service</li>
                <li>Scheduled maintenance will be announced in advance when possible</li>
                <li>We are not liable for service interruptions beyond our reasonable control</li>
                <li>Emergency maintenance may be performed without advance notice</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Intellectual Property</h2>

              <h3 className="text-xl font-medium mb-3">Our Rights</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>We own all rights to our platform, software, and related intellectual property</li>
                <li>Our trademarks, logos, and brand elements are protected by law</li>
                <li>You may not copy, modify, or distribute our proprietary technology</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">Your Rights</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>You retain ownership of your business data and content</li>
                <li>You may export your data at any time during your subscription</li>
                <li>You grant us necessary rights to provide our services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
              <p className="mb-4">
                To the maximum extent permitted by law, Ultra21 Dispatch shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Loss of profits, revenue, or business opportunities</li>
                <li>Loss of data or information</li>
                <li>Business interruption or downtime</li>
                <li>Third-party claims or damages</li>
              </ul>
              <p className="mb-6">
                Our total liability for any claims shall not exceed the amount paid by you for our services in the 12
                months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Indemnification</h2>
              <p className="mb-6">
                You agree to indemnify and hold harmless Ultra21 Dispatch from any claims, damages, losses, or expenses
                arising from your use of our services, violation of these terms, or infringement of any third-party
                rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Termination</h2>

              <h3 className="text-xl font-medium mb-3">Termination by You</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>You may terminate your account at any time through your account settings</li>
                <li>Termination does not entitle you to a refund of prepaid fees</li>
                <li>You remain liable for all charges incurred before termination</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">Termination by Us</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>We may terminate accounts for violation of these terms</li>
                <li>We may suspend service for non-payment of fees</li>
                <li>We will provide reasonable notice except in cases of serious violations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Governing Law</h2>
              <p className="mb-6">
                These terms are governed by the laws of the State of Nevada, United States, without regard to conflict
                of law principles. Any disputes shall be resolved in the courts of Clark County, Nevada.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Changes to Terms</h2>
              <p className="mb-6">
                We reserve the right to modify these terms at any time. Material changes will be communicated through
                email or platform notifications. Continued use of our services after changes constitutes acceptance of
                the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">15. Contact Information</h2>
              <p className="mb-4">For questions about these Terms & Conditions, please contact us:</p>

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
                These Terms & Conditions are effective as of {new Date().toLocaleDateString()} and govern your use of
                Ultra21 Dispatch services.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
