import type { ElfParticle } from '../models/easter-egg.model';

export const ELF_PARTICLES: ElfParticle[] = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: 22 + i * 1.1,
  delay: i * 0.18,
}));
