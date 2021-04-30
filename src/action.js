const core = require('@actions/core');
const github = require('@actions/github');

async function action() {
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
        const payload1 = JSON.stringify(github.context.payload, undefined, 2)
        console.log(`The event payload: ${payload1}`);

        const payload = context.payload;
        const prNumber = payload.pull_request.number;
        const user = payload.pull_request.user.login;

        if (debugMode) core.info(`prNumber: ${prNumber}`);
        if (debugMode) core.info(`user: ${user}`);

        const client = github.getOctokit(core.getInput("token"));

        // const params1 = {
        //     ...context.repo,
        //     pull_number: prNumber,
        // };
        // const response = await client.pulls.listRequestedReviewers(params1);
        core.info(`requested Reviewers: ${response}`);
        const response1 = JSON.stringify(response, undefined, 2)
        console.log(`The event payload: ${response1}`);

        // Remove the current user who created the PR
        const finalReviewers = reviewers.filter(reviewer => reviewer != user);
        if (debugMode) core.info(`finalReviewers: ${finalReviewers}`);
        const params = {
            ...context.repo,
            pull_number: prNumber,
            reviewers: finalReviewers,
        };

        await client.pulls.requestReviewers(params);

    } catch (error) {
        core.setFailed(error.message);
    }
}

module.exports = {
    action
}