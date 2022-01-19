import npa from 'npm-package-arg';

export type RelativeResult =
  npa.FileResult |
  npa.HostedGitResult |
  npa.URLResult |
  npa.AliasResult |
  npa.RegistryResult;
