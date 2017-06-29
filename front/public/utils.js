function gup(name, url) {
  if (!url) url = location.href;
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(url);
  return results == null ? null : results[1];
}
function httpGet(theUrl) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", theUrl, false); // false for synchronous request
  xmlHttp.send(null);
  return JSON.parse(xmlHttp.responseText);
}

var stepSlider = document.getElementById("slider-step");

noUiSlider.create(stepSlider, {
  start: [4000],
  step: 1000,
  range: {
    min: [2000],
    max: [10000]
  }
});
