const core = require('@actions/core');
const github = require('@actions/github');

try {
  const reviewers = core.getInput('reviewers').split(",");
  const debugMode = parseBooleans(core.getInput('debug-mode'));

  const event = github.context.eventName;
  core.info(`Event is ${event}`);

  if (event != 'pull_request') {
    throw `Only pull request is supported, ${github.context.eventName} not supported.`;
  }

  if (debugMode) core.info(`reviewers: ${reviewers}`);

  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);

  const client = github.getOctokit(core.getInput("token"));
} catch (error) {
  core.setFailed(error.message);
}