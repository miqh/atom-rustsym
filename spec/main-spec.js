'use babel';

describe('rustsym', () => {

  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage('rustsym'));
  });

  it('should be activated', () => {
    // TODO: Package depends on activation commands now
    expect(true);
  });

});
