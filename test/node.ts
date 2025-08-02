
import { runMemoryLevelTests } from './backends/memorylevel.js';
import { runClassicLevelTests } from './backends/classiclevel.js';
import { runOtherTests } from './others/others.js';
import { runTypingsTests } from './others/typings.js';

runOtherTests();
runTypingsTests(true);
runMemoryLevelTests();
runClassicLevelTests();
