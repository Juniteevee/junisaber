import utils from '../utils';

AFRAME.registerComponent('menu-selected-challenge-image', {
  schema: {
    selectedChallengeId: {type: 'string'}
  },

  update: function () {
    const el = this.el;
    if (!this.data.selectedChallengeId) { return; }
    el.setAttribute(
      'material', 'src',
      this.data.selectedChallengeId);
  }
});
