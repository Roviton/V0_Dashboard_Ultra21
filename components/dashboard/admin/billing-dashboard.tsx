"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BillingOverview } from "./billing-overview"
import { SubscriptionPlans } from "./subscription-plans"
import { UsageMetrics } from "./usage-metrics"
import { PaymentMethods } from "./payment-methods"
import { BillingHistory } from "./billing-history"

export function BillingDashboard() {
  return (
    <div className="space-y-6">
      <BillingOverview />

      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Usage & Metrics</TabsTrigger>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          <TabsTrigger value="history">Billing History</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <UsageMetrics />
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <SubscriptionPlans />
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <PaymentMethods />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <BillingHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}
