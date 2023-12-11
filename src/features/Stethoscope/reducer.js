import {
  UPDATE_LOCAL_STETHOSCOPES,
  UPDATE_REMOTE_STETHOSCOPES,
  SELECT_REMOTE_STETHOSCOPE_SUCCEEDED,
  UNSELECT_REMOTE_STETHOSCOPE_SUCCEEDED,
  START_REMOTE_STETHOSCOPE_SUCCEEDED,
  STOP_REMOTE_STETHOSCOPE_SUCCEEDED,
  SELECT_LOCAL_STETHOSCOPE_SUCCEEDED,
  UNSELECT_LOCAL_STETHOSCOPE_SUCCEEDED,
  UNSELECT_LOCAL_STETHOSCOPE_FAILED,
  SELECTED_REMOTE_STETHOSCOPE_REMOVED,
  LOCAL_STETHOSCOPE_STARTED,
  LOCAL_STETHOSCOPE_STOPPED,
  STETHOSCOPE_SUPPORT_CHANGED,
} from "./actions/types";

const initialState = {
  localStethoscopes: [],
  remoteStethoscopes: [],
  selectedLocalStethoscope: null,
  selectedRemoteStethoscope: null,
  isStethoscopeSupported: true,
  isLocalStethoscopeStarted: false,
  isRemoteStethoscopeStarted: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_LOCAL_STETHOSCOPES:
      return {
        ...state,
        localStethoscopes: [...action.localStethoscopes],
      };

    case UPDATE_REMOTE_STETHOSCOPES:
      return {
        ...state,
        remoteStethoscopes: [...action.remoteStethoscopes],
      };

    case SELECT_LOCAL_STETHOSCOPE_SUCCEEDED:
      return {
        ...state,
        selectedLocalStethoscope: action.selectedLocalStethoscope,
        isLocalStethoscopeStarted: false,
      };

    case UNSELECT_LOCAL_STETHOSCOPE_SUCCEEDED:
    case UNSELECT_LOCAL_STETHOSCOPE_FAILED:
      return {
        ...state,
        selectedLocalStethoscope: null,
        isLocalStethoscopeStarted: false,
      };

    case SELECT_REMOTE_STETHOSCOPE_SUCCEEDED:
      return {
        ...state,
        selectedRemoteStethoscope: action.stethoscope,
        isRemoteStethoscopeStarted: false,
      };

    case SELECTED_REMOTE_STETHOSCOPE_REMOVED:
    case UNSELECT_REMOTE_STETHOSCOPE_SUCCEEDED:
      return {
        ...state,
        selectedRemoteStethoscope: null,
        isRemoteStethoscopeStarted: false,
      };

    case START_REMOTE_STETHOSCOPE_SUCCEEDED:
      return {
        ...state,
        isRemoteStethoscopeStarted: true,
      };

    case STOP_REMOTE_STETHOSCOPE_SUCCEEDED:
      return {
        ...state,
        isRemoteStethoscopeStarted: false,
      };

    case LOCAL_STETHOSCOPE_STARTED:
      return {
        ...state,
        isLocalStethoscopeStarted: true,
      };

    case LOCAL_STETHOSCOPE_STOPPED:
      return {
        ...state,
        isLocalStethoscopeStarted: false,
      };

    case STETHOSCOPE_SUPPORT_CHANGED:
      return {
        ...state,
        isStethoscopeSupported: action.supported,
      };

    default:
      return state;
  }
};
