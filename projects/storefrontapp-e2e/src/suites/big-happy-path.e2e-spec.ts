import { HomePage } from '../page-objects/home.po';
import { MultiStepCheckoutPage } from '../page-objects/checkout/multi-step-checkout.po';
import { LoginHelper } from '../page-objects/login/login.helper';
import { AddedToCartModal } from '../page-objects/cmslib/added-to-cart-modal.po';
import { E2EUtil } from '../e2e-util';
import { LoginForm } from '../page-objects/login/login-form.po';
import { ProductDetailsPage } from '../page-objects/product-details.po';
import { AddressForm } from '../page-objects/checkout/address-form.po';
import { PaymentForm } from '../page-objects/checkout/payment-form.po';
import { OrderHistoryPage } from '../page-objects/account/order-history.po';

xdescribe('Big Happy Path', () => {
  const home: HomePage = new HomePage();
  const checkoutPage = new MultiStepCheckoutPage();

  const USER_FULL_NAME = `${LoginHelper.DEFAULT_FIRST_NAME} ${
    LoginHelper.DEFAULT_LAST_NAME
  }`;
  const PRODUCT_NAME = 'Alpha 350';
  const PRODUCT_CODE = '1446509';

  beforeAll(async () => {
    // Go to Home
    await home.navigateTo();
    await home.waitForReady();
  });

  it('should register successfully', async () => {
    // Register a new user.
    await LoginHelper.registerNewUser();

    expect(await home.header.isLoggedIn()).toBeTruthy();
    expect(await home.header.loginComponent.getText()).toContain(
      USER_FULL_NAME
    );

    // Log out.
    await LoginHelper.logOutViaHeader();
  });

  it('should go to product page from category page', async () => {
    // Go to a category listing.
    const categoryDslr = await home.navigateViaSplashBanner();
    await categoryDslr.waitForReady();

    // Click a product to display its details.
    const productDetailsPage = await categoryDslr.openProduct(6);
    await productDetailsPage.waitForReady();
    expect(await productDetailsPage.productTitle.getText()).toEqual(
      PRODUCT_NAME
    );
    expect(await productDetailsPage.productCode.getText()).toContain(
      PRODUCT_CODE
    );
  });

  it('should add product to cart and go to checkout', async () => {
    const productDetailsPage = new ProductDetailsPage();
    await productDetailsPage.itemCounterUpButton.click();
    await productDetailsPage.addToCartButton.click();

    // Added-to-Cart modal opens. Close it.
    const atcModal = new AddedToCartModal();
    await atcModal.waitForReady();

    const item = atcModal.cartItem(0);
    await E2EUtil.wait4VisibleElement(item);
    expect(await item.getText()).toContain(PRODUCT_NAME);

    await atcModal.proceedToCheckoutButton.click();

    // Log in. Should see checkout page.
    const form = new LoginForm();
    await form.waitForReady();
    await form.fillInForm(LoginHelper.userEmail, LoginHelper.userPassword);
    await form.submitLogin();
  });

  it('should fill in address form', async () => {
    const addressForm = checkoutPage.addressForm;
    await addressForm.waitForReady();

    expect(await addressForm.header.getText()).toContain(
      'Step 1: Shipping Address'
    );
    expect(await checkoutPage.orderSummary.getText()).toContain(
      'Subtotal: $2,623.08'
    );

    await addressForm.fillIn();
    await addressForm.nextButton.click();
  });

  it('should choose delivery', async () => {
    const deliveryForm = checkoutPage.deliveryForm;
    await deliveryForm.waitForReady();
    expect(await deliveryForm.header.getText()).toContain(
      'Choose a shipping method'
    );
    expect(await deliveryForm.address.getText()).toContain(
      AddressForm.LAST_NAME
    );
    expect(await deliveryForm.address.getText()).toContain(AddressForm.CITY);

    await deliveryForm.setDeliveryMethod();
    await deliveryForm.nextButton.click();
  });

  it('should fill in payment form', async () => {
    const paymentForm = checkoutPage.paymentForm;
    await paymentForm.waitForReady();

    expect(await paymentForm.header.getText()).toContain('Choose a card type');
    expect(await checkoutPage.orderSummary.getText()).toContain(
      'Total: $2,635.07'
    );

    await paymentForm.fillIn();
    await paymentForm.nextButton.click();
  });

  it('should review and place order', async () => {
    // Review: Select T&C and submit.
    const reviewForm = checkoutPage.reviewForm;
    await reviewForm.waitForReady();

    expect(await reviewForm.header.getText()).toContain('Review and Submit');
    expect(await reviewForm.shippingAddress.getText()).toContain(
      AddressForm.LAST_NAME
    );
    expect(await reviewForm.shippingAddress.getText()).toContain(
      AddressForm.CITY
    );
    expect(await reviewForm.shippingMethod.getText()).toContain(
      'Standard Delivery'
    );
    expect(await reviewForm.paymentMethod.getText()).toContain(
      PaymentForm.CARD_TYPE
    );
    expect(await reviewForm.billingAddress.getText()).toContain(
      AddressForm.LAST_NAME
    );
    expect(await reviewForm.billingAddress.getText()).toContain(
      AddressForm.CITY
    );
    expect(await checkoutPage.orderSummary.getText()).toContain(
      'Total: $2,635.07'
    );

    const orderConfirmationPage = await reviewForm.placeOrder();
    await orderConfirmationPage.waitForReady();

    expect(await orderConfirmationPage.confirmationHeader.getText()).toContain(
      'Confirmation of Order'
    );
    expect(await orderConfirmationPage.confimationMessage.getText()).toContain(
      'Thank you for your order!'
    );
    expect(await orderConfirmationPage.shippingAddress.getText()).toContain(
      AddressForm.LAST_NAME
    );
    expect(await orderConfirmationPage.shippingAddress.getText()).toContain(
      AddressForm.CITY
    );
    expect(await orderConfirmationPage.shippingMethod.getText()).toContain(
      'Standard Delivery'
    );
    expect(await orderConfirmationPage.paymentMethod.getText()).toContain(
      PaymentForm.CARD_TYPE
    );
    expect(await orderConfirmationPage.billingAddress.getText()).toContain(
      AddressForm.LAST_NAME
    );
    expect(await orderConfirmationPage.billingAddress.getText()).toContain(
      AddressForm.CITY
    );
    expect(await orderConfirmationPage.orderItem(0).getText()).toContain(
      PRODUCT_CODE
    );
    expect(await orderConfirmationPage.orderSummary.getText()).toContain(
      'Total: $2,635.07'
    );
  });

  it('should be able to check order in order history', async () => {
    // Go to my-account and assess that the new order is the newest in the list.
    const orderHistoryPage = new OrderHistoryPage();
    await orderHistoryPage.navigateTo();
    expect(await orderHistoryPage.historyHeader.getText()).toContain(
      '1 orders found in your Order History'
    );
    expect(await orderHistoryPage.historyItem(0).getText()).toContain(
      '$2,635.07'
    );

    // Logout at the end of test
    await LoginHelper.logOutViaHeader();
  });
});
