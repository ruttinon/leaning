import { metricsStore } from '../src/common/metrics/metrics.store'

describe('metricsStore', () => {
  it('records request and error metrics', () => {
    metricsStore.recordHttp('GET', '/teacher/courses/123', 200, 40)
    metricsStore.recordHttp('POST', '/teacher/courses/abc', 500, 90)

    const snapshot = metricsStore.snapshot()
    expect(snapshot.totalRequests).toBeGreaterThanOrEqual(2)
    expect(snapshot.totalErrors).toBeGreaterThanOrEqual(1)
    expect(snapshot.routes.some((route) => route.route.includes('/teacher/courses/:id'))).toBe(true)
  })
})
