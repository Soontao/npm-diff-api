/* eslint-disable no-undef */
import { spawn } from "child_process";
import express from "express";
import process from "process";
import { inspect } from "util";

const app = express();

app.use((req, res) => {
  const packageName = req.path.slice(1);
  // spawn a child process to run the npm diff command, output is collected to string variable
  const cmd = spawn(
    "npm",
    [
      "diff",
      "--diff",
      `${packageName}@${req.query.from}`,
      "--diff",
      `${packageName}@${req.query.to}`,
    ],
    { shell: true },
  );
  const output = [];
  const error = [];
  cmd.on("exit", (code) => {
    if (code === 0) {
      res.json({
        diff: output.join(""),
      });
    } else {
      res.status(500).json({ error: inspect(error) });
    }
  });
  cmd.stdout.on("data", (data) => {
    output.push(data.toString());
  });
  cmd.stderr.on("data", (data) => {
    error.push(data.toString());
  });
});

app.listen(parseInt(process.env.PORT ?? 3000), () => {
  console.log("Server started", process.env.PORT ?? 3000);
});
