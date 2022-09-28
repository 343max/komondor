export const getCanonicalRepoName = (repoUrl: string): string => {
  let res;
  if ((res = repoUrl.match(/^[^@]+@([^:]+):([^\/]+\/[^.]+)\.git$/))) {
    return `${res[1]}:${res[2]}`;
  } else if (
    (res = repoUrl.match(/https?:\/\/([^\/]+)\/([^\/]+\/[^.]+)\.git/))
  ) {
    return `${res[1]}:${res[2]}`;
  } else {
    return repoUrl;
  }
};
