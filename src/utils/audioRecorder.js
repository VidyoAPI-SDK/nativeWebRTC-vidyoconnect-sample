/**
 * Simple audio recorder
 * For each new stream should be created a new instance and released references that was returned by audioRecorder or his methods.
 * @async
 * @param stream {MediaStream}
 * @param initialSpeakerId {String} - optional parameters that contain speaker Id
 * @return {Object} an object tha conteins methods to interact with recorder: start, stop and play
 */

import { isSafari } from "react-device-detect";
const audioRecorder = async (stream, initialSpeakerId = null) => {
  if (!stream) throw new Error('Parameter "stream" is required');
  const mediaRecorder = new MediaRecorder(stream);
  const audioElement = new Audio();
  let audioChunks = [];
  let savedSpeakerId = null;

  if (initialSpeakerId) {
    await attachSinkId(audioElement, initialSpeakerId);
    savedSpeakerId = initialSpeakerId;
  }

  mediaRecorder.addEventListener("dataavailable", (event) => {
    audioChunks.push(event.data);
  });

  /**
   * Startrecorder function
   * @return {void}
   */
  const start = () => {
    audioElement.pause();
    audioElement.src = "";
    audioChunks = [];
    mediaRecorder.start();
  };

  /**
   * Stop recorder function
   * @async
   * @return {Object} an object tha conteins audioBlob, audioUrl, audioElement
   */
  const stop = () => {
    return new Promise((resolve) => {
      mediaRecorder.onstop = () => {
        let audioBlob;
        if (isSafari) {
          audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
        } else {
          audioBlob = new Blob(audioChunks);
        }
        const audioUrl = URL.createObjectURL(audioBlob);
        audioElement.src = audioUrl;
        resolve({ audioBlob, audioUrl, audioElement });
      };
      if (mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
    });
  };

  /**
   * Play recorded audio
   * @async
   * @param speakerId {String} - optional parameters that contain speaker Id
   * @return {Object} audioElement
   */
  const play = async (speakerId = initialSpeakerId) => {
    if (!audioElement.src) throw new Error("Recording not found");
    if (speakerId !== savedSpeakerId) {
      await attachSinkId(audioElement, speakerId);
    }
    audioElement.play();
    return audioElement;
  };

  return { start, stop, play };
};

const attachSinkId = async (audioElement, speakerId) => {
  if (audioElement.setSinkId) {
    //Reload audio before setSinkId to avoid issue with no sound after unplugging the active speaker
    audioElement.pause();
    audioElement.load();

    try {
      await audioElement.setSinkId(speakerId);
      console.info("Sucessfully attached sinkid for " + speakerId);
    } catch (e) {
      console.error("Error while  attaching sinkid for " + speakerId);
      throw e;
    }
  }
};

audioRecorder.test = async () => {
  let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  let recorder = await audioRecorder(stream);
  await recorder.start();
  return new Promise((resolve) => {
    setTimeout(async () => {
      await recorder.stop();
      resolve(await recorder.play());
    }, 5000);
  });
};
window.__audioRecorder = audioRecorder;

export default audioRecorder;
