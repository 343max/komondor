#!/usr/bin/env node

import { run, subcommands } from 'cmd-ts';
import { patchXcodeproj } from '../lib/patchXcodeproj';
import { patchInfoPlistCommand } from '../lib/patchInfoPlistCommand';
import { patchPodsCommand } from '../lib/patchPodsCommand';
import { startMetroCommand } from '../lib/startMetroCommand';

const commands = subcommands({
  name: 'komondor',
  cmds: {
    'patch-info-plist': patchInfoPlistCommand,
    'patch-pods': patchPodsCommand,
    'patch-xcodeproj': patchXcodeproj,
    'start': startMetroCommand,
  },
});

run(commands, process.argv.slice(2));
