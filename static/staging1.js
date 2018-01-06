function startTimer(duration, display) {
  var start = Date.now(),
      diff,
      minutes,
      seconds;
  function timer() {
      // get the number of seconds that have elapsed since
      // startTimer() was called
      diff = duration - (((Date.now() - start) / 1000) | 0);

      // does the same job as parseInt truncates the float
      minutes = (diff / 60) | 0;
      seconds = (diff % 60) | 0;

      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      if (diff >= 0) {
        display.textContent = minutes + ":" + seconds;
      }

      else {
          // add one second so that the count down starts at the full duration
          // example 05:00 not 04:59

          $('<img>', {
            src : "https://media.giphy.com/media/12KiGLydHEdak8/giphy.gif"
          }).appendTo('#explosion')

          //start = Date.now() + 1000;
      }
  };
  // we don't want to wait a full second before the timer starts

  timer();
  setInterval(timer, 15000);
}
