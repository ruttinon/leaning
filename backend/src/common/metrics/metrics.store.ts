type MetricBucket = {
  count: number
  errorCount: number
  totalDurationMs: number
  maxDurationMs: number
}

class MetricsStore {
  private readonly startedAt = Date.now()
  private readonly byRoute = new Map<string, MetricBucket>()
  private totalRequests = 0
  private totalErrors = 0

  recordHttp(method: string, path: string, statusCode: number, durationMs: number) {
    const route = `${method.toUpperCase()} ${this.normalizePath(path)}`
    const bucket = this.byRoute.get(route) || {
      count: 0,
      errorCount: 0,
      totalDurationMs: 0,
      maxDurationMs: 0,
    }

    bucket.count += 1
    bucket.totalDurationMs += durationMs
    bucket.maxDurationMs = Math.max(bucket.maxDurationMs, durationMs)
    if (statusCode >= 400) {
      bucket.errorCount += 1
      this.totalErrors += 1
    }

    this.byRoute.set(route, bucket)
    this.totalRequests += 1
  }

  snapshot() {
    const routes = Array.from(this.byRoute.entries())
      .map(([route, bucket]) => ({
        route,
        count: bucket.count,
        errorCount: bucket.errorCount,
        avgDurationMs: bucket.count ? Math.round(bucket.totalDurationMs / bucket.count) : 0,
        maxDurationMs: bucket.maxDurationMs,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50)

    return {
      uptimeSec: Math.round((Date.now() - this.startedAt) / 1000),
      totalRequests: this.totalRequests,
      totalErrors: this.totalErrors,
      errorRate: this.totalRequests
        ? Number((this.totalErrors / this.totalRequests).toFixed(4))
        : 0,
      routes,
    }
  }

  private normalizePath(path: string) {
    const noQuery = path.split('?')[0] || '/'
    return noQuery
      .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi, '/:id')
      .replace(/\/[0-9a-f]{24,}/gi, '/:id')
      .replace(/\/\d+/g, '/:id')
  }
}

export const metricsStore = new MetricsStore()
