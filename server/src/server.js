import "dotenv/config";

import app from "./app.js";

import {
  verifyEmailConnection,
} from "./config/email.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await verifyEmailConnection();

    app.listen(PORT, () => {
      console.log(
        `PADMAVATI JEWELLERS SERVER RUNNING ON PORT ${PORT}`
      );

      console.log(
        `http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("EMAIL SMTP CONNECTION FAILED");
    console.error(error);
    process.exit(1);
  }
}

startServer();