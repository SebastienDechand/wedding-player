import { Component, inject } from '@angular/core';
import { EasterEggsService } from '../../services/easter-eggs.service';
import { ELF_PARTICLES } from '../../constants/easter-eggs.constants';

@Component({
  selector: 'app-easter-eggs',
  standalone: true,
  templateUrl: './easter-eggs.component.html',
  styleUrls: ['./easter-eggs.component.scss'],
})
export class EasterEggsComponent {
  protected readonly eggs = inject(EasterEggsService);
  protected readonly elfParticles = ELF_PARTICLES;
}
