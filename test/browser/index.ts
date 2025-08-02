
import { runMemoryLevelTests } from '../backends/memorylevel.js';
import { runBrowserLevelTests } from '../backends/browserlevel.js';
import { runOtherTests } from '../others/others.js';
import { runTypingsTests } from '../others/typings.js';

runOtherTests();
runTypingsTests(false);
runMemoryLevelTests();
runBrowserLevelTests();
