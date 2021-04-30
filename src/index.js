const core = require('@actions/core');
const github = require('@actions/github');

try {
  const reviewers = core.getInput('reviewers').split(",");
  const debugMode = (core.getInput('debug-mode') === 'true');

  const event = github.context.eventName;
  core.info(`Event is ${event}`);

  if (event != 'pull_request') {
    throw `Only pull request is supported, ${github.context.eventName} not supported.`;
  }

  if (debugMode) core.info(`reviewers: ${reviewers}`);

  const context = github.context;
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);

  const prNumber = payload.pull_request.number;
  const user = payload.user.login;

  if (debugMode) core.info(`prNumber: ${prNumber}`);
  if (debugMode) core.info(`user: ${user}`);

  const client = github.getOctokit(core.getInput("token"));

  const params = {
    ...context.repo,
    pull_number: prNumber,
    reviewers: reviewers,
  };

  client.pulls.requestReviewers(params);

} catch (error) {
  core.setFailed(error.message);
}