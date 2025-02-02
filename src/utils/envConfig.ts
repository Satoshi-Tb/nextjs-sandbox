export type EnvConfig = {
  apiUrl: string;
};

const envConfig: EnvConfig = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
};

export default envConfig;
