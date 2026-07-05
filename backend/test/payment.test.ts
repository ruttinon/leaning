import { calculatePaymentAmount } from '../src/common/utils/payment';

describe('payment amount calculation', () => {
  it('computes discounted amount correctly', () => {
    expect(calculatePaymentAmount(1000, 10).amountInSmallestUnit).toBe(90000);
  });

  it('handles a zero price safely', () => {
    expect(calculatePaymentAmount(0, 20).amountInSmallestUnit).toBe(0);
  });
});
