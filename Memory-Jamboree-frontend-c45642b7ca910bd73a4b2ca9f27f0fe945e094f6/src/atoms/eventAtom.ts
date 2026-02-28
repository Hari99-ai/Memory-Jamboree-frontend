import { atomFamily } from 'recoil';

export const eventStatusState = atomFamily<string, string>({
  key: 'eventStatusState',
  default: '',
});
