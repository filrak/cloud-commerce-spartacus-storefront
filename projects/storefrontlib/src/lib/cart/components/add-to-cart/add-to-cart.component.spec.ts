import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { MatDialog } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Store, StoreModule, combineReducers } from '@ngrx/store';
import { of } from 'rxjs';
import { CartService } from '../../../cart/services/cart.service';
import { CartDataService } from '../../../cart/services/cart-data.service';
import * as fromCart from '../../../cart/store';
import * as fromRoot from '../../../routing/store';
import * as fromUser from '../../../user/store';
import * as fromAuth from './../../../auth/store';
import { AddToCartComponent } from './add-to-cart.component';
import { AddToCartModule } from './add-to-cart.module';

const productCode = '1234';
const mockCartEntry: any = [];
class MockCartService {
  addCartEntry(_productCode: string, _quantity: number): void {
    mockCartEntry.push({
      '1234': { entryNumber: 0, product: { code: productCode } }
    });
  }
}

describe('AddToCartComponent', () => {
  let store: Store<fromCart.CartState>;
  let addToCartComponent: AddToCartComponent;
  let fixture: ComponentFixture<AddToCartComponent>;
  let service;
  let dialog;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AddToCartModule,
        BrowserAnimationsModule,
        RouterTestingModule,
        StoreModule.forRoot({
          ...fromRoot.getReducers(),
          cart: combineReducers(fromCart.getReducers()),
          user: combineReducers(fromUser.getReducers()),
          auth: combineReducers(fromAuth.getReducers())
        })
      ],
      providers: [
        CartDataService,
        { provide: CartService, useClass: MockCartService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddToCartComponent);
    addToCartComponent = fixture.componentInstance;
    store = TestBed.get(Store);
    service = TestBed.get(CartService);
    addToCartComponent.productCode = productCode;
    dialog = fixture.debugElement.injector.get<MatDialog>(MatDialog);
    spyOn(service, 'addCartEntry').and.callThrough();
    spyOn(store, 'select').and.returnValue(of(mockCartEntry));
    spyOn(dialog, 'open').and.callThrough();

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(addToCartComponent).toBeTruthy();
  });

  it('should call ngOnChanges()', () => {
    addToCartComponent.ngOnInit();
    addToCartComponent.cartEntry$.subscribe(entry =>
      expect(entry).toEqual(mockCartEntry)
    );
  });

  it('should call addToCart()', () => {
    addToCartComponent.addToCart();
    addToCartComponent.cartEntry$.subscribe();

    dialog.closeAll();
    expect(dialog.open).toHaveBeenCalled();
    expect(service.addCartEntry).toHaveBeenCalledWith(productCode, 1);
  });

  // UI test will be added after replacing Material
});
