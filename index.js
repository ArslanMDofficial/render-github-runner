const express = require('express');
const { exec } = require('child_process');
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <h2>Run Your GitHub Repo</h2>
    <form method="POST" action="/run">
      <input type="text" name="repo_url" placeholder="GitHub Repo URL" style="width: 300px;" required />
      <button type="submit">Run</button>
    </form>
  `);
});

app.post('/run', async (req, res) => {
  const repoUrl = req.body.repo_url;
  const folderName = `repo-${Date.now()}`;
  const repoPath = path.join(__dirname, folderName);

  try {
    await simpleGit().clone(repoUrl, repoPath);
    exec(`cd ${repoPath} && npm install`, (errInstall, stdoutInstall, stderrInstall) => {
      if (errInstall) {
        return res.send(`❌ Install Error: <pre>${stderrInstall}</pre>`);
      }

      exec(`node ${path.join(repoPath, 'index.js')}`, (errRun, stdoutRun, stderrRun) => {
        if (errRun) {
          return res.send(`❌ Run Error: <pre>${stderrRun}</pre>`);
        }

        res.send(`✅ Repo Cloned and index.js Executed:\n<pre>${stdoutRun}</pre>`);
      });
    });
  } catch (err) {
    res.send(`❌ General Error: ${err.message}`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
