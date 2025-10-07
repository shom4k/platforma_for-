const crypto = require('node:crypto');

function getPaymentsConfig(env = process.env) {
  return {
    provider: env.PAYMENTS_PROVIDER || 'mock',
    publicKey: env.PAYMENTS_PUBLIC_KEY || 'pk_test_mocked',
    returnUrl: env.PAYMENTS_RETURN_URL || 'http://localhost:3000/thanks',
    currency: env.PAYMENTS_DEFAULT_CURRENCY || 'RUB',
    locale: env.PAYMENTS_LOCALE || 'ru-RU'
  };
}

function createMockSession({ amount, currency, description }, env = process.env) {
  const config = getPaymentsConfig(env);

  if (!amount || Number.isNaN(Number(amount))) {
    throw new Error('Некорректная сумма платежа');
  }

  return {
    id: `sess_${crypto.randomUUID()}`,
    provider: config.provider,
    amount: Number(amount),
    currency: currency || config.currency,
    description: description || 'Покупка тарифа',
    confirmationUrl: `${config.returnUrl}?session_id=sess_${crypto.randomUUID()}`,
    createdAt: new Date().toISOString()
  };
}

module.exports = {
  getPaymentsConfig,
  createMockSession
};
