# Add Reviewers

Github action that adds Reviewers to the Pull Request

## Usage

### Pre-requisites
Create a workflow `.yml` file in your repositories `.github/workflows` directory. An [example workflow](#example-workflow) is available below. For more information, reference the GitHub Help Documentation for [Creating a workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

### Inputs

* `token` - [**required**] Github personal token to add commits to Pull Request
* `reviewers` - [**required**] Comma separated list of reviewers [eg. john,kramer,seinfeld]
* `re-request-when-changes-requested` - [*optional*] If true, when a reviewer has requested for changes, pushing a new commit to this PR will Re-request a review from them
* `re-request-when-approved` - [*optional*] If true, when a reviewer has approved, pushing a new commit to this PR will Re-request a review from them


### Example Workflow

```yaml
name: Add Reviewers

on:
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - name: Add Reviewers
      uses: madrapps/add-reviewers@v1
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
        reviewers: john,kramer,seinfeld
        re-request-when-approved: true
        re-request-when-changes-requested: true
```

### Example Project
For a working project refer to [jacoco-playgound](https://github.com/thsaravana/jacoco-playground) project. Check out the PR's in
the project to get an idea on how the report is shown on a pull request comment.

## License
The scripts and documentation in this project are released under the [MIT License](LICENSE)
