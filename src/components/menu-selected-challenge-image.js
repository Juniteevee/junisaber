import utils from '../utils';

AFRAME.registerComponent('menu-selected-challenge-image', {
  schema: {
    selectedChallengeId: {type: 'string'}
  },

  update: function () {
    const el = this.el;
    if (!this.data.selectedChallengeId) { return; }
    console.log('menu-selected-challenge-image', this.data.selectedChallengeId)
    el.setAttribute(
      'material', 'src',
      this.data.selectedChallengeId);
    el.setAttribute('crossOrigin', 'anonymous');
  }
});
