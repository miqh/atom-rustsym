'use babel';

describe('rustsym', () => {

  beforeEach(() => waitsForPromise(() => atom.packages.activatePackage('rustsym')));

  describe('given a Rust source file is open', () => {

    beforeEach(() => waitsForPromise(() => atom.workspace.open('tmp.rs')));

    describe('when the manual file symbols command is used', () => {
      it('should show the file symbols search view', () => {
        let workspaceElement = atom.views.getView(atom.workspace);
        let textEditorElement = atom.views.getView(atom.workspace.getActiveTextEditor());
        jasmine.attachToDOM(textEditorElement);
        atom.commands.dispatch(textEditorElement, 'rustsym:toggle-file-symbols');
        expect(workspaceElement.querySelector('.rustsym')).toExist();
        let statusBarModeElement = workspaceElement.querySelector('.rustsym-status-bar__mode');
        expect(statusBarModeElement).toExist();
        expect(statusBarModeElement.innerText.indexOf('file')).not.toBe(-1, 'incorrect search mode');
      });
    });

    describe('when the manual project symbols command is used', () => {
      it('should show the project symbols search view', () => {
        let workspaceElement = atom.views.getView(atom.workspace);
        jasmine.attachToDOM(workspaceElement);
        atom.commands.dispatch(workspaceElement, 'rustsym:toggle-project-symbols');
        expect(workspaceElement.querySelector('.rustsym')).toExist();
        let statusBarModeElement = workspaceElement.querySelector('.rustsym-status-bar__mode');
        expect(statusBarModeElement).toExist();
        expect(statusBarModeElement.innerText.indexOf('project')).not.toBe(-1, 'incorrect search mode');
      });
    });

  });

});
