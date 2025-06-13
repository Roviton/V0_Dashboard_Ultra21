"use client"

import { useMemo } from "react"

interface Load {
  status?: string
  rate?: string | number
}

interface DashboardStatsProps {
  loads?: Load[]
  loading?: boolean
}

export function DashboardStats({ loads = [], loading = false }: DashboardStatsProps) {
  const safeLoads = loads || []

  const stats = useMemo(() => {
    const activeLoads = safeLoads.filter((load) =>
      ["new", "assigned", "accepted", "in_progress"].includes(load?.status || ""),
    )

    const completedLoads = safeLoads.filter((load) => load?.status === "completed")

    const totalRevenue = safeLoads.reduce((sum, load) => {
      const rate = typeof load?.rate === "string" ? Number.parseFloat(load.rate) : load?.rate || 0
      return sum + (isNaN(rate) ? 0 : rate)
    }, 0)

    const avgRate = safeLoads.length > 0 ? totalRevenue / safeLoads.length : 0

    return {
      activeLoads: activeLoads.length,
      completedLoads: completedLoads.length,
      totalRevenue,
      avgRate,
    }
  }, [safeLoads])

  return (
    <div>
      <p>Active Loads: {stats.activeLoads}</p>
      <p>Completed Loads: {stats.completedLoads}</p>
      <p>Total Revenue: {stats.totalRevenue}</p>
      <p>Average Rate: {stats.avgRate}</p>
    </div>
  )
}
