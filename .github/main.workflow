workflow "Update Dependent Repos" {
  resolves = ["Update dependent repo db"]
  on = "schedule(0 9 * * 1)"
}

action "Update dependent repo db" {
  uses = "./"
  secrets = ["GITHUB_TOKEN", "SNITCH_URL"]
}