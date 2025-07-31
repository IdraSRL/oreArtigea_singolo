// input-date-polyfill.js v1.0
// Generic Date input fallback using Flatpickr
(function() {
  var testInput = document.createElement('input');
  testInput.setAttribute('type','date');
  var notADateValue = 'not-a-date';
  testInput.setAttribute('value', notADateValue);
  if (testInput.value === notADateValue) {
    // No native support, apply Flatpickr to all date inputs
    var inputs = document.querySelectorAll('input[type="date"]');
    inputs.forEach(function(i) {
      // Change to text to allow custom picker
      i.type = 'text';
      if (window.flatpickr) {
        flatpickr(i, {
          altInput: true,
          altFormat: "d-m-Y",
          dateFormat: "Y-m-d"
        });
      }
    });
  }
})();
