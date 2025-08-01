
import type { Readable } from 'stream';
import type { StreamLike } from '../dist/types/index.js';

import { runMemoryLevelTests } from './backends/memorylevel.js';
import { runClassicLevelTests } from './backends/classiclevel.js';
import { runOtherTests } from './others/others.js';
import { runTypingsTests } from './others/typings.js';

runOtherTests();
runTypingsTests();
runMemoryLevelTests();
runClassicLevelTests();

describe('Typings (Node.js)', () => {
    
  describe('StreamLike', () => {

    it('should be extended by Node\'s native Readable interface', () => {
      const t: StreamLike<any> = ({} as Readable);
    });
      
  });
    
});


