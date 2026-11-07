export function passwordResetOTPEmail({ name, otp }) {
  return {
    subject: "Padmavati Jewellers - Password Reset OTP",

    text: `
Hello ${name},

Your Padmavati Jewellers password reset OTP is:

${otp}

This OTP is valid for 10 minutes.

If you did not request a password reset, please ignore this email.

Regards,
Padmavati Jewellers
`,

    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset OTP</title>
</head>

<body style="margin:0;padding:0;background:#f6f3ee;font-family:Arial,Helvetica,sans-serif">

  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e0d8">

    <div style="padding:28px;text-align:center;background:#111111;color:#ffffff">
      <h1 style="margin:0;font-size:24px;letter-spacing:1px">
        PADMAVATI JEWELLERS
      </h1>
    </div>

    <div style="padding:36px 30px">

      <h2 style="margin-top:0;color:#222222">
        Password Reset Request
      </h2>

      <p style="color:#555555;line-height:1.6">
        Hello ${name},
      </p>

      <p style="color:#555555;line-height:1.6">
        Use the following OTP to reset your Padmavati Jewellers admin password:
      </p>

      <div style="margin:30px 0;padding:20px;text-align:center;background:#f6f3ee;border-radius:10px">

        <span style="font-size:34px;font-weight:bold;letter-spacing:8px;color:#111111">
          ${otp}
        </span>

      </div>

      <p style="color:#777777;line-height:1.6">
        This OTP is valid for <strong>10 minutes</strong>.
      </p>

      <p style="color:#777777;line-height:1.6">
        If you did not request a password reset, you can safely ignore this email.
      </p>

    </div>

    <div style="padding:20px;text-align:center;background:#f6f3ee;color:#888888;font-size:12px">
      Padmavati Jewellers
    </div>

  </div>

</body>
</html>
`
  }
}