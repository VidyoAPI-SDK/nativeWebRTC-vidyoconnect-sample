const isElementInNodeList = (element, nodeList = []) => {
  for (const item of nodeList) {
    if (item === element) return true;
  }
  return false;
};

export function trapFocusInElement({
  elementId,
  listOffocusableElements,
  extendedFocusableElements = "",
  focusFirstElement = true,
  elementSelectorToBeFocused,
  firstElementSelector,
  lastElementSelector,
  foucusPrevElemenOnExit = true,
  foucusElemenOnExitBySelector,
  doNotAllowFrocusOutside = false,
  liveUpdateOfElementList = false,
  hideContentBeyondModal = false,
} = {}) {
  const focusableElements =
    listOffocusableElements ||
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])' +
      extendedFocusableElements;
  const modal = document.querySelector(elementId);

  if (!modal) return;
  if (hideContentBeyondModal) {
    document
      .querySelector("#root > div .content")
      ?.setAttribute("aria-hidden", "true");
    document
      .querySelector("#root > div .call-screen")
      ?.setAttribute("aria-hidden", "true");
    document
      .querySelector("#root > div .chat")
      ?.setAttribute("aria-hidden", "true");
    document
      .querySelector(".guest-settings-icon")
      ?.setAttribute("aria-hidden", "true");
  }
  const firstElement = document.querySelector(firstElementSelector);
  const lastElement = document.querySelector(lastElementSelector);
  const elementToFocus = document.querySelector(elementSelectorToBeFocused);

  const focusableContent = modal.querySelectorAll(focusableElements);
  const firstFocusableElement = firstElement
    ? firstElement
    : focusableContent[0];
  const lastFocusableElement = lastElement
    ? lastElement
    : focusableContent[focusableContent.length - 1];

  const prevActiveElement = document.activeElement;

  document.addEventListener("keydown", tabListener);

  function tabListener(e) {
    const modal = document.querySelector(elementId);
    if (!modal) {
      // addition check in case if some one will forget to remove trap
      removeTrap();
      return;
    }

    let isTabPressed = e.key === "Tab" || e.keyCode === 9;

    if (!isTabPressed) {
      return;
    }
    let _firstFocusableElement = firstFocusableElement;
    let _focusableContent = focusableContent;
    let _lastFocusableElement = lastFocusableElement;
    if (liveUpdateOfElementList) {
      _focusableContent = modal.querySelectorAll(focusableElements);
      _firstFocusableElement = firstElement
        ? firstElement
        : _focusableContent[0];
      _lastFocusableElement = lastElement
        ? lastElement
        : _focusableContent?.[_focusableContent.length - 1];
    }

    if (doNotAllowFrocusOutside) {
      if (
        _focusableContent &&
        !isElementInNodeList(document.activeElement, _focusableContent)
      ) {
        if (elementToFocus) {
          elementToFocus.focus();
        } else {
          _firstFocusableElement?.focus();
        }
      }
    }

    if (e.shiftKey) {
      if (document.activeElement === _firstFocusableElement) {
        _lastFocusableElement?.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === _lastFocusableElement) {
        // if focused has reached to last focusable element then focus first focusable element after pressing tab
        _firstFocusableElement?.focus(); // add focus for the first focusable element
        e.preventDefault();
      }
    }
  }

  function removeTrap() {
    document.removeEventListener("keydown", tabListener);
    document
      .querySelector("#root > div .content")
      ?.removeAttribute("aria-hidden");
    document
      .querySelector("#root > div .call-screen")
      ?.removeAttribute("aria-hidden");
    document.querySelector("#root > div .chat")?.removeAttribute("aria-hidden");
    document
      .querySelector(".guest-setting-icon")
      ?.removeAttribute("aria-hidden");
    if (foucusElemenOnExitBySelector) {
      focusElementAndIgnoreFocusStyles(
        document.querySelector(foucusElemenOnExitBySelector)
      );
    } else if (foucusPrevElemenOnExit)
      focusElementAndIgnoreFocusStyles(prevActiveElement);
  }
  if (elementToFocus) {
    focusElementAndIgnoreFocusStyles(elementToFocus);
  } else if (focusFirstElement) {
    focusElementAndIgnoreFocusStyles(firstFocusableElement);
  }
  return removeTrap;
}

export function focusElementAndIgnoreFocusStyles(element) {
  if (element?.focus) {
    element.focus();
    element.classList.add("ignore-focus-style");
    const onBlur = () => {
      element.classList.remove("ignore-focus-style");
      element.removeEventListener("blur", onBlur);
    };
    element.addEventListener("blur", onBlur);
  }
}
