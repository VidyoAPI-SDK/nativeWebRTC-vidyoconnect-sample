import BaseCallAPIProvider from "./BaseCallAPIProvider";
import { debounce, throttle } from "throttle-debounce";
import { loadScript, loadStyles } from "utils/loaders.js";
import { isChrome } from "react-device-detect";
import { saveAs } from "file-saver";
import logger, {
  startCollectingConsoleLogs,
  collectedLogs,
  logCallbacks,
} from "utils/logger";
import storage from "utils/storage";
import { isMobile } from "react-device-detect";
import { participantLimit, tabletsGridParticipantLimit } from "utils/constants";
import OperatingSystemInfoProvider from "utils/deviceDetect";
import { isBackgroundEffectSupported } from "utils/useBackgroundEffect";

const VidyoClientCSS =
  window.appConfig.REACT_APP_VIDYOCLIENT_PATH + "/VidyoClient.css";
const VidyoClientJS =
  window.appConfig.REACT_APP_VIDYOCLIENT_PATH + "/VidyoClient.min.js";
const VidyoLocalDeviceTypes = {
  VidyoLocalCamera: "Camera",
  VidyoLocalMicrophone: "Microphone",
  VidyoLocalSpeaker: "Speaker",
};

class VidyoConnectorAPI extends BaseCallAPIProvider {
  constructor() {
    if (VidyoConnectorAPI.instance) {
      return VidyoConnectorAPI.instance;
    }
    super();
    startCollectingConsoleLogs();

    this.vc = null;
    this.vidyoConnector = null;
  }

  init(config) {
    return new Promise((resolve, reject) => {
      loadStyles(VidyoClientCSS)
        .then(() => {
          if (!window.appConfig.REACT_APP_DYNAMIC_VIDYOCLIENT) {
            return loadScript(VidyoClientJS);
          }
          const params = new URLSearchParams(window.location.search);
          const dynamicVidyoClient = params.get("vidyoclient");
          if (dynamicVidyoClient) {
            logger.warn(`Dynamic VidyoClient used: ${dynamicVidyoClient}`);
            return loadScript(dynamicVidyoClient);
          } else {
            return loadScript(VidyoClientJS);
          }
        })
        .then(() => {
          this.vc = new window.VidyoClientLib.VidyoClient("", () => {
            this.vc
              .CreateVidyoConnector({
                viewId: null,
                viewStyle: "VIDYO_CONNECTORVIEWSTYLE_Default",
                remoteParticipants: OperatingSystemInfoProvider.IsTabletDevice()
                  ? tabletsGridParticipantLimit
                  : participantLimit,
                logFileFilter:
                  "info@VidyoDevelopment info@VidyoClient info@VidyoSDP",
                //logFileFilter: "all@VidyoDevelopment info@VidyoClient debug@VidyoSDP received@VidyoClient enter@VidyoClient info@VidyoResourceManager all@VidyoSignaling",
                logFileName: "",
                userData: 0,
                constraints: {
                  disableGoogleAnalytics: !config.enableVcGa,
                },
              })
              .then((vidyoConnector) => {
                this.vidyoConnector = vidyoConnector;
                return this.vidyoConnector.GetVersion();
              })
              .then((version) => {
                logger.warn(`VidyoClient version is ${version}`);
                resolve(this.vc);
              })
              .catch(reject);
          });
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  setAdvancedConfiguration(config = {}) {
    return this.vidyoConnector.SetAdvancedConfiguration(config);
  }

  startCall({ host, roomKey, displayName, roomPin, onDisconnected } = {}) {
    if (typeof onDisconnected !== "function") {
      onDisconnected = (reason, handler) => {
        console.log(
          `vidyoConnector.Connect : ${handler} callback received with ${reason}`
        );
      };
    }

    return new Promise((resolve, reject) => {
      const connectToRoomAsGuest = () => {
        this.vidyoConnector
          .ConnectToRoomAsGuest(
            logCallbacks({
              context: "ConnectToRoomAsGuest",
              host,
              roomKey,
              displayName,
              roomPin,
              // Define handlers for connection events.
              onSuccess: function () {
                resolve();
              },
              onFailure: function (reason) {
                onDisconnected && onDisconnected(reason, true);
              },
              onDisconnected: function (reason) {
                onDisconnected && onDisconnected(reason, false);
              },
            })
          )
          .then(function (status) {
            if (!status) {
              reject();
            }
          })
          .catch(reject);
      };
      if (isMobile && isChrome) {
        setTimeout(connectToRoomAsGuest, 500); // Remove workaround with timeout when IOWEBRTC-2807 will be fixed
      } else {
        connectToRoomAsGuest();
      }
    });
  }

  controlAnalyticsEventTable({ eventCategory, eventAction, enable }) {
    return this.vidyoConnector.AnalyticsControlEventAction({
      eventCategory,
      eventAction,
      enable,
    });
  }

  getAnalyticsEventTable() {
    return new Promise((resolve) => {
      this.vidyoConnector.GetAnalyticsEventTable({
        onGetAnalyticsEventTableCallback: (eventTable) => {
          resolve(eventTable);
        },
      });
    });
  }

  getCallProperties() {
    return this.vidyoConnector.GetConnectionProperties().then((resultArray) => {
      let result = resultArray.reduce((r, i) => {
        r[i.name] = i.value;
        return r;
      }, {});
      return {
        callName: result["Room.displayName"],
      };
    });
  }

  endCall() {
    return this.vidyoConnector.Disconnect();
  }

  setCompositorGridView() {
    return this.vidyoConnector.CompositorSetGridView();
  }

  setCompositorGalleryView() {
    return this.vidyoConnector.CompositorSetGalleryView();
  }

  assignVideoRenderer({ viewId, showAudioMeters = false }) {
    return this.vidyoConnector
      .AssignViewToCompositeRenderer({
        viewId,
        remoteParticipants: OperatingSystemInfoProvider.IsTabletDevice()
          ? tabletsGridParticipantLimit
          : participantLimit,
        viewStyle: "VIDYO_CONNECTORVIEWSTYLE_Default",
      })
      .then(() => {
        return this.vidyoConnector.ShowAudioMeters({
          showMeters: showAudioMeters,
          viewId,
        });
      });
  }

  enablePreview(isShowPreview) {
    return this.vidyoConnector.ShowPreview({
      preview: isShowPreview,
    });
  }

  showWindowSharePreview(isShowSharePreview) {
    return this.vidyoConnector.ShowWindowSharePreview({
      preview: isShowSharePreview,
    });
  }

  toggleCamera(privacy) {
    return this.vidyoConnector.SetCameraPrivacy({
      privacy,
    });
  }

  cameraTurnOn() {
    return this.toggleCamera(false);
  }

  cameraTurnOff() {
    if (window.isSafariBrowser) {
      // TODO remove when https://enghouseglobal.atlassian.net/browse/VIDVCW-182 wil be done
      setTimeout(() => {
        // eslint-disable-next-line no-unused-expressions
        window.banuba?.stopStreams?.();
      }, 50);
    }
    return this.toggleCamera(true);
  }

  cycleCamera() {
    return this.vidyoConnector.CycleCamera();
  }

  setMicrophonePrivacy(privacy) {
    return this.vidyoConnector.SetMicrophonePrivacy({
      privacy,
    });
  }

  setSpeakerPrivacy(privacy) {
    return this.vidyoConnector.SetSpeakerPrivacy({
      privacy,
    });
  }

  microphoneTurnOff() {
    return this.setMicrophonePrivacy(true);
  }

  microphoneTurnOn() {
    return this.setMicrophonePrivacy(false);
  }

  speakerTurnOn() {
    return this.setSpeakerPrivacy(false);
  }

  speakerTurnOff() {
    return this.setSpeakerPrivacy(true);
  }

  addSelfView({ viewId }) {
    return this.vidyoConnector
      .AssignViewToCompositeRenderer({
        viewId,
      })
      .then(() => {
        return this.vidyoConnector.ShowViewLabel({ viewId, showLabel: false });
      })
      .then(() => {
        return this.vidyoConnector.ShowAudioMeters({
          viewId,
          showMeters: false,
        });
      });
  }

  removeSelfView({ viewId }) {
    return this.vidyoConnector
      .ShowViewLabel({ viewId, showLabel: true })
      .then(() => {
        return this.vidyoConnector.AssignViewToCompositeRenderer({
          viewId: null,
        });
      });
  }

  selectCamera(localCamera) {
    return this.vidyoConnector.SelectLocalCamera({
      localCamera,
    });
  }

  selectMicrophone(localMicrophone) {
    return this.vidyoConnector.SelectLocalMicrophone({
      localMicrophone,
    });
  }

  selectSpeaker(localSpeaker) {
    return this.vidyoConnector.SelectLocalSpeaker({
      localSpeaker,
    });
  }

  setFeccPresetsSelectLabel(label) {
    return this.vidyoConnector.SetFeccPresetsSelectLabel({
      label,
    });
  }

  setFeccPresetsLabel(label) {
    return this.vidyoConnector.SetFeccPresetsLabel({
      label,
    });
  }

  startShare({ localWindowShare }) {
    return this.vidyoConnector.SelectLocalWindowShare({
      localWindowShare,
    });
  }

  stopShare() {
    return this.vidyoConnector.SelectLocalWindowShare({
      localWindowShare: null,
    });
  }

  startParticipantsListener(onChanged) {
    let participants = {
      list: [],
      participantJoined: null,
      participantLeft: null,
    };

    const notify = throttle(500, () => {
      if (this.vidyoConnector) {
        onChanged(participants);
      }
    });

    this.vidyoConnector.ReportLocalParticipantOnJoined({
      reportLocalParticipant: true,
    });

    return this.vidyoConnector.RegisterParticipantEventListener(
      logCallbacks({
        context: "Participant",
        onJoined: (participantJoined) => {
          participants.list.push(participantJoined);
          participants.participantJoined = participantJoined;
          notify();
        },
        onLeft: (participantLeft) => {
          participants.list = participants.list.filter(
            (participant) => participant.id !== participantLeft.id
          );
          participants.participantLeft = participantLeft;
          onChanged(participants);
        },
        onDynamicChanged: function (participants, cameras) {
          // participant changes camera state
        },
        onLoudestChanged: function (participant, audioOnly) {
          // participant changes audio state
        },
      })
    );
  }

  startRemoteCamerasListener(onChanged) {
    let cameras = [];

    this.vidyoConnector
      .RegisterRemoteCameraEventListener(
        logCallbacks({
          context: "RemoteCamera",
          onAdded: (camera, participant) => {
            camera.participant = participant;
            cameras.push(camera);
            onChanged(cameras);
          },
          onRemoved: (camera, participant) => {
            cameras = cameras.filter((item) => item.id !== camera.id);
            onChanged(cameras);
          },
          onStateUpdated: (camera, participant, state) => {},
        })
      )
      .then(function () {
        console.log("RegisterRemoteCameraEventListener Success");
      })
      .catch(function () {
        console.error("RegisterRemoteCameraEventListener Failed");
      });
  }

  startRecorderStatusListener(onChanged) {
    this.vidyoConnector
      .RegisterRecorderInCallEventListener(
        logCallbacks({
          context: "RecorderInCall",
          onRecorderInCallChanged: (status) => {
            onChanged(status);
          },
        })
      )
      .then(function () {
        console.log("RegisterRecorderInCallEventListener Success");
      })
      .catch(function () {
        console.error("RegisterRecorderInCallEventListener Failed");
      });
  }

  startRemoteMicrophoneListener(onChanged) {
    let microphones = [];

    this.vidyoConnector
      .RegisterRemoteMicrophoneEventListener(
        logCallbacks({
          context: "RemoteMicrophone",
          onAdded: (microphone, participant) => {
            microphone.participant = participant;
            microphones.push(microphone);
            onChanged(microphones);
          },
          onRemoved: (microphone, participant) => {
            microphones = microphones.filter(
              (item) => item.id !== microphone.id
            );
            onChanged(microphones);
          },
          onStateUpdated: (microphone, participant, state) => {
            let states = {
              VIDYO_DEVICESTATE_Resumed: true,
              VIDYO_DEVICESTATE_Paused: false,
            };
            microphones.forEach((item) => {
              if (item.id === microphone.id) {
                item.microphoneOn = states[state];
              }
            });
            onChanged(microphones);
          },
        })
      )
      .then(function () {
        console.log("RegisterRemotemicrophoneEventListener Success");
      })
      .catch(function () {
        console.error("RegisterRemotemicrophoneEventListener Failed");
      });
  }

  startRemoteSpeakerListener(onChanged) {
    return this.vidyoConnector
      .RegisterRemoteSpeakerEventListener({
        onAdded: (remoteSpeaker) => {
          onChanged(remoteSpeaker);
        },
        onRemoved: (remoteSpeaker) => {
          onChanged(null);
        },
        onStateUpdated: (remoteSpeaker, state) => {},
      })
      .then(function () {
        console.log("RegisterRemoteSpeakerEventListener Success");
      })
      .catch(function () {
        console.error("RegisterRemoteSpeakerEventListener Failed");
      });
  }

  startResourceManagerEventListener(onChanged) {
    const notifyAvailableResourcesChanged = throttle(10000, (data) => {
      if (this.vidyoConnector) {
        // onChanged({ dataType: "availableResources", data });  // TODO temporary sotp global state update utill we will use this callback
        console.log(
          `AvailableResourcesChanged:cpuEncode: ${data.cpuEncode}, cpuDecode: ${data.cpuDecode}, bandwidthSend: ${data.bandwidthSend}, bandwidthReceive: ${data.bandwidthReceive}`
        );
      }
    });
    this.vidyoConnector
      .RegisterResourceManagerEventListener({
        onMaxRemoteSourcesChanged: () => {},
        onAvailableResourcesChanged: (
          cpuEncode,
          cpuDecode,
          bandwidthSend,
          bandwidthReceive
        ) => {
          notifyAvailableResourcesChanged({
            cpuEncode,
            cpuDecode,
            bandwidthSend,
            bandwidthReceive,
          });
        },
      })
      .then(function () {
        console.log("RegisterResourceManagerEventListener Success");
      })
      .catch(function () {
        console.error("RegisterResourceManagerEventListener Failed");
      });
  }

  handleAddedDevice(devices, device) {
    const savedDevice = this.filterDevices(devices, "saved");
    const defaultDevice = this.filterDevices(devices, "default");
    if (savedDevice) {
      this.selectLocalDevice(savedDevice);
    } else if (
      defaultDevice &&
      (device.objType === "VidyoLocalMicrophone" ||
        device.objType === "VidyoLocalSpeaker")
    ) {
      this.selectLocalDevice(defaultDevice);
    } else if (
      isMobile &&
      device.objType === "VidyoLocalCamera" &&
      !device.selected
    ) {
      this.selectLocalDevice(device);
    } else if (devices.length === 1 && !device.selected) {
      this.selectLocalDevice(device);
    }
  }

  handleRemovedDevice(device, selectedDevice, devices) {
    if (!(selectedDevice && device)) {
      return;
    }
    if (device.id === selectedDevice.id) {
      if (
        device.objType === "VidyoLocalMicrophone" ||
        device.objType === "VidyoLocalSpeaker"
      ) {
        this.selectLocalDevice(this.filterDevices(devices, "default"));
      }
      if (device.objType === "VidyoLocalCamera") {
        if (devices[0]) {
          this.selectLocalDevice(devices[0]);
        }
      }
    }
  }

  filterDevices(devices, filterBy) {
    return devices.filter((device) => {
      const result = {
        default: device.id === "default",
        saved:
          device.id ===
          storage.getItem("savedLocal" + VidyoLocalDeviceTypes[device.objType]),
      };
      return result[filterBy] || false;
    })[0];
  }

  selectLocalDevice(device) {
    if (!device) {
      return;
    }
    this.vidyoConnector["SelectLocal" + VidyoLocalDeviceTypes[device.objType]]({
      ["local" + VidyoLocalDeviceTypes[device.objType]]: device,
    });
  }

  startDeviceListener(targetListener, onChanged, context) {
    let devices = [];

    const notify = debounce(500, () => {
      if (this.vidyoConnector) {
        onChanged(devices);
      }
    });

    return targetListener.call(
      this.vidyoConnector,
      logCallbacks({
        context,
        onAdded: (device) => {
          if (device.name && device.name === "WebPluginVirtualCamera") return;
          if (device.id && device.id !== "communications") {
            if (device.name) {
              if (isChrome && device.id === "default") {
                device.name = device.name.replace(/^.+- /gu, "");
              }
              let parsedName = device.name.replace(
                /\s*\([a-zA-Z0-9]+:[a-zA-Z0-9]+\)/,
                ""
              );
              device.name = parsedName;
              devices = [...devices, device];
              this.handleAddedDevice(devices, device);
              notify();
            }
          }
        },
        onRemoved: (device) => {
          const selectedDevice = devices.filter((d) => d.selected)[0];
          devices = devices.filter((d) => d.objId !== device.objId);
          this.handleRemovedDevice(device, selectedDevice, devices);
          notify();
        },
        onSelected: (device) => {
          for (let device_ of devices) {
            if (device) {
              device_.selected = device_.objId === device.objId;
              if (device_.objId !== device.objId) {
                device_.isStarted = false;
              }
            } else {
              device_.selected = false;
            }
          }
          notify();
        },
        onStateUpdated: (device, state) => {
          if (device.name && device.name === "WebPluginVirtualCamera") return;
          devices = devices.map((d) => {
            if (d.objId === device.objId) {
              switch (state) {
                case "VIDYO_DEVICESTATE_Suspended":
                  d.isSuspended = true;
                  break;
                case "VIDYO_DEVICESTATE_Unsuspended":
                  d.isSuspended = false;
                  break;
                case "VIDYO_DEVICESTATE_Controllable":
                  d.isControllable = true;
                  break;
                case "VIDYO_DEVICESTATE_DefaultChanged":
                  d.isDefault = true;
                  break;
                case "VIDYO_DEVICESTATE_ConfigureError":
                case "VIDYO_DEVICESTATE_Error":
                  d.isFailed = true;
                  d.isStarted = false;
                  break;
                case "VIDYO_DEVICESTATE_Started":
                  d.isFailed = false;
                  d.isStarted = true;
                  break;
                case "VIDYO_DEVICESTATE_Stopped":
                  d.isStarted = false;
                  break;
                default:
              }
            }
            return d;
          });
          notify();
        },
      })
    );
  }

  startLocalShareListener(targetListener, onChanged) {
    let shares = [];

    const notify = debounce(500, () => {
      if (this.vidyoConnector) {
        onChanged(shares);
      }
    });

    return targetListener
      .call(this.vidyoConnector, {
        onAdded: (share) => {
          shares.push(share);
          notify();
        },
        onRemoved: (share) => {
          shares = shares.filter((item) => item.id !== share.id);
          notify();
        },
        onSelected: (share) => {
          for (let share_ of shares) {
            if (share) {
              share_.selected = share_.objId === share.objId;
            } else {
              share_.selected = false;
            }
          }
          notify();
        },
        onStateUpdated: (share, state) => {},
      })
      .then(function (result) {
        console.log(`${targetListener.name} Success`);
      })
      .catch(function () {
        console.error(`${targetListener.name} Failed`);
      });
  }

  startRemoteShareListener(targetListener, onChanged) {
    let shares = [];

    const notify = debounce(500, () => {
      if (this.vidyoConnector) {
        onChanged(shares);
      }
    });

    return targetListener
      .call(
        this.vidyoConnector,
        logCallbacks({
          context: "RemoteShare",
          onAdded: (share, participant) => {
            share["participant"] = participant;
            shares.push(share);
            notify();
          },
          onRemoved: (share) => {
            shares = shares.filter((item) => item.id !== share.id);
            notify();
          },
          onStateUpdated: (share, participant, state) => {},
        })
      )
      .then(function (result) {
        console.log(`${targetListener.name} Success`);
      })
      .catch(function () {
        console.error(`${targetListener.name} Failed`);
      });
  }

  startAnalytics({ serviceType, trackingID }) {
    return this.vidyoConnector.AnalyticsStart({
      serviceType,
      trackingID,
    });
  }

  stopAnalytics() {
    return this.vidyoConnector.AnalyticsStop();
  }

  setProductInfo({
    applicationName = window.appConfig.REACT_APP_ANALYTICS_NAME,
    applicationVersion = window.appConfig.APP_VERSION,
  } = {}) {
    return this.vidyoConnector.SetProductInfo({
      productInfo: [
        { name: "ApplicationName", value: applicationName },
        { name: "ApplicationVersion", value: applicationVersion },
      ],
      supportedFeature: [],
    });
  }

  subscribeOnAdvancedSettingsChanges(onChanged) {
    if (
      typeof this.vidyoConnector._registerAdvancedSettingsEventListener ===
      "function"
    ) {
      this.vidyoConnector._registerAdvancedSettingsEventListener({
        onDisableStatsChanged: (disableStats) => {
          onChanged({ disableStats });
        },
        onEnableVideoSimulcastChanged: (enableVideoSimulcast) => {
          onChanged({ enableVideoSimulcast });
        },
        onEnableScreenShareSimulcastChanged: (enableScreenShareSimulcast) => {
          onChanged({ enableScreenShareSimulcast });
        },
        onParticipantLimitChanged: (participantLimit) => {
          onChanged({ participantLimit });
        },
        onShowStatisticsOverlayChanged: (showStatisticsOverlay) => {
          onChanged({ showStatisticsOverlay });
        },
        onEnableAudioOnlyModeChanged: (enableAudioOnlyMode) => {
          onChanged({ enableAudioOnlyMode });
        },
        onEnableAutoReconnectChanged: (autoReconnectEnabled) => {
          onChanged({ autoReconnectEnabled });
        },
        onMaxReconnectAttemptsChanged: (maxReconnectAttempts) => {
          onChanged({ maxReconnectAttempts });
        },
        onReconnectBackoffChanged: (reconnectBackoff) => {
          onChanged({ reconnectBackoff });
        },
        onEnableSimpleAPILoggingChanged: (enableSimpleAPILogging) => {
          onChanged({ enableSimpleAPILogging });
        },
        onEnableVidyoConnectorAPILoggingChanged: (
          enableVidyoConnectorAPILogging
        ) => {
          onChanged({ enableVidyoConnectorAPILogging });
        },
        onEnableCompositorFixedParticipants: (
          enableCompositorFixedParticipants
        ) => {
          onChanged({ enableCompositorFixedParticipants });
        },
        onLogCategoryChanged: (logs) => {
          // eslint-disable-next-line no-prototype-builtins
          if (logs.hasOwnProperty("logLevel")) {
            const { activeLogs, logCategory, logLevel } = logs;
            onChanged({ activeLogs, logCategory, logLevel });
          } else {
            onChanged({ activeLogs: logs });
          }
        },
      });
    }
  }

  subscribeOnCamerasChanges(onChanged) {
    return this.startDeviceListener(
      this.vidyoConnector.RegisterLocalCameraEventListener,
      onChanged,
      "LocalCamera"
    );
  }

  subscribeOnRemoteCamerasChanges(onChanged) {
    return this.startRemoteCamerasListener(onChanged);
  }

  subscribeOnRemoteMicrophonesChanges(onChanged) {
    return this.startRemoteMicrophoneListener(onChanged);
  }

  subscribeOnRemoteSpeakerChanges(onChanged) {
    return this.startRemoteSpeakerListener(onChanged);
  }

  unsubscribeFromRemoteSpeakerChanges() {
    return this.vidyoConnector.UnregisterRemoteSpeakerEventListener();
  }

  subscribeOnRecorderStatusChanges(onChanged) {
    return this.startRecorderStatusListener(onChanged);
  }

  subscribeOnResourceManagerChanges(onChanged) {
    return this.startResourceManagerEventListener(onChanged);
  }

  unsubscribeResourceManagerChanges() {
    return this.vidyoConnector.UnregisterResourceManagerEventListener();
  }

  unsubscribeFromRecorderStatusChanges() {
    return this.vidyoConnector.UnregisterRecorderInCallEventListener;
  }

  unsubscribeFromCamerasChanges() {
    return this.vidyoConnector.UnregisterLocalCameraEventListener();
  }

  subscribeOnMicrophonesChanges(onChanged) {
    return this.startDeviceListener(
      this.vidyoConnector.RegisterLocalMicrophoneEventListener,
      onChanged,
      "LocalMicrophone"
    );
  }

  unsubscribeFromMicrophonesChanges() {
    return this.vidyoConnector.UnregisterLocalMicrophoneEventListener();
  }

  subscribeOnSpeakersChanges(onChanged) {
    return this.startDeviceListener(
      this.vidyoConnector.RegisterLocalSpeakerEventListener,
      onChanged,
      "LocalSpeaker"
    );
  }
  subscribeOnParticipantsChanges(onChanged) {
    return this.startParticipantsListener(onChanged);
  }

  unsubscribeFromSpeakersChanges() {
    return this.vidyoConnector.UnregisterLocalSpeakerEventListener();
  }

  subscribeOnLocalWindowShareChanges(onChanged) {
    return this.startLocalShareListener(
      this.vidyoConnector.RegisterLocalWindowShareEventListener,
      onChanged
    );
  }

  unsubscribeFromLocalWindowShareChanges() {
    return this.vidyoConnector.UnregisterLocalWindowShareEventListener();
  }

  subscribeOnRemoteWindowShareChanges(onChanged) {
    return this.startRemoteShareListener(
      this.vidyoConnector.RegisterRemoteWindowShareEventListener,
      onChanged
    );
  }

  unsubscribeFromRemoteWindowShareChanges() {
    return this.vidyoConnector.UnregisterRemoteWindowShareEventListener();
  }

  subscribeOnPermissionsChanges(onChanged) {
    return this.vidyoConnector.RegisterPermissionEventListener({
      onPermissionUpdated: onChanged,
    });
  }

  unsubscribeFromPermissionsChanges() {
    return this.vidyoConnector.UnregisterPermissionEventListener();
  }

  subscribeOnModerationEvents(onModerationCommandReceived) {
    return this.vidyoConnector.RegisterModerationCommandEventListener({
      onModerationCommandReceived,
    });
  }

  unsubscribeFromModerationEvents() {
    return this.vidyoConnector.UnegisterModerationCommandEventListener();
  }

  registerLocalCameraStreamInterceptor() {
    if (window.banubaPluginReady) {
      return this.vidyoConnector.RegisterLocalCameraStreamInterceptor(
        window.banuba.effectBackground
      );
    } else if (isBackgroundEffectSupported) {
      return new Promise((resolve, reject) => {
        window.addEventListener(
          "BanubaPluginReady",
          () => {
            this.vidyoConnector
              .RegisterLocalCameraStreamInterceptor(
                window.banuba.effectBackground
              )
              .then((response) => resolve(response))
              .catch((err) => reject(err));
          },
          false
        );
      });
    } else {
      return Promise.reject(new Error("Banuba is not supported"));
    }
  }

  subscribeOnUnprocessedAudioUpdates(onUpdated) {
    return this.vidyoConnector.RegisterUnprocessedAudioEventListener({
      onUnprocessedAudioSupportChanged: (supported) => {
        onUpdated({ event: "SUPPORT_CHANGED", supported });
      },
      onUnprocessedAudioStarted: (started) => {
        onUpdated({ event: "STARTED", started });
      },
    });
  }

  unsubscribeFromUnprocessedAudioUpdates() {
    return this.vidyoConnector.UnregisterUnprocessedAudioEventListener();
  }

  elevateLogs() {
    return this.vidyoConnector.SetAdvancedConfiguration({
      addLogCategory:
        "all@VidyoDevelopment debug@VidyoClient debug@VidyoSDP debug@VidyoResourceManager all@VidyoSignaling",
    });
  }

  desctructEndpoint() {
    if (this.vidyoConnector) {
      this.vidyoConnector
        .GetState()
        .then((state) => {
          if (state === "VIDYO_CONNECTORSTATE_Connected") {
            return this.vidyoConnector.Disconnect();
          }
        })
        .then(() => {
          this.vidyoConnector.Destruct();
        })
        .catch(() => {
          this.vidyoConnector.Destruct();
        });
    }
  }

  createLogs(state = {}) {
    return new Promise((resolve) => {
      logger.warn("Generating logs...");
      const logedAppState = `${new Date().toLocaleString()} | INFO | Application state: \n ${JSON.stringify(
        state,
        null,
        2
      )}`;
      setTimeout(() => {
        let content = [...collectedLogs]
          .filter((i) => {
            return !["%c next state", "%c prev state"].includes(i.value[0]);
          })
          .map((i) => {
            let v;
            if (i.value.length === 2) {
              v = i.value[0];
            } else {
              v = i.value.slice(-1)[0];
            }
            let extra = "";
            try {
              if (typeof v === "object") {
                v = JSON.stringify(v);
              }
            } catch (e) {
              console.error(i);
            }
            return `${i.datetime.toLocaleString()} | ${i.type.toUpperCase()} | ${v}\n${extra}`;
          });
        content.push(logedAppState);
        let blob = new Blob(content, { type: "text/plain;charset=utf-8" });
        saveAs(blob, `browser(${new Date().toLocaleString()}).log`);
        resolve();
      }, 1000);
    });
  }

  pinParticipant(options) {
    return this.vidyoConnector.PinParticipant(options);
  }

  selectLocalStethoscope(localMicrophone, remoteSpeaker) {
    return localMicrophone.AddToRemoteSpeaker({ remoteSpeaker });
  }

  unselectLocalStethoscope(localMicrophone, remoteSpeaker) {
    return localMicrophone.RemoveFromRemoteSpeaker({ remoteSpeaker });
  }

  startRemoteStethoscope(remoteMicrophone, localSpeaker) {
    return remoteMicrophone.AddToLocalSpeaker({
      localSpeaker,
      mode: "VIDYO_REMOTEMICROPHONEMODE_Static",
    });
  }

  stopRemoteStethoscope(remoteMicrophone, localSpeaker) {
    return remoteMicrophone.RemoveFromLocalSpeaker({
      localSpeaker,
    });
  }

  enableDynamicAudioSources() {
    return this.vidyoConnector.SetAdvancedConfiguration({
      disableDynamicAudioSources: false,
    });
  }

  disableDynamicAudioSources() {
    return this.vidyoConnector.SetAdvancedConfiguration({
      disableDynamicAudioSources: true,
    });
  }

  subscribeOnCompositorViewChange(onChange) {
    const notify = debounce(10, (payload) => {
      if (this.vidyoConnector) {
        onChange(payload);
      }
    });

    return this.vidyoConnector.RegisterCompositorViewChangeEventListener({
      onChange: (payload) => notify(payload),
    });
  }

  subscribeOnCameraPresetChange(onChange) {
    const notify = debounce(10, (payload) => {
      if (this.vidyoConnector) {
        onChange(payload);
      }
    });

    return this.vidyoConnector.RegisterRemoteCameraPresetChangeEventListener({
      onChange: (remoteCamera, presetIndex) =>
        notify({ remoteCamera, presetIndex }),
    });
  }

  subscribeOnCameraControlsPanelStateChange(onChange) {
    const notify = debounce(10, (payload) => {
      if (this.vidyoConnector) {
        onChange(payload);
      }
    });

    return this.vidyoConnector.RegisterCameraControlsPanelChangeEventListener({
      onChange: (payload) => notify(payload),
    });
  }

  subscribeOnCompositorUpdates(onUpdated) {
    const tiles = new Map();

    const notify = debounce(10, () => {
      if (this.vidyoConnector) {
        onUpdated([...tiles.values()]);
      }
    });

    return this.vidyoConnector.RegisterVideoTileEventListener({
      /**
       * @param { element, isApplication, isLocal, isPinned, participantId, videoEnabled } payload
       */
      onAdded: (payload) => {
        tiles.set(payload.element, payload);
        notify();
      },
      /**
       * @param { element, isApplication, participantId } payload
       */
      onRemoved: (payload) => {
        tiles.delete(payload.element);
        notify();
      },
      /**
       * @param { element, isApplication, isLocal, isPinned, participantId, videoEnabled } payload
       */
      onStateUpdated: (payload) => {
        tiles.set(payload.element, payload);
        notify();
      },
    });
  }

  unsubscribeFromCompositorUpdates() {
    return this.vidyoConnector.UnregisterVideoTileEventListener();
  }
}

export default VidyoConnectorAPI;
