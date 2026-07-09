export function calculatePaymentAmount(price: number, discountPercent: number) {
  const normalizedPrice = Number(price) || 0;
  const normalizedDiscount = Number(discountPercent) || 0;
  const discountedAmount = Math.max(0, normalizedPrice * (1 - normalizedDiscount / 100));
  const amountInSmallestUnit = Math.round(discountedAmount * 100);

  return {
    amount: discountedAmount,
    amountInSmallestUnit,
  };
}

export function isPaidCourse(price: number) {
  return (Number(price) || 0) > 0;
}

export function canDirectlyEnrollInCourse(price: number, hasCompletedPayment: boolean) {
  return !isPaidCourse(price) || hasCompletedPayment;
}

export function canUseClientPaymentConfirmation(stripeConfigured: boolean) {
  return !stripeConfigured;
}
