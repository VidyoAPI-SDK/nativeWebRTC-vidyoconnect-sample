/*
  Usage example:

  import runMultipleTabsDetection from "./multipleTabsDetection";

  runMultipleTabsDetection({
    storagePrefix: "vidyoconnector",
    onPageAdded() {
      console.warn("New page added. Stoping vidyoconnector session. ");
      vidyoConnector.Destruct();
    },
    onPageAlreadyExists() {
      console.warn("Another vidyoconnector page already exists.");
    }
  })

*/
export default function runMultipleTabsDetection(config) {
  const defaultConfig = {
    onPageAlreadyExists() {},
    onPageAdded() {},
    storagePrefix: "",
    storageListenerDelay: 0,
    pageAlreadyExistsEventDelay: 300,
  };

  let {
    onPageAlreadyExists,
    onPageAdded,
    storagePrefix,
    storageListenerDelay,
    pageAlreadyExistsEventDelay,
  } = { ...defaultConfig, ...config };

  return new Promise((resolve, reject) => {
    if (!localStorage) {
      return reject("localStorage is not available");
    }

    let currentDateValue = "" + Date.now();

    localStorage[`${storagePrefix}_new_page_added`] = currentDateValue;
    // sometimes on iOS we receive storage event for local newPageAdded property.
    // seems set to locastorage can work with delay on phones and tablets
    setTimeout(() => {
      window.addEventListener(
        "storage",
        (e) => {
          if (e.key === `${storagePrefix}_page_already_exists`) {
            onPageAlreadyExists();
          } else if (e.key === `${storagePrefix}_new_page_added`) {
            // skip storage event from current tab
            if (
              currentDateValue !==
              localStorage[`${storagePrefix}_new_page_added`]
            ) {
              onPageAdded();
              setTimeout(() => {
                localStorage[
                  `${storagePrefix}_page_already_exists`
                ] = Date.now();
              }, pageAlreadyExistsEventDelay);
            }
          }
        },
        false
      );
    }, storageListenerDelay);
    return resolve();
  });
}
