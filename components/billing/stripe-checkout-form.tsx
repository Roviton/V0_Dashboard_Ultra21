"use client"

import type React from "react"

import { useEffect, useState, useMemo } from "react"
import { loadStripe, type StripeElementsOptions, type Stripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast" // Assuming this is your shadcn/ui toast hook
import { Loader2 } from "lucide-react"

// Call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// Store the promise in a variable.
let stripePromiseSingleton: Promise<Stripe | null> | null = null
const getStripePromise = () => {
  if (!stripePromiseSingleton) {
    const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!stripePublishableKey) {
      console.error("Stripe publishable key is not set.")
      return Promise.resolve(null) // Return a promise that resolves to null
    }
    stripePromiseSingleton = loadStripe(stripePublishableKey)
  }
  return stripePromiseSingleton
}

interface CheckoutFormProps {
  clientSecret: string
}

function ActualCheckoutForm({ clientSecret }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!stripe || !elements) {
      console.log("Stripe.js has not loaded yet.")
      return
    }

    setIsLoading(true)
    setMessage(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/billing/completion`, // Adjust as needed
      },
    })

    if (error) {
      // Simplified error handling
      setMessage(error.message || "An unexpected error occurred.")
      toast({
        title: "Payment Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    } else {
      // Payment successful, customer is redirected.
      // Or handle other scenarios if no redirect.
      toast({
        title: "Payment Processing",
        description: "Your payment is processing. You will be redirected shortly.",
      })
    }
    setIsLoading(false)
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
      <Button disabled={isLoading || !stripe || !elements} type="submit" className="w-full mt-6">
        <span id="button-text">{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Pay now"}</span>
      </Button>
      {message && (
        <div id="payment-message" className="text-sm text-red-500 mt-2 text-center">
          {message}
        </div>
      )}
    </form>
  )
}

interface StripePaymentFormProps {
  paymentIntentClientSecret?: string // Allow passing client secret directly
  // Add other props needed to determine amount/currency if creating PI here
  amount?: number
  currency?: string
}

export default function StripePaymentForm({
  paymentIntentClientSecret: initialClientSecret,
  amount = 1000, // Default amount in cents, e.g., $10.00
  currency = "usd", // Default currency
}: StripePaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | undefined>(initialClientSecret)
  const [stripeInstance, setStripeInstance] = useState<Promise<Stripe | null> | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    setStripeInstance(getStripePromise())
  }, [])

  useEffect(() => {
    if (!initialClientSecret) {
      // If no client secret is passed, create one.
      // This is an example; adjust API endpoint and payload as needed.
      fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ id: "subscription_ standaard" }], // Example item
          amount, // Pass amount
          currency, // Pass currency
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret)
          } else {
            console.error("Failed to get client secret:", data)
            toast({ title: "Error", description: "Failed to initialize payment form.", variant: "destructive" })
          }
        })
        .catch((error) => {
          console.error("Error fetching client secret:", error)
          toast({ title: "Error", description: "Could not connect to payment services.", variant: "destructive" })
        })
    }
  }, [initialClientSecret, toast, amount, currency])

  const options: StripeElementsOptions | undefined = useMemo(() => {
    if (!clientSecret) return undefined
    return {
      clientSecret,
      appearance: {
        theme: "stripe",
        rules: {
          ".Label": {
            fontWeight: "500",
            marginBottom: "8px",
          },
          ".Input": {
            borderColor: "hsl(var(--input))",
            borderRadius: "calc(var(--radius) - 2px)",
          },
        },
      },
    }
  }, [clientSecret])

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return <p className="text-center text-red-600 p-4">Stripe is not configured. Missing publishable key.</p>
  }

  if (!stripeInstance) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-2">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading Stripe...</p>
      </div>
    )
  }

  if (!clientSecret || !options) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-2">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Initializing Payment Details...</p>
      </div>
    )
  }

  return (
    <Elements stripe={stripeInstance} options={options}>
      <ActualCheckoutForm clientSecret={clientSecret} />
    </Elements>
  )
}
