export function validateEnv(): void {
  const requiredEnv = [
    "MONGO_USER",
    "MONGO_PASS",
    "MONGO_CLUSTER",
    "JWT_SECRET",
    "JWT_EXPIRY_TIME",
    "OPENAI_API_KEY",
    "PORT",
  ];

  if (process.env.NODE_ENV === "production") {
    requiredEnv.push("MONGO_TLS_CERT");
  }

  const missingEnv = requiredEnv.filter((key) => !process.env[key]);

  if (missingEnv.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnv.join(", ")}`
    );
  }

  if (
    process.env.NODE_ENV === "production" &&
    process.env.MONGO_PASS &&
    process.env.MONGO_PASS.length < 12
  ) {
    throw new Error(
      "MongoDB password must be at least 12 characters in production"
    );
  }
}
