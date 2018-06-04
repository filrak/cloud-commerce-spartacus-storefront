import { browser, element, by, protractor } from 'protractor';
import { E2EUtil } from './../util.po';
export class Header {
  getSiteLogoComponent() {
    return E2EUtil.getComponent('SiteLogoComponent', 'y-banner');
  }

  getSearchComponent() {
    return E2EUtil.getComponent('SearchBox', 'y-searchbox');
  }

  performSearch(searchKey: string) {
    const searchComponent = this.getSearchComponent();

    // search for camera
    const searchInput = searchComponent.element(by.tagName('input'));
    searchInput.sendKeys(searchKey);
    browser
      .actions()
      .sendKeys(protractor.Key.ENTER)
      .perform();
  }
}