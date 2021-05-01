const action = require('../src/action');
const core = require('@actions/core');
const github = require('@actions/github');

jest.mock("@actions/core");
jest.mock("@actions/github");

const listReviewsResponse = {
    "data": [
        {
            "user": {
                "login": "john",
            },
            "state": "CHANGES_REQUESTED",
        },
        {
            "user": {
                "login": "john",
            },
            "state": "APPROVED",
        },
        {
            "user": {
                "login": "kramer",
            },
            "state": "CHANGES_REQUESTED",
        },
        {
            "user": {
                "login": "george",
            },
            "state": "COMMENTED",
        }
    ]
};

const inputReviewers = "john,kramer,seinfeld,elaine,george";

beforeAll(() => {
    github.context = {
        "eventName": "pull_request",
        "payload": {
            "pull_request": {
                "number": 12,
                "user": {
                    "login": "seinfeld",
                }
            },
        },
        "repo": "jacoco-playground",
        "owner": "madrapps"
    };
});

describe("Pull Request event", function () {

    describe("Don't Re-Request for Review", function () {
        it("Assign proper reviewers", async () => {
            core.getInput = jest.fn(c => {
                switch (c) {
                    case 'reviewers': return inputReviewers;
                }
            });
            const addReviewers = jest.fn();
            mockAddReviewers(addReviewers);

            await action.action();
            expect(addReviewers.mock.calls[0][0].reviewers).toEqual(['elaine', 'george']);
        });

        it("Enabling debug-mode shouldn't crash", async () => {
            core.getInput = jest.fn(c => {
                switch (c) {
                    case 'reviewers': return inputReviewers;
                    case `debug-mode`: return "true";
                }
            });
            const addReviewers = jest.fn();
            mockAddReviewers(addReviewers);

            await action.action();
        });
    });

    describe("Re-Request when changes requested", function () {
        it("Assign proper reviewers", async () => {
            core.getInput = jest.fn(c => {
                switch (c) {
                    case 'reviewers': return inputReviewers;
                    case 're-request-when-changes-requested': return "true";
                    case `re-request-when-approved`: return "false";
                }
            });
            const addReviewers = jest.fn();
            mockAddReviewers(addReviewers);

            await action.action();
            expect(addReviewers.mock.calls[0][0].reviewers).toEqual(['kramer', 'elaine', 'george']);
        });

        it("Enabling debug-mode shouldn't crash", async () => {
            core.getInput = jest.fn(c => {
                switch (c) {
                    case 'reviewers': return inputReviewers;
                    case 're-request-when-changes-requested': return "true";
                    case `re-request-when-approved`: return "false";
                    case `debug-mode`: return "true";
                }
            });
            const addReviewers = jest.fn();
            mockAddReviewers(addReviewers);

            await action.action();
        });
    });

    describe("Re-Request when changes Approved", function () {
        it("Assign proper reviewers", async () => {
            core.getInput = jest.fn(c => {
                switch (c) {
                    case 'reviewers': return inputReviewers;
                    case 're-request-when-changes-requested': return "false";
                    case `re-request-when-approved`: return "true";
                }
            });
            const addReviewers = jest.fn();
            mockAddReviewers(addReviewers);

            await action.action();
            expect(addReviewers.mock.calls[0][0].reviewers).toEqual(['john', 'elaine', 'george']);
        });

        it("Enabling debug-mode shouldn't crash", async () => {
            core.getInput = jest.fn(c => {
                switch (c) {
                    case 'reviewers': return inputReviewers;
                    case 're-request-when-changes-requested': return "false";
                    case `re-request-when-approved`: return "true";
                    case `debug-mode`: return "true";
                }
            });
            const addReviewers = jest.fn();
            mockAddReviewers(addReviewers);

            await action.action();
        });
    });

    describe("Re-Request when both approved or changes requested", function () {
        it("Assign proper reviewers", async () => {
            core.getInput = jest.fn(c => {
                switch (c) {
                    case 'reviewers': return inputReviewers;
                    case 're-request-when-changes-requested': return "true";
                    case `re-request-when-approved`: return "true";
                }
            });
            const addReviewers = jest.fn();
            mockAddReviewers(addReviewers);

            await action.action();
            expect(addReviewers.mock.calls[0][0].reviewers).toEqual(['john', 'kramer', 'elaine', 'george']);
        });

        it("Enabling debug-mode shouldn't crash", async () => {
            core.getInput = jest.fn(c => {
                switch (c) {
                    case 'reviewers': return inputReviewers;
                    case 're-request-when-changes-requested': return "true";
                    case `re-request-when-approved`: return "true";
                    case `debug-mode`: return "true";
                }
            });
            const addReviewers = jest.fn();
            mockAddReviewers(addReviewers);

            await action.action();
        });
    });


});

describe("Other than pull_request event", function () {
    const context = {
        "eventName": "push"
    }
    it("Fail by throwing appropriate error", async () => {
        github.context = context
        core.setFailed = jest.fn(c => {
            expect(c).toEqual("Only pull request is supported, push not supported.");
        });

        await action.action();
    })
});

function mockAddReviewers(addReviewers) {
    github.getOctokit = jest.fn(() => {
        return {
            pulls: {
                listReviews: jest.fn(() => {
                    return listReviewsResponse;
                }),
                requestReviewers: addReviewers
            },
        };
    });
}
