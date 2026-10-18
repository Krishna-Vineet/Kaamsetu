/**
 * OTP delivery-mode helpers.
 *
 * Production: OTPs are delivered out-of-band (Resend email, Twilio SMS).
 *
 * Demo / self-host fallback: when a provider is not configured (or you set
 * OTP_FALLBACK_TO_RESPONSE=true), the API includes the OTP in the JSON
 * response (`devOtp`) so the frontend can display it to the user with a
 * "services are off, this is your code" notice.
 *
 * ⚠️  In fallback mode anyone can verify/reset any account without owning the
 * inbox/SIM. Fine for demos and showcases — switch to real delivery before
 * real users depend on it.
 */

export const isEmailConfigured = () =>
  !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

export const isSmsConfigured = () =>
  !!(process.env.TWILIO_ACCOUNT_SID &&
       process.env.TWILIO_AUTH_TOKEN &&
       process.env.TWILIO_PHONE_NUMBER);

/** Force demo mode even when providers are configured. */
export const isFallbackForced = () =>
  process.env.OTP_FALLBACK_TO_RESPONSE === 'true';

export const emailFallbackActive = () => isFallbackForced() || !isEmailConfigured();
export const smsFallbackActive = () => isFallbackForced() || !isSmsConfigured();

/**
 * Response fragment for OTP-issuing endpoints.
 * channel = 'email' | 'sms'  -> normal out-of-band delivery
 * channel = 'response'       -> fallback; caller MUST pass the OTP
 */
export const otpDeliveryInfo = (channel, code) => {
  if (channel === 'response') {
    return {
      delivery: 'response',
      devOtp: code
    };
  }
  return { delivery: channel };
};

/** Human-readable message shown to users in fallback mode. */
export const FALLBACK_MESSAGE =
  'Messaging services are turned off on this server — your verification code is shown on screen instead.';
