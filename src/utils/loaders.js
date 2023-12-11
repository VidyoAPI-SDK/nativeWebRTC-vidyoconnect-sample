export function loadScript(url, module) {
  return new Promise(function (resolve, reject) {
    const script = document.createElement("script");
    script.async = true;
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    if (module) {
      script.type = "module";
    }
    document.head.appendChild(script);
  });
}

export function loadStyles(url) {
  return new Promise(function (resolve, reject) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
}

export default loadScript;
