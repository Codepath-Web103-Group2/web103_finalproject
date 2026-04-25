import app, { prepareApp } from "./app.js";

const isProduction = process.env.NODE_ENV === "production";
const port = isProduction ? Number(process.env.PORT || 3000) : 3001;

await prepareApp();

app.listen(port, () => {
  console.log(`StudyBuddy server listening on port ${port}`);
});