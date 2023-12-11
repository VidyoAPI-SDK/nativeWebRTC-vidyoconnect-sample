export const getParticipantsList = (state) => state.call.participants.list;
export const getCcInitialized = (state) => state.call.ccInitialized;
export const getCcRequestInProgress = (state) =>
  state.call.cc.requestInProgress;
export const getCcButtonActive = (state) => state.call.cc.btnActive;
export const getPinnedParticipant = (state) => state.call.participants?.pinned;
