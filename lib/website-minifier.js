'use babel';

import WebsiteMinifierView from './website-minifier-view';
import { CompositeDisposable } from 'atom';

export default {

  websiteMinifierView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.websiteMinifierView = new WebsiteMinifierView(state.websiteMinifierViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.websiteMinifierView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'website-minifier:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.websiteMinifierView.destroy();
  },

  serialize() {
    return {
      websiteMinifierViewState: this.websiteMinifierView.serialize()
    };
  },

  toggle() {
    console.log('WebsiteMinifier was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
