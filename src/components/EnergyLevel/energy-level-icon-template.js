import micControlEnergy from "../../assets/images/buttons/micControlEnergy.svg";
import speakerControlEnergy from "../../assets/images/buttons/speakerControlEnergy.svg";

(function () {
  function generateTemplate(params = {}) {
    const template = document.createElement("template");
    template.innerHTML = `
      <style>
        :host([hidden]) {
          display: none;
        }
        :host([disabled]) {
          opacity: 0.4;
        }
        .icon-energy-level-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0;
          top: 0;
          pointer-events: none;
        }
        .icon-energy-level-inner {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          width: 36px;
          height: 36px;
        }
        .icon-energy-level {
          display: inline-block;
          width: 20px;
          background-position: bottom 0px center;
          background-size: 15px;
          background-repeat: no-repeat;
          background-image: url(${params.img});
          height: 0px;
          margin-bottom: 10px;
        }
        :host([level="1"]) .icon-energy-level { height: 2px; }
        :host([level="2"]) .icon-energy-level { height: 4px; }
        :host([level="3"]) .icon-energy-level { height: 6px; }
        :host([level="4"]) .icon-energy-level { height: 8px; }
        :host([level="5"]) .icon-energy-level { height: 10px; }
        :host([level="6"]) .icon-energy-level { height: 12px; }
        :host([level="7"]) .icon-energy-level { height: 14px; }
        :host([level="8"]) .icon-energy-level { height: 16px; }
        :host([level="9"]) .icon-energy-level { height: 17px; }
        :host([level="10"]) .icon-energy-level { height: 18px; }
        :host([level="11"]) .icon-energy-level { height: 19px; }
        :host([level="12"]) .icon-energy-level { height: 20px; }
      </style>
      <span class="icon-energy-level-wrapper">
        <span class="icon-energy-level-inner">
          <span class="icon-energy-level"></span>
        </span>
      </span>
    `;
    return template;
  }

  class EnergyLevelIcon extends HTMLElement {
    static get observedAttributes() {
      return ["level"];
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      const template = generateTemplate({ img: micControlEnergy });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    attributeChangedCallback(name, oldValue, newValue) {}

    connectedCallback() {}

    disconnectedCallback() {}
  }

  class SpeakerEnergyLevelIcon extends HTMLElement {
    static get observedAttributes() {
      return ["level"];
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      const template = generateTemplate({ img: speakerControlEnergy });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    attributeChangedCallback(name, oldValue, newValue) {}

    connectedCallback() {}

    disconnectedCallback() {}
  }

  customElements.define("energy-level-icon", EnergyLevelIcon);
  customElements.define("speaker-energy-level-icon", SpeakerEnergyLevelIcon);
})();
