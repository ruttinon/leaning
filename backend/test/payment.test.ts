import {
  calculatePaymentAmount,
  canDirectlyEnrollInCourse,
  canUseClientPaymentConfirmation,
} from '../src/common/utils/payment'

describe('payment helpers', () => {
  it('computes discounted amount correctly', () => {
    expect(calculatePaymentAmount(1000, 10).amountInSmallestUnit).toBe(90000)
  })

  it('handles a zero price safely', () => {
    expect(calculatePaymentAmount(0, 20).amountInSmallestUnit).toBe(0)
  })

  it('blocks direct enrollment for paid courses without completed payment', () => {
    expect(canDirectlyEnrollInCourse(999, false)).toBe(false)
  })

  it('allows direct enrollment for free courses', () => {
    expect(canDirectlyEnrollInCourse(0, false)).toBe(true)
  })

  it('allows enrollment for paid courses after payment is completed', () => {
    expect(canDirectlyEnrollInCourse(999, true)).toBe(true)
  })

  it('only allows client-side payment confirmation when Stripe is not configured', () => {
    expect(canUseClientPaymentConfirmation(false)).toBe(true)
    expect(canUseClientPaymentConfirmation(true)).toBe(false)
  })
})
