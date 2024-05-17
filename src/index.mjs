/* eslint-disable no-undef */
import { spawn } from "child_process";
import express from "express";
import process from "process";
import { inspect } from "util";

const app = express();

app.use((req, res) => {
  const packageName = req.path.slice(1);
  if (packageName === "") {
    res.status(400).json({ error: "No package name provided" });
    return;
  }
  if (!req.query.from || !req.query.to) {
    res.status(400).json({
      error: "No versions provided",
      packageName,
      from: req.query?.from,
      to: req.query?.to,
    });
    return;
  }
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
