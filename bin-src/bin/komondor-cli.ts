#!/usr/bin/env node

import { run, subcommands } from 'cmd-ts';
import { patchXcodeproj } from '../lib/patchXcodeproj';
import { patchInfoPlistCommand } from 'bin-src/lib/patchInfoPlistCommand';
import { patchPodsCommand } from 'bin-src/lib/patchPodsCommand';

const commands = subcommands({
  name: 'komondor',
  cmds: {
    'patch-info-plist': patchInfoPlistCommand,
    'patch-pods': patchPodsCommand,
    'patch-xcodeproj': patchXcodeproj,
  },
});

run(commands, process.argv.slice(2));
