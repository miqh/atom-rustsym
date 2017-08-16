/** @babel */

describe('rustsym', () => {

  beforeEach(async () => await atom.packages.activatePackage('rustsym'));

  describe('given a Rust source file is open', () => {

    beforeEach(async () => await atom.workspace.open('tmp.rs'));

    describe('when the manual file symbols command is used', async () => {
      it('should show the file symbols search view', async () => {
        let workspaceElement = atom.views.getView(atom.workspace);
        let textEditorElement = atom.views.getView(atom.workspace.getActiveTextEditor());
        jasmine.attachToDOM(textEditorElement);
        atom.commands.dispatch(textEditorElement, 'rustsym:toggle-file-symbols');
        expect(workspaceElement.querySelector('.rustsym')).toExist();
        let statusBarModeElement;
        await waitFor(() => {
          statusBarModeElement = workspaceElement.querySelector('.rustsym-status-bar__mode');
          return statusBarModeElement != null;
        });
        expect(statusBarModeElement).toExist();
        expect(statusBarModeElement.innerText.indexOf('file')).not.toBe(-1, 'incorrect search mode');
      });
    });

    describe('when the manual project symbols command is used', () => {
      it('should show the project symbols search view', async () => {
        let workspaceElement = atom.views.getView(atom.workspace);
        jasmine.attachToDOM(workspaceElement);
        atom.commands.dispatch(workspaceElement, 'rustsym:toggle-project-symbols');
        expect(workspaceElement.querySelector('.rustsym')).toExist();
        let statusBarModeElement;
        await waitFor(() => {
          statusBarModeElement = workspaceElement.querySelector('.rustsym-status-bar__mode');
          return statusBarModeElement != null;
        });
        expect(statusBarModeElement).toExist();
        expect(statusBarModeElement.innerText.indexOf('project')).not.toBe(-1, 'incorrect search mode');
      });
    });

  });

});

/**
 * Simple condition polling helper to support tests involving VDOM behaviour.
 */
function waitFor(condition, timeout) {
  if (typeof timeout === 'undefined') timeout = 3000;
  const startTime = Date.now();
  const checkCondition = (resolve, reject) => {
    if (Date.now() - startTime > timeout) return reject();
    if (condition()) return resolve();
    setTimeout(checkCondition, 100, resolve, reject);
  };
  return new Promise(checkCondition);
}
