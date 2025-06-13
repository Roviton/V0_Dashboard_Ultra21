"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import { startOfMonth, endOfMonth } from "date-fns"

export type DashboardData = {
  totalLoads: number
  averageRPM: number
  needsAttention: number
  monthlyRevenue: number
  lowRateLoads: any[]
  pendingComments: any[]
  delayedLoads: any[]
  dispatcherPerformance: any[]
}

export function useAdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get total loads count
      const { count: totalLoads, error: loadsError } = await supabase
        .from("loads")
        .select("*", { count: "exact", head: true })

      if (loadsError) throw new Error(`Error fetching total loads: ${loadsError.message}`)

      // Get loads with rate and distance for RPM calculation
      const { data: loadsWithRates, error: rpmError } = await supabase
        .from("loads")
        .select("rate, distance")
        .not("rate", "is", null)
        .not("distance", "is", null)

      if (rpmError) throw new Error(`Error fetching loads for RPM: ${rpmError.message}`)

      // Calculate average RPM
      const averageRPM =
        loadsWithRates.length > 0
          ? loadsWithRates.reduce((sum, load) => sum + load.rate / (load.distance || 1), 0) / loadsWithRates.length
          : 0

      // Get loads needing attention (with admin comments or low rates)
      const { count: commentsCount, error: commentsError } = await supabase
        .from("admin_comments")
        .select("load_id", { count: "exact", head: true })
        .eq("dispatcher_notified", false)

      if (commentsError) throw new Error(`Error fetching comments count: ${commentsError.message}`)

      // Get low rate loads count (RPM < 2.0)
      const { data: lowRateLoadsData, error: lowRateError } = await supabase
        .from("loads")
        .select("id")
        .not("rate", "is", null)
        .not("distance", "is", null)
        .filter("rate/distance", "lt", 2.0)

      if (lowRateError) throw new Error(`Error fetching low rate loads: ${lowRateError.message}`)

      const needsAttention = (commentsCount || 0) + (lowRateLoadsData?.length || 0)

      // Get monthly revenue
      const now = new Date()
      const monthStart = startOfMonth(now).toISOString()
      const monthEnd = endOfMonth(now).toISOString()

      const { data: monthlyRevenueData, error: revenueError } = await supabase
        .from("loads")
        .select("rate")
        .gte("created_at", monthStart)
        .lte("created_at", monthEnd)
        .not("rate", "is", null)

      if (revenueError) throw new Error(`Error fetching monthly revenue: ${revenueError.message}`)

      const monthlyRevenue = monthlyRevenueData.reduce((sum, load) => sum + (load.rate || 0), 0)

      // Get low rate loads for attention required section
      const { data: lowRateLoads, error: lowRateLoadsError } = await supabase
        .from("loads")
        .select(
          `
          id, load_number, rate, distance,
          users!dispatcher_id(name),
          customers(name)
        `,
        )
        .not("rate", "is", null)
        .not("distance", "is", null)
        .filter("rate/distance", "lt", 2.0)
        .limit(5)

      if (lowRateLoadsError) throw new Error(`Error fetching low rate loads details: ${lowRateLoadsError.message}`)

      // Get loads with admin comments needing dispatcher response
      const { data: pendingComments, error: pendingCommentsError } = await supabase
        .from("admin_comments")
        .select(
          `
          id,
          load_id,
          loads(load_number),
          users!admin_id(name),
          priority,
          created_at
        `,
        )
        .eq("dispatcher_notified", false)
        .limit(5)

      if (pendingCommentsError) throw new Error(`Error fetching pending comments: ${pendingCommentsError.message}`)

      // Get delayed loads
      const { data: delayedLoads, error: delayedLoadsError } = await supabase
        .from("loads")
        .select("id, load_number, delivery_date, status, customers(name)")
        .lt("delivery_date", new Date().toISOString())
        .not("status", "in", "(completed,cancelled)")
        .limit(5)

      if (delayedLoadsError) throw new Error(`Error fetching delayed loads: ${delayedLoadsError.message}`)

      // Get dispatcher performance
      const { data: dispatcherPerformance, error: dispatcherError } = await supabase
        .from("users")
        .select(
          `
          id,
          name,
          loads:loads!dispatcher_id(
            id,
            rate,
            distance,
            status
          )
        `,
        )
        .eq("role", "dispatcher")
        .limit(5)

      if (dispatcherError) throw new Error(`Error fetching dispatcher performance: ${dispatcherError.message}`)

      // Process dispatcher performance data
      const processedDispatcherPerformance = dispatcherPerformance
        .map((dispatcher) => {
          const loads = dispatcher.loads || []
          const totalLoads = loads.length
          const completedLoads = loads.filter((load) => load.status === "completed").length
          const totalRPM = loads.reduce(
            (sum, load) => sum + (load.rate && load.distance ? load.rate / load.distance : 0),
            0,
          )
          const avgRPM = totalLoads > 0 ? totalRPM / totalLoads : 0
          const completionRate = totalLoads > 0 ? (completedLoads / totalLoads) * 100 : 0

          return {
            id: dispatcher.id,
            name: dispatcher.name,
            totalLoads,
            completedLoads,
            avgRPM,
            completionRate,
          }
        })
        .sort((a, b) => b.avgRPM - a.avgRPM)

      setDashboardData({
        totalLoads: totalLoads || 0,
        averageRPM,
        needsAttention,
        monthlyRevenue,
        lowRateLoads,
        pendingComments,
        delayedLoads,
        dispatcherPerformance: processedDispatcherPerformance,
      })
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()

    // Set up real-time subscriptions
    const loadsSubscription = supabase
      .channel("loads-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "loads",
        },
        () => {
          fetchDashboardData()
        },
      )
      .subscribe()

    const commentsSubscription = supabase
      .channel("comments-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "admin_comments",
        },
        () => {
          fetchDashboardData()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(loadsSubscription)
      supabase.removeChannel(commentsSubscription)
    }
  }, [])

  return { dashboardData, loading, error, refetch: fetchDashboardData }
}
