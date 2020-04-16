import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { BrandingService } from '../../../shared/services/branding/branding.service';

@Component({
  selector: 'app-branding',
  templateUrl: './branding.component.html',
  styleUrls: ['./branding.component.css']
})
export class BrandingComponent implements OnInit {

  public primaryColor: string = '#000000';
  public secondaryColor: string = '#000000';

  public primaryFont: string = 'Sans Serif';

  public fonts: string[] = ['Sans Serif', 'Roboto', 'Lato', 'Oswald', 'Raleway', 'Noto Sans'];
  @ViewChild('instance', {static: true}) instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();

  constructor( public brandingService: BrandingService ) { }

  ngOnInit(): void {
    this.brandingService.getBranding().then((branding) => {
      this.primaryColor = branding['primary-color'];
      this.secondaryColor = branding['secondary-color'];
      this.primaryFont = branding['primary-font'];
    });
    this.instance.selectItem.subscribe((generator, error, complete) => {
      this.primaryFont = generator.item;
      this.brandingService.setObject('primary-font', generator.item);
      this.brandingService.updateBranding({
        'primary-font' : generator.item
      }).then(() => {

      }).catch((error) => {

      });
    });
  }

  updateColor($event, color) {
    if(color == 'primary') {
      this.primaryColor = $event.color.hex;
      this.brandingService.setObject('primary-color', $event.color.hex); 
    } else if(color == 'secondary') {
      this.secondaryColor = $event.color.hex;
      this.brandingService.setObject('secondary-color', $event.color.hex);
    }
    this.brandingService.updateBranding({
      'primary-color' : this.primaryColor,
      'secondary-color' : this.secondaryColor
    }).then(() => {

    }).catch((error) => {

    });
  }

  search = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? this.fonts
        : this.fonts.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
    );
  }

}
