"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, TrendingUp, AlertTriangle, Lightbulb, ArrowRight } from "lucide-react"

export function AIInsightsCard() {
  // Mock data - in a real app, this would come from your AI service
  const insights = [
    {
      type: "opportunity",
      title: "High-Value Route Available",
      description: "Chicago to Atlanta route showing 15% above average rates",
      icon: TrendingUp,
      variant: "default" as const,
    },
    {
      type: "warning",
      title: "Driver Capacity Alert",
      description: "3 drivers approaching HOS limits this week",
      icon: AlertTriangle,
      variant: "destructive" as const,
    },
    {
      type: "suggestion",
      title: "Optimize Load Planning",
      description: "Consider consolidating 2 partial loads to Dallas",
      icon: Lightbulb,
      variant: "secondary" as const,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Insights
        </CardTitle>
        <CardDescription>Smart recommendations based on your dispatch data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
            <div className="mt-0.5">
              <insight.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium">{insight.title}</h4>
                <Badge variant={insight.variant} className="text-xs">
                  {insight.type}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{insight.description}</p>
            </div>
            <Button variant="ghost" size="sm">
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        ))}

        <div className="pt-2 border-t">
          <Button variant="outline" className="w-full" size="sm">
            View All Insights
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
