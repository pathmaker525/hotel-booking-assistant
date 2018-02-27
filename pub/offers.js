$(function(){
  $('#gallery').hide();
  $('.btnEvent').on('click',function(e){
    openGallery('/pub/' + $(this).attr('data-detail'));
  });
  $('#gallery').on('click',function(e){
    eventclose();
  })
  if($('#gallery').attr('data-init')){
    openGallery('/pub/' + $('#gallery').attr('data-init'));
  }
  $('span').each(function(index){
    console.log(/^(.*)GMT/g.exec($(this).html())[1]);
    $(this).html(moment(/^(.*)GMT/g.exec($(this).html())[1]).format('YYYY-MM-DD'));
  });
});

function openGallery(targetUrl){
  $('#gallery').show();
  $('#gallery').html('<a class="btnClose" href="#" onclick="eventclose()"><p>클릭하면 창을 닫습니다</p> <img src="' + targetUrl +'"/> <p>클릭하면 창을 닫습니다</p> </a>');
}

function eventclose(){
  $('#gallery').empty();
  $('#gallery').hide();
}
