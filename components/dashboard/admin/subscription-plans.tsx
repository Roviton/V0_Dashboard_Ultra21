"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star } from "lucide-react"

const plans = [
  {
    name: "Starter",
    price: "$99",
    period: "month",
    description: "Perfect for small freight companies",
    features: ["Up to 5 dispatchers", "500 loads per month", "Basic reporting", "Email support", "Driver mobile app"],
    current: false,
  },
  {
    name: "Professional",
    price: "$299",
    period: "month",
    description: "Most popular for growing companies",
    features: [
      "Up to 15 dispatchers",
      "1,000 loads per month",
      "Advanced analytics",
      "Priority support",
      "Driver mobile app",
      "Broker integrations",
      "Custom reports",
    ],
    current: true,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$599",
    period: "month",
    description: "For large freight operations",
    features: [
      "Unlimited dispatchers",
      "Unlimited loads",
      "Advanced analytics",
      "24/7 phone support",
      "Driver mobile app",
      "All integrations",
      "Custom reports",
      "API access",
      "White-label options",
    ],
    current: false,
  },
]

export function SubscriptionPlans() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {plans.map((plan) => (
        <Card key={plan.name} className={`relative ${plan.current ? "border-primary" : ""}`}>
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">
                <Star className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
            </div>
          )}
          {plan.current && (
            <div className="absolute -top-3 right-4">
              <Badge variant="secondary">Current Plan</Badge>
            </div>
          )}

          <CardHeader>
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-muted-foreground ml-1">/{plan.period}</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button className="w-full" variant={plan.current ? "outline" : "default"} disabled={plan.current}>
              {plan.current ? "Current Plan" : "Upgrade to " + plan.name}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
