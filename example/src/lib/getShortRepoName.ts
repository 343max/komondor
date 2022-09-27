export const getShortRepoName = (repoUrl: string): string => {
  let res;
  if ((res = repoUrl.match(/^git@github.com:([^\/]+\/[^.]+)\.git$/))) {
    return `gh ${res[1]}`;
  } else if (
    (res = repoUrl.match(/https:\/\/github.com\/([^\/]+\/[^.]+)\.git/))
  ) {
    return `gh ${res[1]}`;
  } else {
    return repoUrl;
  }
};
