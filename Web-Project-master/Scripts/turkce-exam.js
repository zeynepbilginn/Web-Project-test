(function() {
  var questions = [{
      question: "Soru1",
      choices: [0, 1, 2, 3, 4],
      correctAnswer: 0
  }, {
      question: "Soru2",
      choices: [0, 1, 2, 3, 4],
      correctAnswer: 1
  }, {
      question: "Soru3",
      choices: [0, 1, 2, 3, 4],
      correctAnswer: 2
  }, {
      question: "Soru4",
      choices: [0, 1, 2, 3, 4],
      correctAnswer: 3
  }, {
      question: "Soru5",
      choices: [0, 1, 2, 3, 4],
      correctAnswer: 4
  }];

  var questionCounter = 0; //Soru sayısını takip etmek için
  var selections = []; // Kullanıcın seçtiği seçenekler
  var quiz = $('#quiz'); //Quiz div objesi

  var scoreDB;  // Skor değerini DB'ye atmak için
  var url = (window.location).href;
  var id = url.substring(url.lastIndexOf('/') + 1);


  // sayfa ilk yüklendiğinde ekranda gözükecekler
  window.onload = function () {
      $('#next').hide();
      $('#finish-exam').hide();
      $('#go-home').hide();

  };
  // Sonraki soruları göstermek için
  $('#next').on('click', function (e) {
      e.preventDefault();
      choose();
      questionCounter++;
      displayNext();
  });

  // Click handler for the 'prev' button
  $('#prev').on('click', function (e) {
      e.preventDefault();
      choose();
      questionCounter--;
      displayNext();
  });


  // Animates buttons on hover
  $('.button').on('mouseenter', function () {
      $(this).addClass('active');
  });
  $('.button').on('mouseleave', function () {
      $(this).removeClass('active');
  });

  // Creates and returns the div that contains the questions and
  // the answer selections
  function createQuestionElement(index) {
      var qElement = $('<div>', {
          id: 'question'
      });

      var header = $('<h2>Soru ' + (index + 1) + ':</h2>');
      qElement.append(header);

      var question = $('<p>').append(questions[index].question);
      qElement.append(question);

      var radioButtons = createRadios(index);
      qElement.append(radioButtons);

      return qElement;
  }

  // Seçenekler için radio butonları
  function createRadios(index) {
      var radioList = $('<ul>');
      var item;
      var input = '';
      for (var i = 0; i < questions[index].choices.length; i++) {
          item = $('<li>');
          input = '<input type="radio" name="answer" value=' + i + ' />';
          input += questions[index].choices[i];
          item.append(input);
          radioList.append(item);
      }
      return radioList;
  }

  // Kullanıcının seçtiklerini alır diziye atar
  function choose() {
      selections[questionCounter] = +$('input[name="answer"]:checked').val();
  }

  // Sonraki soruyu göstermek için
  function displayNext() {
      quiz.fadeOut(function() {
          $('#question').remove();

          if(questionCounter < questions.length){
              var nextQuestion = createQuestionElement(questionCounter);
              quiz.append(nextQuestion).fadeIn();
              if (!(isNaN(selections[questionCounter]))) {
                  $('input[value='+selections[questionCounter]+']').prop('checked', true);
              }

              //butonları duruma göre ekranda gösterir
              if(questionCounter === 1){
                  $('#prev').show();
                  $('#start-exam').hide();
              } else if(questionCounter === 0){
                  $('#prev').hide();
                  $('#next').show();
              }
          }else {
              var scoreElem = computeScore();
              quiz.append(scoreElem).fadeIn();
              $('#next').hide();
              $('#prev').hide();
              $('#start').show();
              $('#finish-exam').hide();
              $('#go-home').show();
              timer2 = document.querySelector('#timer').textContent;
              timetoDB = parseInt(timer2);
              clearTimeout(time);

              $(document).ready(function() {
                  $("#go-home").click(function(){

                      matscore = scoreDB;

                      $.ajax({
                          url: "?matscore="+matscore+"&time="+timetoDB,
                          type: "GET",
                          success: function(response)
                          {
                              console.log("sucess!");
                          },
                          error: function(e){
                              console.log("ERROR: ", e);
                          }
                      });


                      window.location="http://localhost:8080/exam/mat/"+id+"/?matscore="+matscore+"&time="+timetoDB;


                  });
              });
          }
      });
  }



  // Skor hesaplar ve question elementinde gösterir
  function computeScore() {
      var score = $('<p>',{id: 'question'});
      var scoreWithTime = 0;
      var numCorrect = 0;

      // Kullanıcının doğru sayısını hesaplar
      for (var i = 0; i < selections.length; i++) {
          if (selections[i] === questions[i].correctAnswer) {
              numCorrect++;
          }
      }

      //  Süreyi alır int'e dönüştürür
      timer2 = document.querySelector('#timer').textContent;
      timer2 = parseInt(timer2);


      // Süreye göre kullanıcı puanını hesaplar
      if(timer2<=10){
          scoreWithTime = numCorrect * 5;
      }else if(timer2>10 && timer2<=30){
          scoreWithTime = numCorrect * 7
      }else{
          scoreWithTime = numCorrect * 10;
      }

      // Ekranda kullanıcının doğru sayısını ve skorunu gösterir
      score.append(numCorrect+' doğrunuz var. Puanınız : '+scoreWithTime);

      scoreDB = scoreWithTime;


      return score;
  }



  // Başlat butonuna tıklandığında süre başlar ve soru ekranda gözükür.
  $(document).ready(function() {
      $("#start-exam").click(function(){
          var fiftyMinutes = 60 * 50;
          display = document.querySelector('#timer');
          startTimer(fiftyMinutes, display);
          $('#start-exam').hide();
          $('#finish-exam').show();
          displayNext();
      });
  });


  // Bitir butonuna tıklandı mı diye kontrol eder tıklanmışsa zamanı alır süreyi durdurur
  function checkFinishButton(){
      $(document).ready(function() {
          $("#finish-exam").click(function(){
              timer2 = document.querySelector('#timer').textContent;
              timetoDB = parseInt(timer2);
              clearTimeout(time);
              $('#next').hide();
              $('#finish-exam').hide();
              $('#prev').hide();
              $('#go-home').show();
              // Doğru sayısını ekranda gösterir
              $('#question').remove();
              var scoreElem = computeScore();
              quiz.append(scoreElem).fadeIn();



              matscore = scoreDB;

              $.ajax({
                  url: "?matscore="+matscore+"&time="+timetoDB,
                  type: "GET",
                  success: function(response)
                  {
                      console.log("sucess!");
                  },
                  error: function(e){
                      console.log("ERROR: ", e);
                  }
              });

              document.getElementById("go-home").onclick =  function()
              {
                  window.location="http://localhost:8080/exam/mat/"+id+"/?matscore="+matscore+"&time="+timetoDB;
              }

          });
      });
  }




  checkFinishButton();
  // ---------------------- TİMER ----------------------

  function startTimer(duration, display) {
      var timer = duration, minutes, seconds;
      time = setInterval(function () {
          minutes = parseInt(timer / 60, 10);  // String to int
          seconds = parseInt(timer % 60, 10);

          minutes = minutes < 10 ? "0" + minutes : minutes;
          seconds = seconds < 10 ? "0" + seconds : seconds;

          display.textContent = minutes + ":" + seconds;

          // Süre bittiğinde
          if (--timer == -1) {
              clearTimeout(time)
              $('#next').hide();
              $('#finish-exam').hide();
              $('#prev').hide();
              $('#go-home').show();
              // Doğru sayısını ekranda gösterir
              $('#question').remove();
              var scoreElem = computeScore();
              quiz.append(scoreElem).fadeIn();

              $(document).ready(function() {
                  $("#go-home").click(function(){

                      matscore = scoreDB;

                      $.ajax({
                          url: "?matscore="+matscore+"&time="+0,
                          type: "GET",
                          success: function(response)
                          {
                              console.log("sucess!");
                          },
                          error: function(e){
                              console.log("ERROR: ", e);
                          }
                      });


                      window.location="http://localhost:8080/exam/mat/"+id+"/?matscore="+matscore+"&time="+0;


                  });
              });

          }

      }, 1000);
  }
})();