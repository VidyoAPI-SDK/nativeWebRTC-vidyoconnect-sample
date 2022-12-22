import testAudio from "../../../assets/audio/outgoing_call.mp3";
import "../energy-level-template.js";
import "../energy-level-icon-template.js";

(function () {
  const template = document.createElement("template");
  template.innerHTML = `
    <energy-level level="0"></energy-level>
  `;

  const iconTemplate = document.createElement("template");
  iconTemplate.innerHTML = `
    <speaker-energy-level-icon level="0"></speaker-energy-level-icon>
  `;

  class SpeakerEnergyLevel extends HTMLElement {
    static get observedAttributes() {
      return ["disabled", "play", "play_btn_id", "label_id", "speaker_id"];
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.renderTemplate();
      this.levels = [40];
      this.audioElement = new Audio(testAudio);
      this.playBtnElement = null;
      this.labelElement = null;
    }

    resetSpeakerAnimation() {
      this.level = 0;
      this.levels = [40];
      clearInterval(this.interval);
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) {
        return;
      }
      if (name === "disabled") {
        if (newValue === "true" || newValue === name) {
          this.disable();
        } else {
          this.enable();
        }
      }
      if (name === "play") {
        if (newValue === "true" && !this.isDisabled) {
          this.playTestSong();
        } else {
          this.stopTestSong();
        }
      }
      if (name === "play_btn_id") {
        setTimeout(() => {
          this.playBtnElement = document.getElementById(newValue);
        }, 100);
      }

      if (name === "label_id") {
        setTimeout(() => {
          this.labelElement = document.getElementById(newValue);
        }, 100);
      }

      if (name === "speaker_id") {
        this.setAttribute("play", "false");
        if (this.audioElement.setSinkId) {
          //Reload audio before setSinkId to avoid issue with no sound after unplugging the active speaker
          this.audioElement.pause();
          this.audioElement.load();

          this.audioElement
            .setSinkId(newValue)
            .then(() => {
              console.info("Sucessfully attached sinkid for " + newValue);
            })
            .catch(() => {
              console.error("Error while  attaching sinkid for " + newValue);
            });
        }
      }
    }

    playTestSong() {
      if (this.audioElement) {
        this.startSpeakerAnimation(this.audioElement);
        this.audioElement.onended = () => {
          this.setAttribute("play", "false");
        };
        this.audioElement.play();
        if (this.playBtnElement) this.playBtnElement.classList.add("playing");
        if (this.labelElement) this.labelElement.classList.add("playing");
      } else {
        console.log(
          `Speaker test audio element not found, skip testing speaker`
        );
      }
    }

    stopTestSong() {
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.resetSpeakerAnimation();
        if (this.labelElement) this.labelElement.classList.remove("playing");
        if (this.playBtnElement)
          this.playBtnElement.classList.remove("playing");
      } else {
        console.log(`Speaker test audio element not found`);
      }
    }

    connectedCallback() {
      this.stopTestSong();
    }

    disconnectedCallback() {
      this.stopTestSong();
      this.audioElement = null;
    }

    renderTemplate() {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
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
      this.setAttribute("play", "false");
    }

    enable() {
      this.isDisabled = false;
    }

    onChange(level) {
      // default max lvl is 12 but such us we use different images for speaker toggle and green speaker that lead us to situation when max height we achieve on lvl 8
      const maxLevel = 8;
      this.levels.push(level);
      let max = Math.max.apply(null, this.levels);
      if (level === max) {
        this.level = maxLevel;
      } else {
        this.level = Math.round((maxLevel * level) / max);
      }
    }

    startSpeakerAnimation(audioElement) {
      // Animation for 'audio/outgoing_call.ogg'
      // Change animationLvlArr for another audio file
      // prettier-ignore
      const animationLvlArr = [7,23,22,26,25,35,34,32,32,30,32,30,29,27,28,27,26,25,24,22,21,20,19,18,17,16,16,15,14,13,13,12,12,11,12,11,11,10,12,11,10,10,9,13,13,16,14,16,14,15,14,13,16,14,14,13,13,12,12,11,10,10,9,9,8,8,7,7,6,6,6,5,5,5,5,5,4,4,4,4,4,4,3,3,3,3,3,5,4,5,4,5,4,4];
      let i = 0;
      audioElement.onplay = () => {
        this.interval = setInterval(() => {
          if (i >= animationLvlArr.length) clearInterval(this.interval);
          this.onChange(animationLvlArr[i] || 0);
          i++;
        }, (audioElement.duration * 1000) / animationLvlArr.length);
      };
    }
  }

  class IconSpeakerEnergyLevel extends SpeakerEnergyLevel {
    renderTemplate() {
      this.shadowRoot.appendChild(iconTemplate.content.cloneNode(true));
    }

    set level(value) {
      this.shadowRoot
        .querySelector("speaker-energy-level-icon")
        .setAttribute("level", value);
      this.setAttribute("level", value);
    }
  }

  // window.customElements.define('speaker-test-energy-level', SpeakerEnergyLevel); Use when need add sound test to settings popup
  window.customElements.define(
    "icon-speaker-test-energy-level",
    IconSpeakerEnergyLevel
  );
})();
