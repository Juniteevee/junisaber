/**
 * Reset camera using rig element
 */
AFRAME.registerComponent('recenter-camera', {
  schema: {
    enabled: {default: true}
  },

  init: function () {
    this.resetPosition = { x: 0, y:1.6, z:0 }
    this.stepSize = .026
    this.sceneEl = this.el.sceneEl;
    this.recenterCamera = this.recenterCamera.bind(this);
    this.upCamera = this.upCamera.bind(this);
    this.downCamera = this.downCamera.bind(this);
    this.rigEl = this.el;
    this.el.sceneEl.addEventListener('recenter-camera', this.recenterCamera);
    this.el.sceneEl.addEventListener('up-camera', this.upCamera);
    this.el.sceneEl.addEventListener('down-camera', this.downCamera);
  },

  recenterCamera: function () {
      console.log(this);

      //if (!this.data.enabled) { return; }

      const cameraEl = this.sceneEl.camera.el;
      const cameraPosition = cameraEl.getAttribute("position");
      
      const adjustedPosition = {
        x: this.resetPosition.x - cameraPosition.x,
        y: this.resetPosition.y - cameraPosition.y,
        z: this.resetPosition.z - cameraPosition.z
      }
      this.rigEl.setAttribute("position", adjustedPosition);
  },

  upCamera: function () {
      console.log(this);
      this.resetPosition.y += this.stepSize;

      //if (!this.data.enabled) { return; }

      const rigPosition = this.rigEl.getAttribute("position");
      const adjustedPosition = {
        x: rigPosition.x,
        y: rigPosition.y + this.stepSize,
        z: this.rigPosition.z
      }

      this.rigEl.setAttribute("position", adjustedPosition);
  },

  downCamera: function () {
    console.log(this);
    this.resetPosition.y -= this.stepSize;

    //if (!this.data.enabled) { return; }

    const rigPosition = this.rigEl.getAttribute("position");
    const adjustedPosition = {
      x: rigPosition.x,
      y: rigPosition.y - this.stepSize,
      z: this.rigPosition.z
    }

    this.rigEl.setAttribute("position", adjustedPosition);
  },
});
