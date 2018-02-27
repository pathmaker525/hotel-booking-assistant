$(function(){
  $('#gallery').hide();
  $('.btnEvent').on('click',function(e){
    $('#gallery').show();
    $('#gallery').html('<a class="btnClose" href="#" onclick="eventclose()"><p>클릭하면 창을 닫습니다</p> <img src="' + $(this).attr('data-detail') +'"/> <p>클릭하면 창을 닫습니다</p> </a>');
  });
  $('#gallery').on('click',function(e){
    eventclose();
  })
});
function eventclose(){
  $('#gallery').empty();
  $('#gallery').hide();
}
