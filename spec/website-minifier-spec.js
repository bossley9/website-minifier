'use babel';

import WebsiteMinifier from '../lib/website-minifier';
import {assert} from 'chai';



describe('website-minifier', () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('website-minifier');
  });

});
