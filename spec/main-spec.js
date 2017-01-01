'use babel';

describe('rustsym', () => {

  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage('rustsym'));
  });

  it('should be activated', () => {
    expect(true);
  });

});
