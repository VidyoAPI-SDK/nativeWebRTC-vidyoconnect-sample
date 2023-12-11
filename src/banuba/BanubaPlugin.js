import {
  Effect,
  MediaStream as BanubaMediaStream,
  MediaStreamCapture,
  Player,
  Dom,
  Module,
} from "@banuba/webar";
import wasm from "@banuba/webar/BanubaSDK.wasm";
import simd from "@banuba/webar/BanubaSDK.simd.wasm";
import data from "@banuba/webar/BanubaSDK.data";

// import FaceTracker from "@banuba/webar/face_tracker.zip?url";
import Background from "@banuba/webar/background.zip?url";
import { loadScript } from "utils/loaders.js";

// SDK version 1.7.1
// effect stored in public/banuba folder
// docs: https://docs.banuba.com/face-ar-sdk-v1/generated/typedoc/

export async function initBanubaPlugin() {
  const params = new URLSearchParams(window.location.search);
  const effectParam =
    params.get("effect") ||
    (!window.isMobileOrTablet ? "Camera_background" : "blur");

  const playerId = `webar_${new Date().valueOf()}`;
  if (window.isSafariBrowser) navigator.serviceWorker.register("banuba/range-requests.sw.js");

  let player, modules;
  await loadScript("banuba/token.js");
  const banubaToken = window.banubaToken;
  try {
    [player, modules] = await Promise.all([
      Player.create({
        locateFile: {
          "BanubaSDK.data": data,
          "BanubaSDK.wasm": wasm,
          "BanubaSDK.simd.wasm": simd,
        },
        clientToken: banubaToken,
        devicePixelRatio: 1,
        proxyVideoRequestsTo: window.isSafariBrowser ? "___range-requests___/": null,
      }),
      Module.preload([Background])
    ])

    await player.addModule(...modules);
  } catch (e) {
    console.error(e);
  }
  if (!player) return;
  // await new Promise((resolve) => setTimeout(resolve, 15000)); // please do not remove, we need it for testing loading delay

  const effect = await Effect.preload(`banuba/${effectParam}.zip`);

  const playerElement = document.createElement("div");
  playerElement.id = playerId;
  playerElement.style = `
     position: absolute !important;
     top: -9999px !important;
     left: -9999px !important;
     display: !important;
   `;
  document.body.appendChild(playerElement);

  let _isBanubaInited = false;
  const store = localStorage.getItem("VIDYO_CONNECT");
  let selectedCameraEffect;
  if (store) {
    selectedCameraEffect = JSON.parse(store).selectedCameraEffect;
  }
  if (selectedCameraEffect) {
    await player.applyEffect(effect);

    if (selectedCameraEffect.id === "blur") {
      effect.evalJs("Background.blur(0.6)");
      _isBanubaInited = true;
    } else if (!window.isMobileOrTablet) {
      effect.evalJs(`Background.texture('${selectedCameraEffect.name}.jpg')`);
      _isBanubaInited = true;
    }
  }

  let streams = [];
  let lastStream = null;

  const clearStream = (stream) => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.stop();
      });
    }
  };

  window.banuba = {
    get isBanubaInited() {
      return _isBanubaInited;
    },
    clearEffect: () => player.clearEffect(),
    applyEffect: async (imageName) => {
      _isBanubaInited = true;
      await player.applyEffect(effect);

      if (imageName === "blur") {
        effect.evalJs("Background.blur(0.6)");
      } else if (!window.isMobileOrTablet) {
        effect.evalJs(`Background.texture('${imageName}.jpg')`);
      }
    },
    effectBackground: async (stream, useCache) => {
      if (!_isBanubaInited) return stream;
      if (lastStream?.active && useCache) {
        // applicable only for self-view
        clearStream(stream);
        const clonedEffectStream = lastStream.clone();
        console.log(
          `BANUBA: Called effectBackground for ${stream.id} and get effectedStreamCapture ${clonedEffectStream.id} from cache`
        );
        return clonedEffectStream;
      }

      player.use(new BanubaMediaStream(stream), {
        resize: (width, height) => {
          //if (width > 640) { return [640, 360]; }
          return [width, height];
        },
      });
      Dom.render(player, `#${playerId}`);
      let effectStream;
      // if (window.isSafariBrowser) {
      //   // Temporary part fix for safari, for issue wtih black selfview at the beginning
      //   // It looks like some issue with MediaStreamCapture
      //   effectStream = document
      //     .querySelector(`#${playerId} canvas`)
      //     ?.captureStream?.();
      // }
      if (!effectStream?.active) effectStream = new MediaStreamCapture(player);
      effectStream.addEventListener("inactive", () => clearStream(stream));
      streams.push(stream);
      lastStream = effectStream;
      console.log(
        `BANUBA: Called effectBackground for ${stream.id} and get fresh effectedStreamCapture ${effectStream.id}`
      );
      return effectStream;
    },
    getLastStream: () => {
      const clonedEffectStream = lastStream?.clone();
      console.log(
        `BANUBA: Called getLastStream and get ${
          clonedEffectStream ? clonedEffectStream.id : "null"
        } from cache. LastStream is ${lastStream ? lastStream.id : "null"}`
      );
      return clonedEffectStream;
    },
    stopStreams: () => {
      console.log(
        `BANUBA: Stop cached streams ${[lastStream, ...streams]
          .map((s) => s?.id || "")
          .join(",")}`
      );
      [lastStream, ...streams].forEach((stream) => {
        clearStream(stream);
      });
      streams = [];
      lastStream = null;
    },
    aplplyDefaultPortalEffect: async (defaultPortalBackground, storage) => {
      if (storage.getItem("defaultPortalBackground")) {
        storage.removeItem("defaultPortalBackground");
        storage.removeItem("selectedCameraEffect");
        await window.banuba.clearEffect();
      }

      if (
        !storage.getItem("selectedCameraEffect") &&
        !storage.getItem("clearCameraEffect") &&
        defaultPortalBackground
      ) {
        if (defaultPortalBackground === "NONE") {
          storage.removeItem("selectedCameraEffect");
          storage.addItem("defaultPortalBackground", true);
        } else if (defaultPortalBackground === "BLUR") {
          await window.banuba.applyEffect("blur");
          storage.addItem("selectedCameraEffect", { id: "blur" });
          storage.addItem("defaultPortalBackground", true);
        } else if (defaultPortalBackground.indexOf("IMAGE_") === 0) {
          let index = parseInt(defaultPortalBackground.replace(/[a-z_]*/i, ""));

          // For now, there are predefined 7 images
          if (index > 0 && index < 8) {
            await window.banuba.applyEffect(`camera_bg_${index}`);
            storage.addItem("selectedCameraEffect", {
              id: `predefinedImage${index}`,
              name: `camera_bg_${index}`,
              preview: `images/camera_bg_preview/camera_bg_${index}.jpg`,
              label: `Image ${index}`,
            });
            storage.addItem("defaultPortalBackground", true);
          } else {
            console.warn(
              "Couldn't apply background image from portal. Image from portal don't match images in effect folder."
            );
          }
        }
      }
    },
  };

  window.banubaPluginReady = true;
  const event = new Event("BanubaPluginReady", { bubbles: true });
  window.document.body.dispatchEvent(event);
  return true;
}
