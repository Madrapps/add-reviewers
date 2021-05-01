const core = require('@actions/core');
const github = require('@actions/github');

async function action() {
    try {
        const reviewers = core.getInput('reviewers').split(",");
        const reRequestWhenChangesRequested = (core.getInput('re-request-when-changes-requested') === 'true');
        const reRequestWhenApproved = (core.getInput('re-request-when-approved') === 'true');
        const debugMode = (core.getInput('debug-mode') === 'true');

        const event = github.context.eventName;
        if (event != 'pull_request') {
            throw `Only pull request is supported, ${github.context.eventName} not supported.`;
        }

        if (debugMode) core.info(`Input reviewers: ${reviewers}`);

        const context = github.context;
        const payload = context.payload;
        const prNumber = payload.pull_request.number;
        const user = payload.pull_request.user.login;

        if (debugMode) core.info(`prNumber: ${prNumber}`);
        if (debugMode) core.info(`user: ${user}`);

        const client = github.getOctokit(core.getInput("token"));

        const reviewsParam = {
            ...context.repo,
            pull_number: prNumber,
        };
        const reviewsResponse = await client.pulls.listReviews(reviewsParam);

        const reviews = new Map();
        reviewsResponse.data.forEach(review => {
            reviews.set(review.user.login, review.state);
        });

        if (debugMode) {
            core.info(`Latest Reviews`);
            reviews.forEach((value, key) => {
                core.info(`${key} = ${value}`);
            });
        }

        // Remove the current user who created the PR
        const userRemovedReviewers = reviewers.filter(reviewer => reviewer != user);
        const finalReviewers = [];
        userRemovedReviewers.forEach(reviewer => {
            const rev = reviews.get(reviewer);
            if (rev == null) {
                if (debugMode) core.info(`New Reviewer: Request review from ${reviewer}`);
                finalReviewers.push(reviewer);
            } else {
                if (rev == 'CHANGES_REQUESTED') {
                    if (reRequestWhenChangesRequested) {
                        if (debugMode) core.info(`Changes Requested: Request re-review from ${reviewer}`);
                        finalReviewers.push(reviewer);
                    } else {
                        if (debugMode) core.info(`Changes Requested: Not requesting re-review from ${reviewer}`);
                    }
                } else if (rev == 'APPROVED') {
                    if (reRequestWhenApproved) {
                        if (debugMode) core.info(`Approved: Request re-review from ${reviewer}`);
                        finalReviewers.push(reviewer);
                    } else {
                        if (debugMode) core.info(`Approved: Not requesting re-review from ${reviewer}`);
                    }
                } else {
                    finalReviewers.push(reviewer);
                }
            }
        });
        if (debugMode) core.info(`finalReviewers: ${finalReviewers}`);
        const params = {
            ...context.repo,
            pull_number: prNumber,
            reviewers: finalReviewers,
        };
        await client.pulls.requestReviewers(params);
    } catch (error) {
        core.setFailed(error);
    }
}

module.exports = {
    action
}