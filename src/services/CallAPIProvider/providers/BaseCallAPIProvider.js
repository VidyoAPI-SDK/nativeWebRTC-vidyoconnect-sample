const notImplemented = (methodName) => {
  return Promise.reject(`${methodName} is not implemented`);
};

class BaseCallAPIProvider {
  async init(params) {
    return notImplemented("init");
  }
  async startCall(params) {
    return notImplemented("startCall");
  }
  async getCallProperties() {
    return notImplemented("getCallProperties");
  }
  async endCall() {
    return notImplemented("endCall");
  }
  async assignVideoRenderer(params) {
    return notImplemented("assignVideoRenderer");
  }
  async selectCamera(camera) {
    return notImplemented("selectCamera");
  }
  async cameraTurnOn({ camera }) {
    return notImplemented("cameraTurnOn");
  }
  async cameraTurnOff({ camera }) {
    return notImplemented("cameraTurnOff");
  }
  async addSelfView({ viewId }) {
    return notImplemented("addSelfView");
  }
  async removeSelfView({ viewId }) {
    return notImplemented("removeSelfView");
  }
  async subscribeOnCamerasChanges(onChanged) {
    return notImplemented("subscribeOnCamerasChanges");
  }
  async unsubscribeFromCamerasChanges() {
    return notImplemented("unsubscribeFromCamerasChanges");
  }
  async selectMicrophone(microphone) {
    return notImplemented("selectMicrophone");
  }
  async microphoneTurnOn({ microphone }) {
    return notImplemented("microphoneTurnOn");
  }
  async microphoneTurnOff({ microphone }) {
    return notImplemented("microphoneTurnOff");
  }
  async subscribeOnMicrophonesChanges(onChanged) {
    return notImplemented("subscribeOnMicrophonesChanges");
  }
  async unsubscribeFromMicrophonesChanges() {
    return notImplemented("unsubscribeFromMicrophonesChanges");
  }
  async selectSpeaker(speaker) {
    return notImplemented("selectSpeaker");
  }
  async speakerTurnOn({ speaker }) {
    return notImplemented("speakerTurnOn");
  }
  async speakerTurnOff({ speaker }) {
    return notImplemented("speakerTurnOff");
  }
  async subscribeOnSpeakersChanges(onChanged) {
    return notImplemented("subscribeOnSpeakersChanges");
  }
  async unsubscribeFromSpeakersChanges() {
    return notImplemented("unsubscribeFromSpeakersChanges");
  }
  async subscribeOnMonitorsChanges(onChanged) {
    return notImplemented("subscribeOnMonitorsChanges");
  }
  async unsubscribeFromMonitorsChanges() {
    return notImplemented("unsubscribeFromMonitorsChanges");
  }
  async subscribeOnWindowsChanges(onChanged) {
    return notImplemented("subscribeOnWindowsChanges");
  }
  async unsubscribeFromWindowsChanges() {
    return notImplemented("unsubscribeFromWindowsChanges");
  }
  async subscribeOnLocalWindowShareChanges() {
    return notImplemented("subscribeOnLocalWindowShareChanges");
  }
  async unsubscribeFromLocalWindowShareChanges() {
    return notImplemented("unsubscribeFromLocalWindowShareChanges");
  }
  async subscribeOnRemoteWindowShareChanges() {
    return notImplemented("subscribeOnRemoteWindowShareChanges");
  }
  async unsubscribeFromRemoteWindowShareChanges() {
    return notImplemented("unsubscribeFromRemoteWindowShareChanges");
  }
  async startShare({ localShare }) {
    return notImplemented("startShare");
  }
  async stopShare() {
    return notImplemented("stopShare");
  }
  async subscribeOnParticipantsChanges(onChanged) {
    return notImplemented("subscribeOnParticipantsChanges");
  }
  async unsubscribeFromParticipantsChanges() {
    return notImplemented("unsubscribeFromParticipantsChanges");
  }
  async subscribeOnPermissionsChanges(onChanged) {
    return notImplemented("subscribeOnPermissionsChanges");
  }
  async unsubscribeFromPermissionsChanges() {
    return notImplemented("unsubscribeFromPermissionsChanges");
  }
  async subscribeOnResourceManagerChanges(onChanged) {
    return notImplemented("subscribeOnResourceManagerChanges");
  }
  async unsubscribeResourceManagerChanges() {
    return notImplemented("unsubscribeResourceManagerChanges");
  }
  async subscribeOnRecorderStatusChanges(onChanged) {
    return notImplemented("subscribeOnRecorderStatusChanges");
  }
  async unsubscribeFromRecorderStatusChanges() {
    return notImplemented("unsubscribeFromRecorderStatusChanges");
  }
  async subscribeOnRemoteCamerasChanges(onChanged) {
    return notImplemented("subscribeOnRemoteCamerasChanges");
  }
  async unsubscribeFromRemoteCamerasChanges(onChanged) {
    return notImplemented("unsubscribeFromRemoteCamerasChanges");
  }
  async subscribeOnRemoteMicrophonesChanges(onChanged) {
    return notImplemented("subscribeOnRemoteMicrophonesChanges");
  }
  async unsubscribeFromRemoteMicrophonesChanges(onChanged) {
    return notImplemented("unsubscribeFromRemoteMicrophonesChanges");
  }
  async setAdvancedConfiguration(config) {
    return notImplemented("setAdvancedConfiguration");
  }
  async getStats() {
    return notImplemented("getStats");
  }
  async createLogs() {
    return notImplemented("createLogs");
  }
  async pinParticipant() {
    return notImplemented("pinParticipant");
  }
  async subscribeOnModerationEvents(OnModerationCommandReceived) {
    return notImplemented("subscribeOnModerationEvents");
  }
  async subscribeOnCompositorViewChange(onChange) {
    return notImplemented("subscribeOnCompositorViewChange");
  }
  async subscribeOnCameraControlsPanelStateChange(onChange) {
    return notImplemented("subscribeOnCameraControlsPanelStateChange");
  }
  async subscribeOnCameraPresetChange(onChange) {
    return notImplemented("subscribeOnCameraPresetChange");
  }
  async unsubscribeFromModerationEvents() {
    return notImplemented("unsubscribeFromModerationEvents");
  }
  async subscribeOnRemoteSpeakerChanges(onChanged) {
    return notImplemented("subscribeOnRemoteSpeakerChanges");
  }
  async unsubscribeFromRemoteSpeakerChanges() {
    return notImplemented("unsubscribeFromRemoteSpeakerChanges");
  }
  async subscribeOnCompositorUpdates(onUpdated) {
    return notImplemented("subscribeOnCompositorUpdates");
  }
  async unsubscribeFromCompositorUpdates() {
    return notImplemented("unsubscribeFromCompositorUpdates");
  }
  async subscribeOnUnprocessedAudioUpdates(onUpdated) {
    return notImplemented("subscribeOnUnprocessedAudioUpdates");
  }
  async unsubscribeFromUnprocessedAudioUpdates() {
    return notImplemented("unsubscribeFromUnprocessedAudioUpdates");
  }
  async selectLocalStethoscope(localMicrophone, remoteSpeaker) {
    return notImplemented("selectLocalStethoscope");
  }
  async unselectLocalStethoscope(localMicrophone, remoteSpeaker) {
    return notImplemented("unselectLocalStethoscope");
  }
  async startRemoteStethoscope(remoteMicrophone, localSpeaker) {
    return notImplemented("startRemoteStethoscope");
  }
  async stopRemoteStethoscope(remoteMicrophone, localSpeaker) {
    return notImplemented("stopRemoteStethoscope");
  }
  async enableDynamicAudioSources() {
    return notImplemented("enableDynamicAudioSources");
  }
  async disableDynamicAudioSources() {
    return notImplemented("disableDynamicAudioSources");
  }
  async showWindowSharePreview() {
    return notImplemented("showWindowSharePreview");
  }
  async setCompositorGridView() {
    return notImplemented("setCompositorGridView");
  }
  async setCompositorGalleryView() {
    return notImplemented("setCompositorGalleryView");
  }
  async setFeccPresetsLabel() {
    return notImplemented("setFeccPresetsLabel");
  }
  async setFeccPresetsSelectLabel() {
    return notImplemented("setFeccPresetsSelectLabel");
  }

  sendChatMessage(params) {}
  subscribeOnChatMessages(onChanged, onNewMessageReceived) {}
  unsubscribeFromChatMessages() {}
}

export default BaseCallAPIProvider;
