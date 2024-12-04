import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { gsap } from 'gsap';
import EasePack from 'gsap';
import { AuthenticationService } from '../../service/authentication/authentication.service';
import { Router } from '@angular/router';
import { User } from '../../model/user';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss'
})
export class AuthenticationComponent implements AfterViewInit {
  protected credentials: User = { email: '', password: '', username: '' };

  constructor(private authenticationService: AuthenticationService, private router: Router) { }

  onSubmit() {
    this.authenticationService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigateByUrl('/home');
      },
      error: (err) => {
        console.error('Login failed', err);
      }
    });
  }

  ngAfterViewInit() {
    gsap.registerPlugin(EasePack);

    const sparkles = gsap.utils.toArray('#sparkles > *');
    
    gsap.to(sparkles, { 
      transformOrigin: '50% 50%', opacity: 0.5, scale: 0.9, ease: '',
      stagger: {
        each: 1.6,
        repeat: -1,
        yoyo: true,
      }
    });

    const main = gsap.timeline();
    main.add(intro());
    main.add(surfing());
  }
}

function intro() {
  gsap.set('#pika',{ opacity: 1 });
  gsap.set('#surf',{ opacity: 1 });
  
  const tl = gsap.timeline({ defaults: { transformOrigin: '50% 100%' } });
  
  tl.from('#surf', { duration: 2.6, delay: 0.2, x: -100, y: -980, opacity: 0, rotate: -45, repeat: 0, ease: 'elastic.out(1,0.65)' })
    .to('#frontwaves', { duration: 0.6, y: 30, repeat: 1, yoyo: true, ease: 'ease.in' }, "< 0.5")
    .from('#pika', { duration: 0.8, x:-80, y: -1000, opacity: 0, }, "2")
    .from('#shadow', {duration: 0.8, scale: 0, opacity: 0, }, "<")
    .to('#surf', { duration: 0.36, y: 50, repeat: 1, yoyo: true }, ">- 0.5")
    .to('#pika', { duration: 0.36, y: 50, repeat: 1, yoyo: true }, "<")
    .to('#pika', { duration: 0.36, scaleY: 0.9, repeat: 1, yoyo: true }, "<")
  
    return tl;
}

function surfing() {
  gsap.set('#pika',{ opacity: 1 });
  gsap.set('#surf',{ opacity: 1 });
  
  const tl = gsap.timeline({ defaults: { duration: 1.4, repeat: -1, yoyo: true, ease: '' } });
  
  tl.to('#pika', { yPercent: -40 })
    .to('#right-ear', { rotation: -17, transformOrigin: '100% 100%' }, "<")
    .to('#left-ear', { rotation: -15, transformOrigin: '100% 110%' }, "<")
    .to('#tail', { rotation: -40, transformOrigin: '100% 90%' } , "<-0.1")
    .to('#left-arm', { rotation: -20, xPercent: 20, transformOrigin: '120% 100%' }, "<")
    .to('#right-arm', { rotation: 25, xPercent: -10, transformOrigin: '0% 100%' }, "<")
    .to('#left-feet', { rotation: -20, yPercent: 15, transformOrigin: '50% 50%' }, "<- 0.1")
    .to('#right-feet', { rotation: 30, xPercent: 10, transformOrigin: '50% 50%' }, "<- 0.1")
    .to('#face', { yPercent: -7 }, "<")
    .to('#surf', { yPercent: -30 }, "< 0.2")
    .to('#shadow', { scale: 0.6,  opacity: 0.2, xPercent: 5, transformOrigin: '50% 50%' }, "<")
    .to('#frontwaves', { y: +15 }, "<");
  
    return tl;
}
