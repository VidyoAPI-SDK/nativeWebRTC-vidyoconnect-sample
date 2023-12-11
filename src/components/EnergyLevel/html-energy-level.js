import "./energy-level-template.js";
import "./energy-level-icon-template.js";

(function () {
  const template = document.createElement("template");
  template.innerHTML = `
    <energy-level level="0"></energy-level>
  `;

  const iconTemplate = document.createElement("template");
  iconTemplate.innerHTML = `
    <energy-level-icon level="0"></energy-level-icon>
  `;

  class MicrophoneEnergyLevel extends HTMLElement {
    static get observedAttributes() {
      return ["debug", "microphone", "disabled"];
    }

    reset() {
      this.level = 0;
      this.levels = [40];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) {
        return;
      }
      if (name === "debug") {
        this.debug = newValue === "true";
      }
      if (name === "disabled") {
        if (newValue === "true" || newValue === name) {
          this.disable();
        } else {
          this.enable();
        }
      }
      if (name === "microphone") {
        if (oldValue) {
          this.stopMicrophoneListening();
        }
        if (newValue) {
          this.microphoneId = newValue;
          if (!this.isDisabled) {
            this.startMicrophoneListening();
          }
        }
      }
    }

    connectedCallback() {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      this.startListenToDeviceChanges();
      this.reset();
      this.interval = setInterval(() => {
        this.reset();
      }, 5000);
    }

    disconnectedCallback() {
      this.stopListenToDeviceChanges();
      this.stopMicrophoneListening();
      clearInterval(this.interval);
    }

    set level(value) {
      this.shadowRoot
        .querySelector("energy-level")
        .setAttribute("level", value);
      this.setAttribute("level", value);
    }

    get level() {
      return this.getAttribute("level");
    }

    disable() {
      this.isDisabled = true;
      this.stopMicrophoneListening();
    }

    enable() {
      this.isDisabled = false;
      if (this.getAttribute("microphone")) {
        this.microphoneId = this.getAttribute("microphone");
        this.startMicrophoneListening();
      }
    }

    onChange(level) {
      this.levels.push(level);
      let max = Math.max.apply(null, this.levels);
      if (level === max) {
        this.level = 12;
      } else {
        this.level = Math.round((12 * level) / max);
      }
      if (this.debug) {
        console.log(`VCMicrophoneEnergyLevel: ${max}/${level}/${this.level}`);
      }
    }

    startMicrophoneListening() {
      console.log(
        `Start MicrophoneEnergy change detection for ${this.microphoneId}`
      );
      navigator.mediaDevices
        .getUserMedia({
          video: false,
          audio: {
            deviceId: this.microphoneId,
          },
        })
        .then((mediaStream) => {
          navigator.mediaDevices.enumerateDevices().then((devices) => {
            this._currentNativeMicrophone = devices.find(
              (d) => d.deviceId === this.microphoneId
            );
          });

          if (this.__stopMicrophoneListening || this.isDisabled) {
            mediaStream.getAudioTracks().forEach((track) => track.stop());
            return console.log(
              `Skip microphone energy detection for ${
                this.microphoneId || undefined
              }`
            );
          }
          let audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
          let analyser = audioContext.createAnalyser();
          let microphone = audioContext.createMediaStreamSource(mediaStream);
          let javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
          analyser.smoothingTimeConstant = 0.8;
          analyser.fftSize = 1024;
          microphone.connect(analyser);
          analyser.connect(javascriptNode);
          javascriptNode.connect(audioContext.destination);
          javascriptNode.onaudioprocess = () => {
            const array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            let values = 0;

            let length = array.length;
            for (let i = 0; i < length; i++) {
              values += array[i];
            }

            let average = values / length;
            this.onChange(average);
          };
          this.__stopMicrophoneListening = function () {
            analyser && analyser.disconnect();
            microphone && microphone.disconnect();
            javascriptNode && javascriptNode.disconnect();
            audioContext && audioContext.close();
            mediaStream &&
              mediaStream.getAudioTracks().forEach((track) => track.stop());
          };
        })
        .catch(function (err) {
          console.error(err);
        });
    }

    stopMicrophoneListening() {
      if (typeof this.__stopMicrophoneListening === "function") {
        console.log(
          `Stop MicrophoneEnergy change detection for ${this.microphoneId}`
        );
        this.__stopMicrophoneListening();
        this.microphoneId = "";
        this._currentNativeMicrophone = null;
        this.__stopMicrophoneListening = null;
      }
    }

    startListenToDeviceChanges() {
      this._handleDeviceChange = async (event) => {
        if (this._currentNativeMicrophone) {
          const microphone = this._currentNativeMicrophone;
          const devices = await navigator.mediaDevices.enumerateDevices();

          const isRemoved = !devices.some((d) => {
            return (
              d.deviceId === microphone.deviceId &&
              d.groupId === microphone.groupId &&
              d.label === microphone.label &&
              d.kind === microphone.kind
            );
          });

          if (isRemoved) {
            console.log(
              `MicrophoneEnergyLevel: ${this.microphoneId} is removed`
            );
            this.stopMicrophoneListening();

            setTimeout(() => {
              if (this.getAttribute("microphone")) {
                this.microphoneId = this.getAttribute("microphone");
                this.startMicrophoneListening();
              }
            });
          }
        }
      };
      navigator.mediaDevices.addEventListener(
        "devicechange",
        this._handleDeviceChange
      );
    }

    stopListenToDeviceChanges() {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        this._handleDeviceChange
      );
    }
  }

  class IconMicrophoneEnergyLevel extends MicrophoneEnergyLevel {
    connectedCallback() {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.appendChild(iconTemplate.content.cloneNode(true));
      this.startListenToDeviceChanges();
      this.reset();
      this.interval = setInterval(() => {
        this.reset();
      }, 5000);
    }

    set level(value) {
      this.shadowRoot
        .querySelector("energy-level-icon")
        .setAttribute("level", value);
      this.setAttribute("level", value);
    }
  }

  window.customElements.define(
    "microphone-energy-level",
    MicrophoneEnergyLevel
  );
  window.customElements.define(
    "icon-microphone-energy-level",
    IconMicrophoneEnergyLevel
  );
})();
