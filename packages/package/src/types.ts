/// <reference types="@pansy/types/dist/package-json" />

import npa from 'npm-package-arg';

import type { $Keys, PackageJson } from '@pansy/types';

export type RelativeResult =
  | npa.FileResult
  | npa.HostedGitResult
  | npa.URLResult
  | npa.AliasResult
  | npa.RegistryResult;

export type PackageKeys = $Keys<PackageJson>;
