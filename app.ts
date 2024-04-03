const express = require("express");

const app = express();
const PORT = 8000;

app.get("/", (req: any, res: { send: (arg0: string) => void }) => {
  res.send("Hello World");
});

app.get("/about", (req: any, res: { send: (arg0: string) => void }) => {
  res.send("About route 🎉 ");
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
